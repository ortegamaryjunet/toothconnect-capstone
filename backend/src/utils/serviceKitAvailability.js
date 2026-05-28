const TABLE_CONFIG = {
  supply: { table: 'supplies', nameColumn: 'supply_name' },
  medicine: { table: 'medicines', nameColumn: 'medicine_name' },
  equipment: { table: 'equipment', nameColumn: 'equipment_name' },
};

async function getServiceKitRows(executor, serviceId) {
  const [kitRows] = await executor.query(
    `SELECT id
     FROM service_kits
     WHERE service_id = ?
     LIMIT 1`,
    [serviceId]
  );

  if (!kitRows.length) return [];

  const [itemRows] = await executor.query(
    `SELECT category, item_name, default_quantity
     FROM service_kit_items
     WHERE service_kit_id = ?`,
    [kitRows[0].id]
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
  const items = await getServiceKitRows(executor, serviceId);
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
  getServiceKitRows,
  resolveKitItemStock,
  getServiceKitAvailability,
};
