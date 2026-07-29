const TABLE_CONFIG = {
  supply: { table: 'supplies', nameColumn: 'supply_name' },
  medicine: { table: 'medicines', nameColumn: 'medicine_name' },
  equipment: { table: 'equipment', nameColumn: 'equipment_name' },
};

let serviceKitsBranchColumnReady = false;

async function ensureServiceKitsBranchColumn(executor) {
  if (serviceKitsBranchColumnReady) return;

  const [columns] = await executor.query(`SHOW COLUMNS FROM service_kits LIKE 'branch_id'`);
  if (columns.length === 0) {
    await executor.query(`ALTER TABLE service_kits ADD COLUMN branch_id INT NULL AFTER service_id`);
  }

  const [indexes] = await executor.query(`SHOW INDEX FROM service_kits`);
  const hasBranchUnique = indexes.some((row) => row.Key_name === 'uniq_service_kit_branch');
  if (!hasBranchUnique) {
    await executor.query(`ALTER TABLE service_kits ADD UNIQUE KEY uniq_service_kit_branch (service_id, branch_id)`);
  }

  const [updatedIndexes] = await executor.query(`SHOW INDEX FROM service_kits`);
  const grouped = new Map();
  for (const row of updatedIndexes) {
    if (!grouped.has(row.Key_name)) grouped.set(row.Key_name, []);
    grouped.get(row.Key_name).push(row);
  }

  for (const [keyName, rows] of grouped.entries()) {
    if (keyName === 'PRIMARY') continue;
    const uniqueColumns = rows
      .filter((row) => Number(row.Non_unique) === 0)
      .sort((a, b) => Number(a.Seq_in_index) - Number(b.Seq_in_index))
      .map((row) => row.Column_name);

    if (uniqueColumns.length === 1 && uniqueColumns[0] === 'service_id') {
      const escapedKeyName = String(keyName).replace(/`/g, '``');
      await executor.query(`ALTER TABLE service_kits DROP INDEX \`${escapedKeyName}\``);
    }
  }

  serviceKitsBranchColumnReady = true;
}

async function getServiceKitRecord(executor, serviceId, branchId = null) {
  await ensureServiceKitsBranchColumn(executor);

  const [kitRows] = await executor.query(
    `SELECT id, service_id, branch_id, notes
     FROM service_kits
     WHERE service_id = ?
       AND (? IS NULL OR branch_id = ? OR branch_id IS NULL)
     ORDER BY
       CASE WHEN branch_id = ? THEN 0 WHEN branch_id IS NULL THEN 1 ELSE 2 END,
       id ASC
     LIMIT 1`,
    [serviceId, branchId || null, branchId || null, branchId || null]
  );

  return kitRows[0] || null;
}

async function getServiceKitRows(executor, serviceId, branchId = null) {
  const kit = await getServiceKitRecord(executor, serviceId, branchId);
  if (!kit) return [];

  const [itemRows] = await executor.query(
    `SELECT category, item_name, default_quantity
     FROM service_kit_items
     WHERE service_kit_id = ?`,
    [kit.id]
  );
  return itemRows;
}

async function resolveKitItemStock(executor, branchId, item) {
  const config = TABLE_CONFIG[item.category];
  if (!config) return null;

  const [rows] = await executor.query(
    `SELECT id, ${config.nameColumn} AS name, quantity
     FROM ${config.table}
     WHERE branch_id = ?
       AND (
         LOWER(TRIM(${config.nameColumn})) = LOWER(TRIM(?))
         OR LOWER(TRIM(${config.nameColumn})) LIKE CONCAT('%', LOWER(TRIM(?)), '%')
         OR LOWER(TRIM(?)) LIKE CONCAT('%', LOWER(TRIM(${config.nameColumn})), '%')
       )
     ORDER BY
       CASE WHEN LOWER(TRIM(${config.nameColumn})) = LOWER(TRIM(?)) THEN 0 ELSE 1 END,
       LENGTH(${config.nameColumn}) ASC
     LIMIT 1`,
    [branchId, item.item_name, item.item_name, item.item_name, item.item_name]
  );
  return rows[0] || null;
}

async function getServiceKitAvailability(executor, { serviceId, branchId }) {
  const items = await getServiceKitRows(executor, serviceId, branchId);
  if (items.length === 0) {
    return { has_kit: false, available: true, items: [] };
  }

  const resolved = [];
  for (const item of items) {
    const stock = await resolveKitItemStock(executor, branchId, item);
    const requiredQty = Number(item.default_quantity || 0);
    const currentQty = Number(stock?.quantity || 0);
    const sufficient = !!stock && currentQty >= requiredQty;
    resolved.push({
      category: item.category,
      item_name: item.item_name,
      required_quantity: requiredQty,
      inventory_id: stock?.id || null,
      current_stock: stock ? currentQty : null,
      sufficient,
    });
  }

  return {
    has_kit: true,
    available: resolved.every((row) => row.sufficient),
    items: resolved,
  };
}

module.exports = {
  ensureServiceKitsBranchColumn,
  getServiceKitRecord,
  getServiceKitRows,
  resolveKitItemStock,
  getServiceKitAvailability,
};
