import React from "react";

export default function ServicesSection({
  styles,
  websiteServices,
  setWebsiteServiceOverlay,
  setDeleteWebsiteServiceId,
  setDeleteWebsiteServiceModal,
  getStatusStyle,
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button type="button" style={styles.primaryBtn} onClick={() => setWebsiteServiceOverlay({ name: "", image_path: "", description: "", slug: "", sort_order: websiteServices.length + 1, status: "active" })}>
          <i className="fi fi-rr-plus"></i> <span>Add Service</span>
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={{ ...styles.branchTable, minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ ...styles.tableHead, width: 44 }}>#</th>
              <th style={styles.tableHead}>Name</th>
              <th style={styles.tableHead}>Image Path</th>
              <th style={styles.tableHead}>Slug</th>
              <th style={{ ...styles.tableHead, whiteSpace: "nowrap", width: 90 }}>Status</th>
              <th style={{ ...styles.tableHead, whiteSpace: "nowrap", width: 90 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {websiteServices.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyRow}>No service cards found.</td>
              </tr>
            ) : (
              websiteServices.map((svc) => (
                <tr key={svc.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{svc.sort_order}</td>

                  <td style={styles.tableCell}>{svc.name}</td>

                  <td style={{ ...styles.tableCell, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", fontSize: 12, color: "#64748b" }}>
                    {svc.image_path || "—"}
                  </td>

                  <td style={styles.tableCell}>{svc.slug || "—"}</td>

                  <td style={{ ...styles.tableCell, whiteSpace: "nowrap" }}>
                    <span style={getStatusStyle(svc.status === "active" ? "Active" : "Inactive")}>
                      {svc.status === "active" ? "Active" : "Hidden"}
                    </span>
                  </td>

                  <td style={{ ...styles.tableCell, whiteSpace: "nowrap" }}>
                    <button type="button" style={styles.editBtn} onClick={() => setWebsiteServiceOverlay({ ...svc })}>
                      <i className="fi fi-rr-file-edit"></i>
                    </button>

                    <button type="button" style={{ ...styles.editBtn, color: "#dc2626", marginLeft: 6 }} onClick={() => { setDeleteWebsiteServiceId(svc.id); setDeleteWebsiteServiceModal(true); }}>
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}