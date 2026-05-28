const express = require('express');
const pool = require('../config/db');
<<<<<<< HEAD
const { authenticate, requireRole } = require('../middleware/auth');
=======
const { authenticate, requireRole, requireBranchAccess } = require('../middleware/auth');
const { getServiceKitAvailability, getServiceKitRows } = require('../utils/serviceKitAvailability');
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52

const router = express.Router();

router.use(authenticate);

function computeStatus(quantity, threshold) {
  const qty = Number(quantity || 0);
  const limit = Number(threshold || 0);

  if (qty === 0) return 'Out of Stock';
  if (limit > 0 && qty <= limit) return 'Low Stock';
  return 'In Stock';
}

function computeStockPercentage(quantity, maximumStock) {
  const qty = Number(quantity || 0);
  const max = Number(maximumStock || 0);

  if (max <= 0) return null;

  return Number(Math.min(100, Math.max(0, (qty / max) * 100)).toFixed(2));
}

function enrichRows(rows) {
  return rows.map((row) => {
    const maximumStock = Number(row.maximum_stock || 0);

    return {
      ...row,
      maximum_stock: maximumStock > 0 ? maximumStock : null,
      stock_percentage:
        row.stock_percentage !== null && row.stock_percentage !== undefined
          ? Number(row.stock_percentage)
          : computeStockPercentage(row.quantity, maximumStock),
      status: computeStatus(row.quantity, row.low_stock_threshold),
    };
  });
}

function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function normalizeQuantity(value, fallback = 0) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
}

function normalizeMaximumStock(value, fallback = 20) {
  const maxStock = Number.parseInt(value, 10);
  return Number.isFinite(maxStock) && maxStock > 0 ? maxStock : fallback;
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
    `SELECT 
        i.id,
        i.branch_id,
        b.name AS branch_name,
        i.${config.nameColumn} AS item_name,
        i.quantity,
        i.low_stock_threshold,
        i.maximum_stock,
        i.stock_percentage,
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
  if (!nextRow) return;

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
      receptionists.flatMap((receptionist) => [
        receptionist.id,
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
  return userBranches.includes(Number(branchId));
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

function usageHistoryBranchFilter(req, requestedBranchId) {
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

    return { clause: 'h.branch_id = ?', params: [branchId] };
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
    clause: `h.branch_id IN (${userBranches.map(() => '?').join(',')})`,
    params: userBranches,
  };
}

router.get('/supplies', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);

    const [rows] = await pool.query(
      `SELECT 
          i.id,
          i.branch_id,
          b.name AS branch_name,
          b.address AS branch_address,
          i.supply_name,
          i.brand,
          i.supplier,
          i.category,
          i.unit,
          i.quantity,
          i.maximum_stock,
          i.stock_percentage,
          i.price_per_item,
          i.low_stock_threshold,
          i.created_at,
          i.updated_at
       FROM supplies i
       JOIN branches b ON b.id = i.branch_id
       WHERE ${branch.clause}
       ORDER BY i.supply_name ASC`,
      branch.params
    );

    res.json({ supplies: enrichRows(rows) });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.post('/supplies', requireRole('receptionist', 'admin'), async (req, res) => {
  const {
    branch_id,
    supply_name,
    brand,
    supplier,
    category,
    unit,
    quantity,
    maximum_stock,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  if (!branch_id || !supply_name || !unit) {
    return res.status(400).json({
      message: 'branch_id, supply_name, and unit are required',
    });
  }

  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  const qty = Number(quantity || 0);
  const maxStock = normalizeMaximumStock(maximum_stock, Math.max(qty, 20));
  const threshold = Number(low_stock_threshold || 10);

  if (qty > maxStock) {
    return res.status(400).json({
      message: `Quantity cannot exceed maximum stock of ${maxStock}.`,
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO supplies (
         branch_id,
         supply_name,
         brand,
         supplier,
         category,
         unit,
         quantity,
         maximum_stock,
         price_per_item,
         low_stock_threshold
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        branch_id,
        supply_name,
        brand || null,
        supplier || null,
        category || null,
        unit,
        qty,
        maxStock,
        normalizePrice(price_per_item),
        threshold,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Supply added',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/supplies/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const {
    supply_name,
    brand,
    supplier,
    category,
    unit,
    quantity,
    maximum_stock,
    max_stock_threshold,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  const nextMaxStock =
    maximum_stock !== undefined ? maximum_stock : max_stock_threshold;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'supply', id);

    if (!existing) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const finalQuantity =
      quantity !== undefined ? Number(quantity) : Number(existing.quantity || 0);

    const finalMaximumStock =
      nextMaxStock !== undefined
        ? Number(nextMaxStock)
        : Number(existing.maximum_stock || 0);

    if (finalMaximumStock > 0 && finalQuantity > finalMaximumStock) {
      return res.status(400).json({
        message: `Quantity cannot exceed maximum stock of ${finalMaximumStock}.`,
      });
    }

    await pool.query(
      `UPDATE supplies SET
        supply_name = COALESCE(?, supply_name),
        brand = COALESCE(?, brand),
        supplier = COALESCE(?, supplier),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        quantity = COALESCE(?, quantity),
        maximum_stock = COALESCE(?, maximum_stock),
        price_per_item = COALESCE(?, price_per_item),
        low_stock_threshold = COALESCE(?, low_stock_threshold)
       WHERE id = ?`,
      [
        optionalDbValue(supply_name),
        optionalDbValue(brand),
        optionalDbValue(supplier),
        optionalDbValue(category),
        optionalDbValue(unit),
        optionalDbValue(quantity),
        optionalDbValue(nextMaxStock),
        optionalDbValue(price_per_item),
        optionalDbValue(low_stock_threshold),
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
  const amount = Number(req.body.amount || 0);

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: 'amount must be a positive number',
    });
  }

  try {
    const existing = await fetchInventoryAlertRow(pool, 'supply', id);

    if (!existing) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const currentQuantity = Number(existing.quantity || 0);
    const maximumStock = Number(existing.maximum_stock || 0);

    if (maximumStock > 0 && currentQuantity + amount > maximumStock) {
      return res.status(400).json({
        message: `Cannot restock. This will exceed the maximum stock of ${maximumStock}. Current quantity is ${currentQuantity}.`,
      });
    }

    await pool.query(
      `UPDATE supplies 
       SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [amount, id]
    );

    const updated = await fetchInventoryAlertRow(pool, 'supply', id);
    await createInventoryStatusNotifications(pool, existing, updated);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'inventory_restock', ?)`,
      [
        req.user.user_id,
        JSON.stringify({
          category: 'supply',
          supply_id: id,
          amount,
        }),
      ]
    );

    res.json({
      message: 'Restocked',
      new_quantity: currentQuantity + amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/supplies/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.query(
      'DELETE FROM supplies WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    res.json({ message: 'Supply deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/medicines', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);

    const [rows] = await pool.query(
      `SELECT 
          i.id,
          i.branch_id,
          b.name AS branch_name,
          b.address AS branch_address,
          i.medicine_name,
          i.generic_name,
          i.category,
          i.form,
          i.dosage,
          i.brand,
          i.supplier,
          i.unit,
          i.quantity,
          i.maximum_stock,
          i.stock_percentage,
          i.price_per_item,
          i.low_stock_threshold,
          i.created_at,
          i.updated_at
       FROM medicines i
       JOIN branches b ON b.id = i.branch_id
       WHERE ${branch.clause}
       ORDER BY i.medicine_name ASC`,
      branch.params
    );

    res.json({ medicines: enrichRows(rows) });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.post('/medicines', requireRole('receptionist', 'admin'), async (req, res) => {
  const {
    branch_id,
    medicine_name,
    generic_name,
    category,
    form,
    dosage,
    brand,
    supplier,
    unit,
    quantity,
    maximum_stock,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  if (!branch_id || !medicine_name || !unit) {
    return res.status(400).json({
      message: 'branch_id, medicine_name, and unit are required',
    });
  }

  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  const qty = Number(quantity || 0);
  const maxStock = normalizeMaximumStock(maximum_stock, Math.max(qty, 20));
  const threshold = Number(low_stock_threshold || 10);

  if (qty > maxStock) {
    return res.status(400).json({
      message: `Quantity cannot exceed maximum stock of ${maxStock}.`,
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO medicines (
         branch_id,
         medicine_name,
         generic_name,
         category,
         form,
         dosage,
         brand,
         supplier,
         unit,
         quantity,
         maximum_stock,
         price_per_item,
         low_stock_threshold
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        branch_id,
        medicine_name,
        generic_name || null,
        category || null,
        form || null,
        dosage || null,
        brand || null,
        supplier || null,
        unit,
        qty,
        maxStock,
        normalizePrice(price_per_item),
        threshold,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Medicine added',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/medicines/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const {
    medicine_name,
    generic_name,
    category,
    form,
    dosage,
    brand,
    supplier,
    unit,
    quantity,
    maximum_stock,
    max_stock_threshold,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  const nextMaxStock =
    maximum_stock !== undefined ? maximum_stock : max_stock_threshold;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'medicine', id);

    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const finalQuantity =
      quantity !== undefined ? Number(quantity) : Number(existing.quantity || 0);

    const finalMaximumStock =
      nextMaxStock !== undefined
        ? Number(nextMaxStock)
        : Number(existing.maximum_stock || 0);

    if (finalMaximumStock > 0 && finalQuantity > finalMaximumStock) {
      return res.status(400).json({
        message: `Quantity cannot exceed maximum stock of ${finalMaximumStock}.`,
      });
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
        maximum_stock = COALESCE(?, maximum_stock),
        price_per_item = COALESCE(?, price_per_item),
        low_stock_threshold = COALESCE(?, low_stock_threshold)
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
        optionalDbValue(nextMaxStock),
        optionalDbValue(price_per_item),
        optionalDbValue(low_stock_threshold),
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
  const amount = Number(req.body.amount || 0);

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: 'amount must be a positive number',
    });
  }

  try {
    const existing = await fetchInventoryAlertRow(pool, 'medicine', id);

    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const currentQuantity = Number(existing.quantity || 0);
    const maximumStock = Number(existing.maximum_stock || 0);

    if (maximumStock > 0 && currentQuantity + amount > maximumStock) {
      return res.status(400).json({
        message: `Cannot restock. This will exceed the maximum stock of ${maximumStock}. Current quantity is ${currentQuantity}.`,
      });
    }

    await pool.query(
      `UPDATE medicines 
       SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [amount, id]
    );

    const updated = await fetchInventoryAlertRow(pool, 'medicine', id);
    await createInventoryStatusNotifications(pool, existing, updated);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'inventory_restock', ?)`,
      [
        req.user.user_id,
        JSON.stringify({
          category: 'medicine',
          medicine_id: id,
          amount,
        }),
      ]
    );

    res.json({
      message: 'Restocked',
      new_quantity: currentQuantity + amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/medicines/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.query(
      'DELETE FROM medicines WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/equipment', async (req, res) => {
  try {
    const branch = inventoryBranchFilter(req, req.query.branch_id);

    const [rows] = await pool.query(
      `SELECT 
          e.id,
          e.branch_id,
          b.name AS branch_name,
          b.address AS branch_address,
          e.equipment_name,
          e.brand,
          e.supplier,
          e.category,
          e.model_number,
          e.serial_number,
          e.location,
          e.purchase_date,
          e.warranty_date,
          e.last_maintenance,
          e.next_maintenance,
          e.maintenance_status,
          e.assigned_to,
          u.name AS assigned_to_name,
          e.quantity,
          e.maximum_stock,
          e.stock_percentage,
          e.price_per_item,
          e.low_stock_threshold,
          e.created_at,
          e.updated_at
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
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.post('/equipment', requireRole('receptionist', 'admin'), async (req, res) => {
  const {
    branch_id,
    equipment_name,
    brand,
    supplier,
    category,
    model_number,
    serial_number,
    location,
    purchase_date,
    warranty_date,
    last_maintenance,
    next_maintenance,
    maintenance_status,
    assigned_to,
    quantity,
    maximum_stock,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  if (!branch_id || !equipment_name) {
    return res.status(400).json({
      message: 'branch_id and equipment_name are required',
    });
  }

  if (!validateBranchAccess(req, branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  const qty = Number(quantity || 1);
  const maxStock = normalizeMaximumStock(maximum_stock, Math.max(qty, 10));
  const threshold = Number(low_stock_threshold || 1);

  if (qty > maxStock) {
    return res.status(400).json({
      message: `Quantity cannot exceed maximum stock of ${maxStock}.`,
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO equipment (
         branch_id,
         equipment_name,
         brand,
         supplier,
         category,
         model_number,
         serial_number,
         location,
         purchase_date,
         warranty_date,
         last_maintenance,
         next_maintenance,
         maintenance_status,
         assigned_to,
         quantity,
         maximum_stock,
         price_per_item,
         low_stock_threshold
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        branch_id,
        equipment_name,
        brand || null,
        supplier || null,
        category || null,
        model_number || null,
        serial_number || null,
        location || null,
        purchase_date || null,
        warranty_date || null,
        last_maintenance || null,
        next_maintenance || null,
        maintenance_status || 'Available',
        assigned_to || null,
        qty,
        maxStock,
        normalizePrice(price_per_item),
        threshold,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Equipment added',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/equipment/:id', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const {
    equipment_name,
    brand,
    supplier,
    category,
    model_number,
    serial_number,
    location,
    purchase_date,
    warranty_date,
    last_maintenance,
    next_maintenance,
    maintenance_status,
    assigned_to,
    quantity,
    maximum_stock,
    max_stock_threshold,
    price_per_item,
    low_stock_threshold,
  } = req.body;

  const nextMaxStock =
    maximum_stock !== undefined ? maximum_stock : max_stock_threshold;

  try {
    const existing = await fetchInventoryAlertRow(pool, 'equipment', id);

    if (!existing) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (!validateBranchAccess(req, existing.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const finalQuantity =
      quantity !== undefined ? Number(quantity) : Number(existing.quantity || 0);

    const finalMaximumStock =
      nextMaxStock !== undefined
        ? Number(nextMaxStock)
        : Number(existing.maximum_stock || 0);

    if (finalMaximumStock > 0 && finalQuantity > finalMaximumStock) {
      return res.status(400).json({
        message: `Quantity cannot exceed maximum stock of ${finalMaximumStock}.`,
      });
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
        maximum_stock = COALESCE(?, maximum_stock),
        price_per_item = COALESCE(?, price_per_item),
        low_stock_threshold = COALESCE(?, low_stock_threshold)
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
        optionalDbValue(nextMaxStock),
        optionalDbValue(price_per_item),
        optionalDbValue(low_stock_threshold),
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
    const [result] = await pool.query(
      'DELETE FROM equipment WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/purchase-expenses', requireRole('admin'), async (req, res) => {
  const {
    branch_id,
    category,
    itemName,
    supplier,
    orderQuantity,
    pricePerItem,
    maxStock,
    maximum_stock,
    date,
  } = req.body;

  const branchId = Number.parseInt(branch_id, 10);
  const itemNameValue = String(itemName || '').trim();
  const quantity = normalizeQuantity(orderQuantity, 0);
  const price = normalizePrice(pricePerItem);
  const expenseDate = date || new Date().toISOString().slice(0, 10);
  const requestedMaximumStock =
    maxStock !== undefined ? maxStock : maximum_stock;

  const categoryConfig = {
    medicine: {
      table: 'medicines',
      idKey: 'medicine_id',
      nameColumn: 'medicine_name',
      defaultUnit: 'pcs',
      defaultThreshold: 10,
      defaultMaximumStock: 20,
      insertSql:
        `INSERT INTO medicines
         (branch_id, medicine_name, supplier, unit, quantity, maximum_stock, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    },
    equipment: {
      table: 'equipment',
      idKey: 'equipment_id',
      nameColumn: 'equipment_name',
      defaultUnit: null,
      defaultThreshold: 1,
      defaultMaximumStock: 10,
      insertSql:
        `INSERT INTO equipment
         (branch_id, equipment_name, supplier, quantity, maximum_stock, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    },
    supplies: {
      table: 'supplies',
      idKey: 'supply_id',
      nameColumn: 'supply_name',
      defaultUnit: 'pcs',
      defaultThreshold: 10,
      defaultMaximumStock: 20,
      insertSql:
        `INSERT INTO supplies
         (branch_id, supply_name, supplier, unit, quantity, maximum_stock, price_per_item, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `SELECT id, quantity, maximum_stock
       FROM ${config.table}
       WHERE branch_id = ? AND LOWER(${config.nameColumn}) = LOWER(?)
       LIMIT 1
       FOR UPDATE`,
      [branchId, itemNameValue]
    );

    let inventoryId;
    let newQuantity;
    let finalMaximumStock;

    if (existingRows.length) {
      const existingInventory = existingRows[0];
      const previousRow = await fetchInventoryAlertRow(
        connection,
        category,
        existingInventory.id
      );

      inventoryId = existingInventory.id;
      newQuantity = Number(existingInventory.quantity || 0) + quantity;
      finalMaximumStock =
        requestedMaximumStock !== undefined && requestedMaximumStock !== ''
          ? Number(requestedMaximumStock)
          : Number(existingInventory.maximum_stock || config.defaultMaximumStock);

      if (finalMaximumStock > 0 && newQuantity > finalMaximumStock) {
        await connection.rollback();

        return res.status(400).json({
          message: `Cannot save. This order will exceed the maximum stock of ${finalMaximumStock}. Current quantity is ${Number(existingInventory.quantity || 0)}.`,
        });
      }

      await connection.query(
        `UPDATE ${config.table}
         SET quantity = quantity + ?,
             maximum_stock = COALESCE(?, maximum_stock),
             supplier = COALESCE(NULLIF(?, ''), supplier),
             price_per_item = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          quantity,
          requestedMaximumStock !== undefined && requestedMaximumStock !== ''
            ? Number(requestedMaximumStock)
            : null,
          supplier || '',
          price,
          inventoryId,
        ]
      );

      const updatedRow = await fetchInventoryAlertRow(
        connection,
        category,
        inventoryId
      );

      await createInventoryStatusNotifications(connection, previousRow, updatedRow);
    } else {
      finalMaximumStock = normalizeMaximumStock(
        requestedMaximumStock,
        Math.max(quantity, config.defaultMaximumStock)
      );

      if (quantity > finalMaximumStock) {
        await connection.rollback();

        return res.status(400).json({
          message: `Quantity cannot exceed maximum stock of ${finalMaximumStock}.`,
        });
      }

      const insertParams =
        category === 'equipment'
          ? [
              branchId,
              itemNameValue,
              supplier || null,
              quantity,
              finalMaximumStock,
              price,
              config.defaultThreshold,
            ]
          : [
              branchId,
              itemNameValue,
              supplier || null,
              config.defaultUnit,
              quantity,
              finalMaximumStock,
              price,
              config.defaultThreshold,
            ];

      const [insertResult] = await connection.query(
        config.insertSql,
        insertParams
      );

      inventoryId = insertResult.insertId;
      newQuantity = quantity;

      const createdRow = await fetchInventoryAlertRow(
        connection,
        category,
        inventoryId
      );

      await createInventoryStatusNotifications(connection, null, createdRow);
    }

    const totalExpense = quantity * price;

    const [expenseResult] = await connection.query(
      `INSERT INTO clinic_expenses (
         branch_id,
         category,
         description,
         amount,
         expense_date,
         recorded_by,
         status
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
          maximum_stock: finalMaximumStock,
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
      maximum_stock: finalMaximumStock,
      stock_percentage: computeStockPercentage(newQuantity, finalMaximumStock),
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
    return res.status(400).json({
      message: 'branch_id query param is required',
    });
  }

  if (!validateBranchAccess(req, branchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [supplies] = await pool.query(
      `SELECT 
          id,
          supply_name AS name,
          quantity,
          maximum_stock,
          stock_percentage,
          low_stock_threshold
       FROM supplies
       WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );

    const [medicines] = await pool.query(
      `SELECT 
          id,
          medicine_name AS name,
          quantity,
          maximum_stock,
          stock_percentage,
          low_stock_threshold
       FROM medicines
       WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );

    const [equipment] = await pool.query(
      `SELECT 
          id,
          equipment_name AS name,
          quantity,
          maximum_stock,
          stock_percentage,
          low_stock_threshold
       FROM equipment
       WHERE branch_id = ? AND quantity <= low_stock_threshold`,
      [branchId]
    );

    res.json({
      branch_id: branchId,
      total: supplies.length + medicines.length + equipment.length,
      supplies: enrichRows(supplies).map((item) => ({
        ...item,
        category: 'supply',
      })),
      medicines: enrichRows(medicines).map((item) => ({
        ...item,
        category: 'medicine',
      })),
      equipment: enrichRows(equipment).map((item) => ({
        ...item,
        category: 'equipment',
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/usage-history', requireRole('admin', 'receptionist'), async (req, res) => {
  try {
    const branch = usageHistoryBranchFilter(req, req.query.branch_id);

    const startDate = req.query.start_date
      ? String(req.query.start_date).slice(0, 10)
      : '';

    const endDate = req.query.end_date
      ? String(req.query.end_date).slice(0, 10)
      : '';

    if (
      (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) ||
      (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))
    ) {
      return res.status(400).json({
        message: 'Invalid start_date or end_date (expected YYYY-MM-DD)',
      });
    }

    const whereParts = [branch.clause];
    const params = [...branch.params];

    if (startDate && endDate) {
      whereParts.push(
        'h.deducted_at >= ? AND h.deducted_at < DATE_ADD(?, INTERVAL 1 DAY)'
      );
      params.push(`${startDate} 00:00:00`, `${endDate} 00:00:00`);
    } else if (startDate) {
      whereParts.push(
        'h.deducted_at >= ? AND h.deducted_at < DATE_ADD(?, INTERVAL 1 DAY)'
      );
      params.push(`${startDate} 00:00:00`, `${startDate} 00:00:00`);
    }

    const [rows] = await pool.query(
      `SELECT 
          h.id,
          h.inventory_type,
          h.item_name,
          h.item_category,
          h.quantity_deducted,
          h.service_name,
          h.appointment_start_time,
          h.deducted_at,
          u.role AS deducted_by_role,
          u.name AS deducted_by_name,
          b.name AS branch_name,
          b.address AS branch_address
       FROM inventory_usage_history h
       LEFT JOIN users u ON u.id = h.deducted_by
       JOIN branches b ON b.id = h.branch_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY h.deducted_at DESC
       LIMIT 1000`,
      params
    );

    res.json({
      records: rows.map((row) => ({
        id: row.id,
        type: row.inventory_type,
        item_name: row.item_name,
        category: row.item_category,
        qty_deducted: Number(row.quantity_deducted || 0),
        service: row.service_name || null,
        appointment_date: row.appointment_start_time,
        branch_name: row.branch_name,
        branch_address: row.branch_address,
        deducted_at: row.deducted_at,
        deducted_by_role: row.deducted_by_role || null,
        deducted_by_name: row.deducted_by_name || null,
      })),
    });
  } catch (err) {
    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || 'Server error',
    });
  }
});

router.get('/service-kit-history', requireRole('admin'), async (req, res) => {
  const startDate = req.query.start_date ? String(req.query.start_date).slice(0, 10) : '';
  const endDate = req.query.end_date ? String(req.query.end_date).slice(0, 10) : '';
  const branchId = req.query.branch_id ? parseInt(req.query.branch_id, 10) : null;

  if ((startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) || (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))) {
    return res.status(400).json({ message: 'Invalid date format (expected YYYY-MM-DD)' });
  }

  try {
    const whereParts = [`al.action = 'service_kit_managed'`];
    const params = [];

    if (startDate && endDate) {
      whereParts.push(`al.created_at >= ? AND al.created_at < DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(`${startDate} 00:00:00`, endDate);
    } else if (startDate) {
      whereParts.push(`al.created_at >= ? AND al.created_at < DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(`${startDate} 00:00:00`, startDate);
    }

    if (branchId) {
      const [branchServiceRows] = await pool.query(
        `SELECT DISTINCT dsv.service_id
         FROM dentist_services dsv
         JOIN dentist_schedules dsch ON dsch.dentist_id = dsv.dentist_id
         WHERE dsch.branch_id = ?`,
        [branchId]
      );
      const serviceIds = branchServiceRows.map((r) => r.service_id);
      if (serviceIds.length === 0) {
        return res.json({ records: [] });
      }
      whereParts.push(`JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.service_id')) IN (${serviceIds.map(() => '?').join(',')})`);
      params.push(...serviceIds);
    }

    const [rows] = await pool.query(
      `SELECT al.id, al.created_at, al.details, al.branch_id,
              u.name AS changed_by_name, u.role AS changed_by_role,
              b.address AS branch_address, b.name AS branch_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       LEFT JOIN branches b ON b.id = al.branch_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY al.created_at DESC
       LIMIT 500`,
      params
    );

    const records = rows.map((row) => {
      const details = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});
      const branchDisplay = row.branch_address || details.branch_address || row.branch_name || '—';
      return {
        id: row.id,
        service_id: details.service_id || null,
        service_name: details.service_name || '—',
        items: Array.isArray(details.items) ? details.items : [],
        status: details.was_new ? 'Added' : 'Updated',
        changed_by: row.changed_by_name || row.changed_by_role || 'Admin',
        branch_address: branchDisplay,
        changed_at: row.created_at,
      };
    });

    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/service-kits/:serviceId', async (req, res) => {
  const serviceId = parseInt(req.params.serviceId, 10);
  const branchId = parseInt(req.query.branch_id, 10);

  if (!branchId) {
    return res.status(400).json({
      message: 'branch_id query param is required',
    });
  }

  if (!validateBranchAccess(req, branchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
<<<<<<< HEAD
    const [kitRows] = await pool.query(
      `SELECT id, service_id, notes
       FROM service_kits
       WHERE service_id = ?`,
      [serviceId]
    );

    if (kitRows.length === 0) {
=======
    const [kitRows] = await pool.query(`SELECT id, service_id, notes FROM service_kits WHERE service_id = ?`, [serviceId]);
    if (!kitRows.length) {
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
      return res.json({
        service_id: serviceId,
        kit_exists: false,
        items: [],
        message: 'No kit defined for this service. Dentist will enter items manually.',
      });
    }

    const kit = kitRows[0];

<<<<<<< HEAD
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
        const [rows] = await pool.query(
          `SELECT 
              id,
              supply_name AS name,
              quantity,
              maximum_stock,
              stock_percentage,
              low_stock_threshold,
              unit
           FROM supplies
           WHERE branch_id = ?
             AND (
               LOWER(TRIM(supply_name)) = LOWER(TRIM(?))
               OR LOWER(TRIM(supply_name)) LIKE CONCAT('%', LOWER(TRIM(?)), '%')
               OR LOWER(TRIM(?)) LIKE CONCAT('%', LOWER(TRIM(supply_name)), '%')
             )
           ORDER BY
             CASE WHEN LOWER(TRIM(supply_name)) = LOWER(TRIM(?)) THEN 0 ELSE 1 END,
             LENGTH(supply_name) ASC
           LIMIT 1`,
          [
            branchId,
            item.item_name,
            item.item_name,
            item.item_name,
            item.item_name,
          ]
        );

        inventoryRow = rows[0] || null;
      } else if (item.category === 'medicine') {
        const [rows] = await pool.query(
          `SELECT 
              id,
              medicine_name AS name,
              quantity,
              maximum_stock,
              stock_percentage,
              low_stock_threshold,
              unit
           FROM medicines
           WHERE branch_id = ?
             AND (
               LOWER(TRIM(medicine_name)) = LOWER(TRIM(?))
               OR LOWER(TRIM(medicine_name)) LIKE CONCAT('%', LOWER(TRIM(?)), '%')
               OR LOWER(TRIM(?)) LIKE CONCAT('%', LOWER(TRIM(medicine_name)), '%')
             )
           ORDER BY
             CASE WHEN LOWER(TRIM(medicine_name)) = LOWER(TRIM(?)) THEN 0 ELSE 1 END,
             LENGTH(medicine_name) ASC
           LIMIT 1`,
          [
            branchId,
            item.item_name,
            item.item_name,
            item.item_name,
            item.item_name,
          ]
        );

        inventoryRow = rows[0] || null;
      } else if (item.category === 'equipment') {
        const [rows] = await pool.query(
          `SELECT 
              id,
              equipment_name AS name,
              quantity,
              maximum_stock,
              stock_percentage,
              low_stock_threshold,
              COALESCE(maintenance_status, 'Available') AS unit
           FROM equipment
           WHERE branch_id = ?
             AND (
               LOWER(TRIM(equipment_name)) = LOWER(TRIM(?))
               OR LOWER(TRIM(equipment_name)) LIKE CONCAT('%', LOWER(TRIM(?)), '%')
               OR LOWER(TRIM(?)) LIKE CONCAT('%', LOWER(TRIM(equipment_name)), '%')
             )
           ORDER BY
             CASE WHEN LOWER(TRIM(equipment_name)) = LOWER(TRIM(?)) THEN 0 ELSE 1 END,
             LENGTH(equipment_name) ASC
           LIMIT 1`,
          [
            branchId,
            item.item_name,
            item.item_name,
            item.item_name,
            item.item_name,
          ]
        );

        inventoryRow = rows[0] || null;
      }

      resolved.push({
        category: item.category,
        item_name: item.item_name,
        default_quantity: item.default_quantity,
        inventory_id: inventoryRow ? inventoryRow.id : null,
        current_stock: inventoryRow ? inventoryRow.quantity : null,
        maximum_stock: inventoryRow ? inventoryRow.maximum_stock : null,
        stock_percentage: inventoryRow ? inventoryRow.stock_percentage : null,
        unit: inventoryRow ? inventoryRow.unit : null,
        available: inventoryRow !== null,
        sufficient:
          inventoryRow !== null &&
          Number(inventoryRow.quantity || 0) >= Number(item.default_quantity || 0),
      });
    }
=======
    const availability = await getServiceKitAvailability(pool, { serviceId, branchId });
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52

    res.json({
      service_id: serviceId,
      kit_id: kit.id,
      kit_exists: true,
      notes: kit.notes,
      items: availability.items.map((item) => ({
        category: item.category,
        item_name: item.item_name,
        default_quantity: item.required_quantity,
        inventory_id: item.inventory_id,
        current_stock: item.current_stock,
        available: item.inventory_id !== null,
        sufficient: item.sufficient,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

<<<<<<< HEAD
=======
router.put('/service-kits/:serviceId', requireRole('admin'), async (req, res) => {
  const serviceId = parseInt(req.params.serviceId, 10);
  const { notes = null, items = [], branch_id = null } = req.body || {};
  const auditBranchId = branch_id ? parseInt(branch_id, 10) : null;

  if (!serviceId) return res.status(400).json({ message: 'Invalid service id' });
  if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [serviceRows] = await conn.query('SELECT id, name FROM services WHERE id = ? LIMIT 1', [serviceId]);
    if (!serviceRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Service not found' });
    }
    const serviceName = serviceRows[0].name;

    const [kitRows] = await conn.query('SELECT id FROM service_kits WHERE service_id = ? LIMIT 1', [serviceId]);
    let kitId = kitRows[0]?.id || null;
    const wasNew = !kitId;

    if (!kitId) {
      const [insertKit] = await conn.query('INSERT INTO service_kits (service_id, notes) VALUES (?, ?)', [serviceId, notes]);
      kitId = insertKit.insertId;
    } else {
      await conn.query('UPDATE service_kits SET notes = ? WHERE id = ?', [notes, kitId]);
      await conn.query('DELETE FROM service_kit_items WHERE service_kit_id = ?', [kitId]);
    }

    const cleanItems = items
      .map((item) => ({
        category: String(item?.category || '').trim(),
        item_name: String(item?.item_name || '').trim(),
        default_quantity: Number.parseInt(item?.default_quantity, 10),
      }))
      .filter((item) => ['supply', 'medicine', 'equipment'].includes(item.category) && item.item_name && item.default_quantity > 0);

    if (cleanItems.length > 0) {
      await conn.query(
        `INSERT INTO service_kit_items (service_kit_id, category, item_name, default_quantity)
         VALUES ${cleanItems.map(() => '(?, ?, ?, ?)').join(', ')}`,
        cleanItems.flatMap((item) => [kitId, item.category, item.item_name, item.default_quantity])
      );
    }

    let branchAddress = null;
    if (auditBranchId) {
      const [branchRows] = await conn.query('SELECT address, name FROM branches WHERE id = ? LIMIT 1', [auditBranchId]);
      branchAddress = branchRows[0]?.address || branchRows[0]?.name || null;
    }

    await conn.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details) VALUES (?, 'service_kit_managed', ?, ?)`,
      [req.user.user_id, auditBranchId, JSON.stringify({ service_id: serviceId, service_name: serviceName, items: cleanItems, was_new: wasNew, branch_address: branchAddress })]
    );

    await conn.commit();
    const savedItems = await getServiceKitRows(pool, serviceId);
    res.json({ service_id: serviceId, kit_id: kitId, notes, items: savedItems });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────
// CONSUMPTION LOOKUP — what was used for a completed appointment?
// ─────────────────────────────────────────────────────────────

>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
router.get('/appointments/:appointmentId/consumption', async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    const [appointmentRows] = await pool.query(
      `SELECT id, dentist_id, branch_id, status
       FROM appointments
       WHERE id = ?`,
      [appointmentId]
    );

    if (appointmentRows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointmentRows[0];

    if (role === 'dentist' && appointment.dentist_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (
      (role === 'receptionist' || role === 'admin') &&
      !validateBranchAccess(req, appointment.branch_id)
    ) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const [items] = await pool.query(
<<<<<<< HEAD
      `SELECT category, item_id, item_name, quantity_used
       FROM appointment_consumption
       WHERE appointment_id = ?`,
=======
      `SELECT ac.category, ac.item_id, ac.item_name, ac.quantity_used, ac.recorded_by,
              u.role AS recorded_by_role, u.name AS recorded_by_name
       FROM appointment_consumption ac
       LEFT JOIN users u ON u.id = ac.recorded_by
       WHERE ac.appointment_id = ?`,
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
      [appointmentId]
    );
    const submittedBy = items.length > 0
      ? {
          user_id: items[0].recorded_by || null,
          name: items[0].recorded_by_name || null,
          role: items[0].recorded_by_role || null,
        }
      : null;
    const [editedRows] = await pool.query(
      `SELECT al.user_id, al.created_at, u.name AS edited_by_name, u.role AS edited_by_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.action = 'appointment_consumption_updated'
         AND (
           al.details LIKE ?
           OR al.details LIKE ?
         )
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT 1`,
      [`%"appointment_id":${appointmentId}%`, `%"appointment_id": ${appointmentId}%`]
    );
    const editedBy = editedRows.length > 0
      ? {
          user_id: editedRows[0].user_id || null,
          name: editedRows[0].edited_by_name || null,
          role: editedRows[0].edited_by_role || null,
        }
      : null;
    const editedAt = editedRows.length > 0 ? editedRows[0].created_at || null : null;

    res.json({
      appointment_id: appointmentId,
      submitted: items.length > 0,
<<<<<<< HEAD
=======
      submitted_by: submittedBy,
      edited_by: editedBy,
      edited_at: editedAt,
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/appointments/:appointmentId/consumption',
  requireRole('dentist', 'receptionist', 'admin'),
  async (req, res) => {
    const appointmentId = parseInt(req.params.appointmentId, 10);
    const { items, mark_complete } = req.body;
    const userId = req.user.user_id;
    const role = req.user.role;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [appointmentRows] = await connection.query(
        `SELECT id, dentist_id, branch_id, service_id, start_time, status
         FROM appointments
         WHERE id = ?
         FOR UPDATE`,
        [appointmentId]
      );

      if (appointmentRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const appointment = appointmentRows[0];

      if (role === 'dentist' && appointment.dentist_id !== userId) {
        await connection.rollback();

        return res.status(403).json({
          message: 'You are not the dentist for this appointment',
        });
      }

      if (!validateBranchAccess(req, appointment.branch_id)) {
        await connection.rollback();
        return res.status(403).json({ message: 'No access to this branch' });
      }

      const [existing] = await connection.query(
        `SELECT id
         FROM appointment_consumption
         WHERE appointment_id = ?
         LIMIT 1`,
        [appointmentId]
      );

      if (existing.length > 0) {
        await connection.rollback();

        return res.status(409).json({
          message: 'Consumption already recorded for this appointment',
        });
      }

      const serviceId = appointment.service_id || null;
      let serviceName = null;

      try {
        const [serviceRows] = await connection.query(
          `SELECT name FROM services WHERE id = ?`,
          [serviceId]
        );

        serviceName = serviceRows.length ? serviceRows[0].name : null;
      } catch {
        serviceName = null;
      }

      const decrementResults = [];

      for (const item of items) {
        const { category, inventory_id, quantity_used } = item;

        if (!category || !inventory_id || !quantity_used || quantity_used <= 0) {
          await connection.rollback();

          return res.status(400).json({
            message: 'Each item needs category, inventory_id, and positive quantity_used',
          });
        }

        const validCategories = {
          supply: 'supplies',
          medicine: 'medicines',
          equipment: 'equipment',
        };

        const nameColumns = {
          supply: 'supply_name',
          medicine: 'medicine_name',
          equipment: 'equipment_name',
        };

        if (!validCategories[category]) {
          await connection.rollback();

          return res.status(400).json({
            message: `Invalid category: ${category}`,
          });
        }

        const table = validCategories[category];
        const nameColumn = nameColumns[category];

        const [inventoryRows] = await connection.query(
          `SELECT 
              id,
              branch_id,
              ${nameColumn} AS name,
              category AS item_category,
              quantity,
              maximum_stock,
              stock_percentage,
              low_stock_threshold
           FROM ${table}
           WHERE id = ?
           FOR UPDATE`,
          [inventory_id]
        );

        if (inventoryRows.length === 0) {
          await connection.rollback();

          return res.status(404).json({
            message: `${category} id ${inventory_id} not found`,
          });
        }

        const inventoryItem = inventoryRows[0];
        const previousInventoryRow = await fetchInventoryAlertRow(
          connection,
          category,
          inventory_id
        );

        if (inventoryItem.branch_id !== appointment.branch_id) {
          await connection.rollback();

          return res.status(400).json({
            message: `${inventoryItem.name} is not at this appointment's branch`,
          });
        }

        if (inventoryItem.quantity < quantity_used) {
          await connection.rollback();

          return res.status(400).json({
            message: `Insufficient stock for ${inventoryItem.name}: have ${inventoryItem.quantity}, need ${quantity_used}`,
          });
        }

        await connection.query(
          `UPDATE ${table}
           SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [quantity_used, inventory_id]
        );

        const updatedInventoryRow = await fetchInventoryAlertRow(
          connection,
          category,
          inventory_id
        );

        await createInventoryStatusNotifications(
          connection,
          previousInventoryRow,
          updatedInventoryRow
        );

        await connection.query(
          `INSERT INTO appointment_consumption (
             appointment_id,
             category,
             item_id,
             item_name,
             quantity_used,
             recorded_by
           )
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            appointmentId,
            category,
            inventory_id,
            inventoryItem.name,
            quantity_used,
            userId,
          ]
        );

        const inventoryType =
          category === 'medicine'
            ? 'medicine'
            : category === 'equipment'
              ? 'equipment'
              : 'supply';

        await connection.query(
          `INSERT INTO inventory_usage_history (
             appointment_id,
             branch_id,
             inventory_type,
             item_id,
             item_name,
             item_category,
             quantity_deducted,
             service_id,
             service_name,
             appointment_start_time,
             deducted_by
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            appointmentId,
            appointment.branch_id,
            inventoryType,
            inventory_id,
            inventoryItem.name,
            inventoryItem.item_category || null,
            quantity_used,
            serviceId,
            serviceName,
            appointment.start_time || null,
            userId,
          ]
        );

        decrementResults.push({
          category,
          item_id: inventory_id,
          item_name: inventoryItem.name,
          quantity_used,
          new_quantity: inventoryItem.quantity - quantity_used,
          maximum_stock: inventoryItem.maximum_stock,
          stock_percentage: computeStockPercentage(
            inventoryItem.quantity - quantity_used,
            inventoryItem.maximum_stock
          ),
        });
      }

      if (mark_complete && appointment.status === 'scheduled') {
        await connection.query(
          `UPDATE appointments
           SET status = 'completed'
           WHERE id = ?`,
          [appointmentId]
        );
      }

      await connection.query(
        `INSERT INTO audit_logs (user_id, action, branch_id, details)
         VALUES (?, 'appointment_consumption', ?, ?)`,
        [
          userId,
          appointment.branch_id,
          JSON.stringify({
            appointment_id: appointmentId,
            items_count: items.length,
            items: decrementResults,
          }),
        ]
      );

      await connection.commit();

      res.json({
        message: 'Consumption recorded',
        appointment_id: appointmentId,
        status: mark_complete ? 'completed' : appointment.status,
        items: decrementResults,
      });
    } catch (err) {
      await connection.rollback();
      console.error(err);

<<<<<<< HEAD
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
=======
    if (role === 'receptionist' && appt.dentist_id) {
      const receptionistName = req.user?.name || 'Receptionist';
      await conn.query(
        `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
         VALUES (?, 'service_kit_submitted', 'Service Kit Submitted', ?, 'appointment', ?)`,
        [
          appt.dentist_id,
          `${receptionistName} submitted the service kit for your completed appointment #${appointmentId}.`,
          appointmentId,
        ]
      );
    }

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
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
  }
);

<<<<<<< HEAD
module.exports = router;
=======
router.put('/appointments/:appointmentId/consumption', requireRole('dentist', 'receptionist', 'admin'), async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const { items } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'items must be an array' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [apptRows] = await conn.query(
      `SELECT id, dentist_id, branch_id, service_id, start_time, status
       FROM appointments WHERE id = ? FOR UPDATE`,
      [appointmentId]
    );
    if (apptRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRows[0];

    if (role === 'dentist' && appt.dentist_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ message: 'You are not the dentist for this appointment' });
    }
    if (!validateBranchAccess(req, appt.branch_id)) {
      await conn.rollback();
      return res.status(403).json({ message: 'No access to this branch' });
    }

    const [existingRows] = await conn.query(
      `SELECT category, item_id, quantity_used
       FROM appointment_consumption
       WHERE appointment_id = ?`,
      [appointmentId]
    );
    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'No existing service kit submission to edit' });
    }

    const [existingReceptionistSubmitters] = await conn.query(
      `SELECT DISTINCT ac.recorded_by AS user_id
       FROM appointment_consumption ac
       JOIN users u ON u.id = ac.recorded_by
       WHERE ac.appointment_id = ?
         AND u.role = 'receptionist'`,
      [appointmentId]
    );

    const tableByCategory = { supply: 'supplies', medicine: 'medicines', equipment: 'equipment' };
    for (const row of existingRows) {
      const table = tableByCategory[row.category];
      if (!table) continue;

      await conn.query(
        `UPDATE ${table} SET quantity = quantity + ? WHERE id = ? AND branch_id = ?`,
        [Number(row.quantity_used || 0), row.item_id, appt.branch_id]
      );
    }

    await conn.query(`DELETE FROM appointment_consumption WHERE appointment_id = ?`, [appointmentId]);
    await conn.query(`DELETE FROM inventory_usage_history WHERE appointment_id = ?`, [appointmentId]);

    const serviceId = appt.service_id || null;
    let serviceName = null;
    try {
      const [serviceRows] = await conn.query(`SELECT name FROM services WHERE id = ?`, [serviceId]);
      serviceName = serviceRows.length ? serviceRows[0].name : null;
    } catch {
      serviceName = null;
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
        `SELECT id, branch_id, ${nameCol} AS name, category AS item_category, quantity
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
        return res.status(400).json({ message: `${invItem.name} is not at this appointment's branch` });
      }
      if (invItem.quantity < quantity_used) {
        await conn.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${invItem.name}: have ${invItem.quantity}, need ${quantity_used}`,
        });
      }

      await conn.query(`UPDATE ${table} SET quantity = quantity - ? WHERE id = ?`, [quantity_used, inventory_id]);
      const updatedInventoryRow = await fetchInventoryAlertRow(conn, category, inventory_id);
      await createInventoryStatusNotifications(conn, previousInventoryRow, updatedInventoryRow);

      await conn.query(
        `INSERT INTO appointment_consumption (appointment_id, category, item_id, item_name, quantity_used, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appointmentId, category, inventory_id, invItem.name, quantity_used, userId]
      );

      const inventoryType =
        category === 'medicine' ? 'medicine' : category === 'equipment' ? 'equipment' : 'supply';
      await conn.query(
        `INSERT INTO inventory_usage_history
         (appointment_id, branch_id, inventory_type, item_id, item_name, item_category, quantity_deducted,
          service_id, service_name, appointment_start_time, deducted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointmentId,
          appt.branch_id,
          inventoryType,
          inventory_id,
          invItem.name,
          invItem.item_category || null,
          quantity_used,
          serviceId,
          serviceName,
          appt.start_time || null,
          userId,
        ]
      );

      decrementResults.push({
        category,
        item_id: inventory_id,
        item_name: invItem.name,
        quantity_used,
        new_quantity: invItem.quantity - quantity_used,
      });
    }

    await conn.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_consumption_updated', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({
        appointment_id: appointmentId,
        items_count: items.length,
        items: decrementResults,
      })]
    );

    if (role === 'receptionist' && appt.dentist_id) {
      const receptionistName = req.user?.name || 'Receptionist';
      await conn.query(
        `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
         VALUES (?, 'service_kit_updated', 'Service Kit Updated', ?, 'appointment', ?)`,
        [
          appt.dentist_id,
          `${receptionistName} edited the service kit for your completed appointment #${appointmentId}.`,
          appointmentId,
        ]
      );
    }

    if (role === 'dentist' && existingReceptionistSubmitters.length > 0) {
      const dentistName = req.user?.name || 'Dentist';
      const appointmentSchedule = appt.start_time
        ? String(appt.start_time)
        : 'the recorded schedule';
      const rowsToInsert = existingReceptionistSubmitters.filter((row) => Number(row.user_id) > 0);
      if (rowsToInsert.length > 0) {
        await conn.query(
          `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
           VALUES ${rowsToInsert.map(() => "(?, 'service_kit_updated_by_dentist', 'Service Kit Edited', ?, 'appointment', ?)").join(', ')}`,
          rowsToInsert.flatMap((row) => [
            row.user_id,
            `${dentistName} edited the service kit you submitted for appointment #${appointmentId} scheduled at ${appointmentSchedule}.`,
            appointmentId,
          ])
        );
      }
    }

    await conn.commit();
    res.json({
      message: 'Consumption updated',
      appointment_id: appointmentId,
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
>>>>>>> 08c262977fe5817cb41df31d687521a4643edd52
