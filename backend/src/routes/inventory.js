const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole, requireBranchAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

function computeStatus(quantity, threshold) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

function enrichRows(rows) {
  return rows.map(r => ({
    ...r,
    status: computeStatus(r.quantity, r.low_stock_threshold),
  }));
}

function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function normalizeQuantity(value, fallback = 0) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
}

function optionalDbValue(value) {
  return value === undefined ? null : value;
}

function computeInventoryAlertStatus({ quantity, threshold, rawStatus }) {
  const normalizedStatus = String(rawStatus || '').toLowerCase();
  const numericQuantity = Number(quantity || 0);
  const numericThreshold = Number(threshold || 0);

  if (
    normalizedStatus === 'out of stock' ||
    normalizedStatus === 'expired' ||
    normalizedStatus === 'damaged' ||
    normalizedStatus === 'needs repair' ||
    numericQuantity <= 0
  ) {
    return 'out_of_stock';
  }

  if (
    normalizedStatus === 'low stock' ||
    normalizedStatus === 'maintenance' ||
    normalizedStatus === 'under maintenance' ||
    (numericThreshold > 0 && numericQuantity <= numericThreshold)
  ) {
    return 'low_stock';
  }

  return 'healthy';
}

function getInventoryConfig(category) {
  const configs = {
    supply: {
      table: 'supplies',
      nameColumn: 'supply_name',
      statusExpression: 'NULL',
      label: 'Supply',
    },
    supplies: {
      table: 'supplies',
      nameColumn: 'supply_name',
      statusExpression: 'NULL',
      label: 'Supply',
    },
    medicine: {
      table: 'medicines',
      nameColumn: 'medicine_name',
      statusExpression: 'NULL',
      label: 'Medicine',
    },
    equipment: {
      table: 'equipment',
      nameColumn: 'equipment_name',
      statusExpression: 'i.maintenance_status',
      label: 'Equipment',
    },
  };

  return configs[category];
}

async function fetchInventoryAlertRow(executor, category, id) {
  const config = getInventoryConfig(category);
  if (!config) {
    return null;
  }

  const [rows] = await executor.query(
    `SELECT i.id, i.branch_id, b.name AS branch_name,
            i.${config.nameColumn} AS item_name,
            i.quantity, i.low_stock_threshold,
            ${config.statusExpression} AS raw_status
     FROM ${config.table} i
     JOIN branches b ON b.id = i.branch_id
     WHERE i.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  return {
    ...rows[0],
    category,
    categoryLabel: config.label,
    alertStatus: computeInventoryAlertStatus({
      quantity: rows[0].quantity,
      threshold: rows[0].low_stock_threshold,
      rawStatus: rows[0].raw_status,
    }),
  };
}

async function createInventoryStatusNotifications(executor, previousRow, nextRow) {
  if (!nextRow) {
    return;
  }

  const previousStatus = previousRow?.alertStatus || 'unknown';
  const nextStatus = nextRow.alertStatus;

  if (previousStatus === nextStatus || nextStatus === 'healthy') {
    return;
  }

  const [admins] = await executor.query(
    `SELECT id
     FROM users
     WHERE role = 'admin' AND status = 'Active'`
  );

  if (!admins.length) {
    // Still continue for branch receptionists even if there are no admins.
  }

  const statusLabel =
    nextStatus === 'out_of_stock' ? 'Out of Stock' : 'Low Stock';
  const title =
    nextStatus === 'out_of_stock' ? 'Out of Stock Alert' : 'Low Stock Alert';
  const body =
    `${nextRow.categoryLabel} "${nextRow.item_name}" at ${nextRow.branch_name} ` +
    `is now ${statusLabel.toLowerCase()} (${Number(nextRow.quantity || 0)} remaining).`;

  if (admins.length > 0) {
    await executor.query(
      `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
       VALUES ${admins.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
      admins.flatMap((admin) => [
        admin.id,
        nextStatus,
        title,
        body,
        'inventory',
        nextRow.id,
      ])
    );
  }

  // Branch-scoped receptionists: only notify receptionists assigned to the inventory item's branch.
  const [receptionists] = await executor.query(
    `SELECT DISTINCT u.id
     FROM users u
     LEFT JOIN user_branches ub ON ub.user_id = u.id
     WHERE u.role = 'receptionist'
       AND u.status = 'Active'
       AND (u.home_branch_id = ? OR ub.branch_id = ?)`,
    [nextRow.branch_id, nextRow.branch_id]
  );

  if (receptionists.length > 0) {
    await executor.query(
      `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
       VALUES ${receptionists.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
      receptionists.flatMap((r) => [
        r.id,
        nextStatus,
        title,
        body,
        'inventory',
        nextRow.id,
      ])
    );
  }
}

function validateBranchAccess(req, branchId) {
  const userBranches = req.user.branches || [];
  if (req.user.role === 'admin') return true;
  return userBranches.includes(branchId);
}

function inventoryBranchFilter(req, requestedBranchId) {
  const userBranches = req.user.branches || [];

  if (requestedBranchId) {
    const branchId = parseInt(requestedBranchId, 10);
    if (!branchId) {
      const err = new Error('Invalid branch_id');
      err.statusCode = 400;
      throw err;
    }
    if (!validateBranchAccess(req, branchId)) {
      const err = new Error('No access to this branch');
      err.statusCode = 403;
      throw err;
    }
    return { clause: 'i.branch_id = ?', params: [branchId] };
  }

  if (req.user.role === 'admin') {
    return { clause: '1 = 1', params: [] };
  }

  if (userBranches.length === 0) {
    const err = new Error('No branch access');
    err.statusCode = 403;
    throw err;
  }

  return {
    clause: `i.branch_id IN (${userBranches.map(() => '?').join(',')})`,
    params: userBranches,
  };
}

// ─────────────────────────────────────────────────────────────
// SUPPLIES
// ─────────────────────────────────────────────────────────────

router.get('/supplies', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);
    const [rows] = await pool.query(
      `SELECT i.id, i.branch_id, b.name AS branch_name, b.address AS branch_address, i.supply_name, i.brand,
              i.supplier, i.category, i.unit, i.quantity, i.price_per_item, i.low_stock_threshold,
              i.created_at, i.updated_at
       FROM supplies i
       JOIN branches b ON b.id = i.branch_id
       WHERE ${branch.clause}
       ORDER BY supply_name ASC`,
      branch.params
    );
    res.json({ supplies: enrichRows(rows) });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.post('/supplies', requireRole('receptionist', 'admin'), async (req, res) => {
  const { branch_id, supply_name, brand, supplier, category, unit, quantity, price_per_item } = req.body;

  if (!branch_id || !supply_name || !unit) {
    return res.status(400).json({ message: 'branch_id, supply_name, and unit are required' });
  }
  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO supplies (branch_id, supply_name, brand, supplier, category, unit, quantity, price_per_item, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10)`,
      [branch_id, supply_name, brand || null, supplier || null, category || null, unit, quantity || 0, normalizePrice(price_per_item)]
    );
    res.status(201).json({ id: result.insertId, message: 'Supply added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/supplies/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { supply_name, brand, supplier, category, unit, quantity, price_per_item } = req.body;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'supply', id);
    if (!existing) return res.status(404).json({ message: 'Supply not found' });
    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE supplies SET
        supply_name = COALESCE(?, supply_name),
        brand = COALESCE(?, brand),
        supplier = COALESCE(?, supplier),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        quantity = COALESCE(?, quantity),
       price_per_item = COALESCE(?, price_per_item)
       WHERE id = ?`,
      [
        optionalDbValue(supply_name),
        optionalDbValue(brand),
        optionalDbValue(supplier),
        optionalDbValue(category),
        optionalDbValue(unit),
        optionalDbValue(quantity),
        optionalDbValue(price_per_item),
        id,
      ]
    );
    const updated = await fetchInventoryAlertRow(pool, 'supply', id);
    await createInventoryStatusNotifications(pool, existing, updated);
    res.json({ message: 'Supply updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/supplies/:id/restock', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  try {
    const existing = await fetchInventoryAlertRow(pool, 'supply', id);
    if (!existing) return res.status(404).json({ message: 'Supply not found' });
    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query('UPDATE supplies SET quantity = quantity + ? WHERE id = ?', [amount, id]);
    const updated = await fetchInventoryAlertRow(pool, 'supply', id);
    await createInventoryStatusNotifications(pool, existing, updated);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
      VALUES (?, 'inventory_restock', ?)`,
      [req.user.user_id, JSON.stringify({ category: 'supply', supply_id: id, amount })]
    );

    res.json({ message: 'Restocked', new_quantity: Number(existing.quantity || 0) + amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/supplies/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.query('DELETE FROM supplies WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supply not found' });
    res.json({ message: 'Supply deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// MEDICINES
// ─────────────────────────────────────────────────────────────

router.get('/medicines', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);
    const [rows] = await pool.query(
      `SELECT i.id, i.branch_id, b.name AS branch_name, b.address AS branch_address, i.medicine_name, i.generic_name,
              i.category, i.form, i.dosage, i.brand, i.supplier, i.unit, i.quantity, i.price_per_item,
              i.low_stock_threshold, i.created_at, i.updated_at
       FROM medicines i
       JOIN branches b ON b.id = i.branch_id
       WHERE ${branch.clause}
       ORDER BY medicine_name ASC`,
      branch.params
    );
    res.json({ medicines: enrichRows(rows) });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.post('/medicines', requireRole('receptionist', 'admin'), async (req, res) => {
  const { branch_id, medicine_name, generic_name, category, form, dosage, brand, supplier, unit, quantity, price_per_item } = req.body;

  if (!branch_id || !medicine_name || !unit) {
    return res.status(400).json({ message: 'branch_id, medicine_name, and unit are required' });
  }
  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO medicines (branch_id, medicine_name, generic_name, category, form, dosage, brand, supplier, unit, quantity, price_per_item, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10)`,
      [branch_id, medicine_name, generic_name || null, category || null, form || null, dosage || null, brand || null, supplier || null, unit, quantity || 0, normalizePrice(price_per_item)]
    );
    res.status(201).json({ id: result.insertId, message: 'Medicine added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/medicines/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { medicine_name, generic_name, category, form, dosage, brand, supplier, unit, quantity, price_per_item } = req.body;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'medicine', id);
    if (!existing) return res.status(404).json({ message: 'Medicine not found' });
    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE medicines SET
        medicine_name = COALESCE(?, medicine_name),
        generic_name = COALESCE(?, generic_name),
        category = COALESCE(?, category),
        form = COALESCE(?, form),
        dosage = COALESCE(?, dosage),
        brand = COALESCE(?, brand),
        supplier = COALESCE(?, supplier),
        unit = COALESCE(?, unit),
        quantity = COALESCE(?, quantity),
       price_per_item = COALESCE(?, price_per_item)
       WHERE id = ?`,
      [
        optionalDbValue(medicine_name),
        optionalDbValue(generic_name),
        optionalDbValue(category),
        optionalDbValue(form),
        optionalDbValue(dosage),
        optionalDbValue(brand),
        optionalDbValue(supplier),
        optionalDbValue(unit),
        optionalDbValue(quantity),
        optionalDbValue(price_per_item),
        id,
      ]
    );
    const updated = await fetchInventoryAlertRow(pool, 'medicine', id);
    await createInventoryStatusNotifications(pool, existing, updated);
    res.json({ message: 'Medicine updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/medicines/:id/restock', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  try {
    const existing = await fetchInventoryAlertRow(pool, 'medicine', id);
    if (!existing) return res.status(404).json({ message: 'Medicine not found' });
    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query('UPDATE medicines SET quantity = quantity + ? WHERE id = ?', [amount, id]);
    const updated = await fetchInventoryAlertRow(pool, 'medicine', id);
    await createInventoryStatusNotifications(pool, existing, updated);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
      VALUES (?, 'inventory_restock', ?)`,
      [req.user.user_id, JSON.stringify({ category: 'medicine', medicine_id: id, amount })]
    );

    res.json({ message: 'Restocked', new_quantity: Number(existing.quantity || 0) + amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/medicines/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.query('DELETE FROM medicines WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// EQUIPMENT
// ─────────────────────────────────────────────────────────────

router.get('/equipment', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);
    const [rows] = await pool.query(
      `SELECT e.id, e.branch_id, b.name AS branch_name, b.address AS branch_address, e.equipment_name, e.brand, e.supplier, e.category, e.model_number,
              e.serial_number, e.location, e.purchase_date, e.warranty_date,
              e.last_maintenance, e.next_maintenance, e.maintenance_status,
              e.assigned_to, u.name AS assigned_to_name,
              e.quantity, e.price_per_item, e.low_stock_threshold, e.created_at, e.updated_at
       FROM equipment e
       JOIN branches b ON b.id = e.branch_id
       LEFT JOIN users u ON u.id = e.assigned_to
       WHERE ${branch.clause.replaceAll('i.', 'e.')}
       ORDER BY e.equipment_name ASC`,
      branch.params
    );
    res.json({
      equipment: enrichRows(rows).map((row) => ({
        ...row,
        status: row.maintenance_status || row.status,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.post('/equipment', requireRole('receptionist', 'admin'), async (req, res) => {
  const {
    branch_id, equipment_name, brand, supplier, category, model_number, serial_number,
    location, purchase_date, warranty_date, last_maintenance, next_maintenance,
    maintenance_status, assigned_to, quantity, price_per_item,
  } = req.body;

  if (!branch_id || !equipment_name) {
    return res.status(400).json({ message: 'branch_id and equipment_name are required' });
  }
  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO equipment (branch_id, equipment_name, brand, supplier, category, model_number,
                              serial_number, location, purchase_date, warranty_date,
                              last_maintenance, next_maintenance, maintenance_status,
                              assigned_to, quantity, price_per_item, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        branch_id, equipment_name, brand || null, supplier || null, category || null, model_number || null,
        serial_number || null, location || null, purchase_date || null, warranty_date || null,
        last_maintenance || null, next_maintenance || null, maintenance_status || 'Available',
        assigned_to || null, quantity || 1, normalizePrice(price_per_item), 1,
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Equipment added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/equipment/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    equipment_name, brand, supplier, category, model_number, serial_number,
    location, purchase_date, warranty_date, last_maintenance, next_maintenance,
    maintenance_status, assigned_to, quantity, price_per_item,
  } = req.body;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'equipment', id);
    if (!existing) return res.status(404).json({ message: 'Equipment not found' });
    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE equipment SET
        equipment_name = COALESCE(?, equipment_name),
        brand = COALESCE(?, brand),
        supplier = COALESCE(?, supplier),
        category = COALESCE(?, category),
        model_number = COALESCE(?, model_number),
        serial_number = COALESCE(?, serial_number),
        location = COALESCE(?, location),
        purchase_date = COALESCE(?, purchase_date),
        warranty_date = COALESCE(?, warranty_date),
        last_maintenance = COALESCE(?, last_maintenance),
        next_maintenance = COALESCE(?, next_maintenance),
        maintenance_status = COALESCE(?, maintenance_status),
        assigned_to = COALESCE(?, assigned_to),
        quantity = COALESCE(?, quantity),
        price_per_item = COALESCE(?, price_per_item)
       WHERE id = ?`,
      [
        optionalDbValue(equipment_name),
        optionalDbValue(brand),
        optionalDbValue(supplier),
        optionalDbValue(category),
        optionalDbValue(model_number),
        optionalDbValue(serial_number),
        optionalDbValue(location),
        optionalDbValue(purchase_date),
        optionalDbValue(warranty_date),
        optionalDbValue(last_maintenance),
        optionalDbValue(next_maintenance),
        optionalDbValue(maintenance_status),
        optionalDbValue(assigned_to),
        optionalDbValue(quantity),
        optionalDbValue(price_per_item),
        id,
      ]
    );
    const updated = await fetchInventoryAlertRow(pool, 'equipment', id);
    await createInventoryStatusNotifications(pool, existing, updated);
    res.json({ message: 'Equipment updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/equipment/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.query('DELETE FROM equipment WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// LOW STOCK SUMMARY (across categories, for dashboard)
// ─────────────────────────────────────────────────────────────

router.post('/purchase-expenses', requireRole('admin'), async (req, res) => {
  const {
    branch_id,
    category,
    itemName,
    supplier,
    orderQuantity,
    pricePerItem,
    date,
  } = req.body;

  const branchId = Number.parseInt(branch_id, 10);
  const itemNameValue = String(itemName || '').trim();
  const quantity = normalizeQuantity(orderQuantity, 0);
  const price = normalizePrice(pricePerItem);
  const expenseDate = date || new Date().toISOString().slice(0, 10);

  const categoryConfig = {
    medicine: {
      table: 'medicines',
      idKey: 'medicine_id',
      nameColumn: 'medicine_name',
      insertSql:
        `INSERT INTO medicines
         (branch_id, medicine_name, supplier, unit, quantity, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, 'pcs', ?, ?, 10)`,
    },
    equipment: {
      table: 'equipment',
      idKey: 'equipment_id',
      nameColumn: 'equipment_name',
      insertSql:
        `INSERT INTO equipment
         (branch_id, equipment_name, supplier, quantity, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, 1)`,
    },
    supplies: {
      table: 'supplies',
      idKey: 'supply_id',
      nameColumn: 'supply_name',
      insertSql:
        `INSERT INTO supplies
         (branch_id, supply_name, supplier, unit, quantity, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, 'pcs', ?, ?, 10)`,
    },
  };

  const config = categoryConfig[category];

  if (!branchId || !config || !itemNameValue || !quantity) {
    return res.status(400).json({
      message: 'branch_id, category, itemName, orderQuantity, and pricePerItem are required',
    });
  }

  if (!validateBranchAccess(req, branchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT id, quantity FROM ${config.table}
       WHERE branch_id = ? AND LOWER(${config.nameColumn}) = LOWER(?)
       LIMIT 1
       FOR UPDATE`,
      [branchId, itemNameValue]
    );

    let inventoryId;
    let newQuantity;

    if (existingRows.length) {
      const previousRow = await fetchInventoryAlertRow(connection, category, existingRows[0].id);
      inventoryId = existingRows[0].id;
      newQuantity = Number(existingRows[0].quantity || 0) + quantity;

      await connection.query(
        `UPDATE ${config.table}
         SET quantity = quantity + ?,
             supplier = COALESCE(NULLIF(?, ''), supplier),
             price_per_item = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [quantity, supplier || '', price, inventoryId]
      );
      const updatedRow = await fetchInventoryAlertRow(connection, category, inventoryId);
      await createInventoryStatusNotifications(connection, previousRow, updatedRow);
    } else {
      const [insertResult] = await connection.query(config.insertSql, [
        branchId,
        itemNameValue,
        supplier || null,
        quantity,
        price,
      ]);
      inventoryId = insertResult.insertId;
      newQuantity = quantity;
      const createdRow = await fetchInventoryAlertRow(connection, category, inventoryId);
      await createInventoryStatusNotifications(connection, null, createdRow);
    }

    const totalExpense = quantity * price;

    const [expenseResult] = await connection.query(
      `INSERT INTO clinic_expenses (
         branch_id, category, description, amount, expense_date, recorded_by, status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'recorded')`,
      [
        branchId,
        category,
        `${itemNameValue} x ${quantity}`,
        totalExpense,
        expenseDate,
        req.user.user_id,
      ]
    );

    await connection.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'inventory_purchase_expense', ?, ?)`,
      [
        req.user.user_id,
        branchId,
        JSON.stringify({
          category,
          [config.idKey]: inventoryId,
          item_name: itemNameValue,
          supplier: supplier || null,
          quantity_added: quantity,
          price_per_item: price,
          total_expense: totalExpense,
          expense_id: expenseResult.insertId,
        }),
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Expense saved and inventory updated.',
      expense_id: expenseResult.insertId,
      inventory_id: inventoryId,
      new_quantity: newQuantity,
      price_per_item: price,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

router.get('/low-stock-summary', async (req, res) => {
  const branchId = parseInt(req.query.branch_id, 10);
  if (!branchId) {
    return res.status(400).json({ message: 'branch_id query param is required' });
  }
  if (!validateBranchAccess(req, branchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [supplies] = await pool.query(
      `SELECT id, supply_name AS name, quantity, low_stock_threshold
       FROM supplies WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );
    const [medicines] = await pool.query(
      `SELECT id, medicine_name AS name, quantity, low_stock_threshold
       FROM medicines WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );
    const [equipment] = await pool.query(
      `SELECT id, equipment_name AS name, quantity, low_stock_threshold
       FROM equipment WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );

    res.json({
      branch_id: branchId,
      total: supplies.length + medicines.length + equipment.length,
      supplies: supplies.map(s => ({ ...s, category: 'supply', status: computeStatus(s.quantity, s.low_stock_threshold) })),
      medicines: medicines.map(m => ({ ...m, category: 'medicine', status: computeStatus(m.quantity, m.low_stock_threshold) })),
      equipment: equipment.map(e => ({ ...e, category: 'equipment', status: computeStatus(e.quantity, e.low_stock_threshold) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// SERVICE KIT LOOKUP — what should we pre-fill?
// ─────────────────────────────────────────────────────────────

router.get('/service-kits/:serviceId', async (req, res) => {
  const serviceId = parseInt(req.params.serviceId, 10);
  const branchId = parseInt(req.query.branch_id, 10);

  if (!branchId) {
    return res.status(400).json({ message: 'branch_id query param is required' });
  }
  if (!validateBranchAccess(req, branchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [kitRows] = await pool.query(
      `SELECT id, service_id, notes FROM service_kits WHERE service_id = ?`,
      [serviceId]
    );

    if (kitRows.length === 0) {
      return res.json({
        service_id: serviceId,
        kit_exists: false,
        items: [],
        message: 'No kit defined for this service. Dentist will enter items manually.',
      });
    }

    const kit = kitRows[0];

    const [items] = await pool.query(
      `SELECT id, category, item_name, default_quantity
       FROM service_kit_items
       WHERE service_kit_id = ?`,
      [kit.id]
    );

    const resolved = [];
    for (const item of items) {
      let inventoryRow = null;
      if (item.category === 'supply') {
        const [r] = await pool.query(
          `SELECT id, supply_name AS name, quantity, low_stock_threshold, unit
           FROM supplies WHERE branch_id = ? AND supply_name = ? LIMIT 1`,
          [branchId, item.item_name]
        );
        inventoryRow = r[0] || null;
      } else if (item.category === 'medicine') {
        const [r] = await pool.query(
          `SELECT id, medicine_name AS name, quantity, low_stock_threshold, unit
           FROM medicines WHERE branch_id = ? AND medicine_name = ? LIMIT 1`,
          [branchId, item.item_name]
        );
        inventoryRow = r[0] || null;
      } else if (item.category === 'equipment') {
        const [r] = await pool.query(
          `SELECT id, equipment_name AS name, quantity, low_stock_threshold,
                  COALESCE(maintenance_status, 'Available') AS unit
           FROM equipment WHERE branch_id = ? AND equipment_name = ? LIMIT 1`,
          [branchId, item.item_name]
        );
        inventoryRow = r[0] || null;
      }

      resolved.push({
        category: item.category,
        item_name: item.item_name,
        default_quantity: item.default_quantity,
        inventory_id: inventoryRow ? inventoryRow.id : null,
        current_stock: inventoryRow ? inventoryRow.quantity : null,
        unit: inventoryRow ? inventoryRow.unit : null,
        available: inventoryRow !== null,
        sufficient: inventoryRow !== null && inventoryRow.quantity >= item.default_quantity,
      });
    }

    res.json({
      service_id: serviceId,
      kit_id: kit.id,
      kit_exists: true,
      notes: kit.notes,
      items: resolved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// CONSUMPTION LOOKUP — what was used for a completed appointment?
// ─────────────────────────────────────────────────────────────

router.get('/appointments/:appointmentId/consumption', async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    const [apptRows] = await pool.query(
      `SELECT id, dentist_id, branch_id, status FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    if (apptRows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRows[0];

    if (role === 'dentist' && appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if ((role === 'receptionist' || role === 'admin') && !validateBranchAccess(req, appt.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const [items] = await pool.query(
      `SELECT category, item_id, item_name, quantity_used
       FROM appointment_consumption WHERE appointment_id = ?`,
      [appointmentId]
    );

    res.json({ appointment_id: appointmentId, submitted: items.length > 0, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// CONSUMPTION SUBMISSION — decrement inventory atomically
// ─────────────────────────────────────────────────────────────

router.post('/appointments/:appointmentId/consumption', requireRole('dentist'), async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const { items, mark_complete } = req.body;
  const userId = req.user.user_id;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'items must be an array' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [apptRows] = await conn.query(
      `SELECT id, dentist_id, branch_id, status FROM appointments WHERE id = ? FOR UPDATE`,
      [appointmentId]
    );
    if (apptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRows[0];

    if (appt.dentist_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ message: 'You are not the dentist for this appointment' });
    }

    if (!validateBranchAccess(req, appt.branch_id)) {
      await conn.rollback();
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const [existing] = await conn.query(
      `SELECT id FROM appointment_consumption WHERE appointment_id = ? LIMIT 1`,
      [appointmentId]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: 'Consumption already recorded for this appointment' });
    }

    const decrementResults = [];
    for (const item of items) {
      const { category, inventory_id, quantity_used } = item;

      if (!category || !inventory_id || !quantity_used || quantity_used <= 0) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Each item needs category, inventory_id, and positive quantity_used',
        });
      }

      const validCategories = { supply: 'supplies', medicine: 'medicines', equipment: 'equipment' };
      const nameColumns = { supply: 'supply_name', medicine: 'medicine_name', equipment: 'equipment_name' };

      if (!validCategories[category]) {
        await conn.rollback();
        return res.status(400).json({ message: `Invalid category: ${category}` });
      }

      const table = validCategories[category];
      const nameCol = nameColumns[category];

      const [invRows] = await conn.query(
        `SELECT id, branch_id, ${nameCol} AS name, quantity
         FROM ${table} WHERE id = ? FOR UPDATE`,
        [inventory_id]
      );
      if (invRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `${category} id ${inventory_id} not found` });
      }
      const invItem = invRows[0];
      const previousInventoryRow = await fetchInventoryAlertRow(conn, category, inventory_id);

      if (invItem.branch_id !== appt.branch_id) {
        await conn.rollback();
        return res.status(400).json({
          message: `${invItem.name} is not at this appointment's branch`,
        });
      }

      if (invItem.quantity < quantity_used) {
        await conn.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${invItem.name}: have ${invItem.quantity}, need ${quantity_used}`,
        });
      }

      await conn.query(
        `UPDATE ${table} SET quantity = quantity - ? WHERE id = ?`,
        [quantity_used, inventory_id]
      );
      const updatedInventoryRow = await fetchInventoryAlertRow(conn, category, inventory_id);
      await createInventoryStatusNotifications(conn, previousInventoryRow, updatedInventoryRow);

      await conn.query(
        `INSERT INTO appointment_consumption (appointment_id, category, item_id, item_name, quantity_used, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appointmentId, category, inventory_id, invItem.name, quantity_used, userId]
      );

      decrementResults.push({
        category,
        item_id: inventory_id,
        item_name: invItem.name,
        quantity_used,
        new_quantity: invItem.quantity - quantity_used,
      });
    }

    if (mark_complete && appt.status === 'scheduled') {
      await conn.query(
        `UPDATE appointments SET status = 'completed' WHERE id = ?`,
        [appointmentId]
      );
    }

    await conn.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_consumption', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({
        appointment_id: appointmentId,
        items_count: items.length,
        items: decrementResults,
      })]
    );

    await conn.commit();

    res.json({
      message: 'Consumption recorded',
      appointment_id: appointmentId,
      status: mark_complete ? 'completed' : appt.status,
      items: decrementResults,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
