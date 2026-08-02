import React from "react";

export default function FaqSection({ styles, websiteFaqs, setWebsiteFaqOverlay, getStatusStyle, deleteFaq }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button type="button" style={styles.primaryBtn} onClick={() => setWebsiteFaqOverlay({ question: "", answer: "", sort_order: websiteFaqs.length + 1, status: "active" })}>
          <i className="fi fi-rr-plus"></i> <span>Add FAQ</span>
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={{ ...styles.branchTable, minWidth: 660 }}>
          <thead>
            <tr>
              <th style={{ ...styles.tableHead, width: 44 }}>#</th>
              <th style={styles.tableHead}>Question</th>
              <th style={styles.tableHead}>Answer</th>
              <th style={{ ...styles.tableHead, whiteSpace: "nowrap", width: 90 }}>Status</th>
              <th style={{ ...styles.tableHead, whiteSpace: "nowrap", width: 90 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {websiteFaqs.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyRow}>No FAQs found.</td>
              </tr>
            ) : (
              websiteFaqs.map((faq) => (
                <tr key={faq.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{faq.sort_order}</td>

                  <td style={{ ...styles.tableCell, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {faq.question?.length > 80 ? `${faq.question.slice(0, 80)}…` : faq.question}
                  </td>

                  <td style={{ ...styles.tableCell, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {faq.answer?.length > 100 ? `${faq.answer.slice(0, 100)}…` : faq.answer}
                  </td>

                  <td style={{ ...styles.tableCell, whiteSpace: "nowrap" }}>
                    <span style={getStatusStyle(faq.status === "active" ? "Active" : "Inactive")}>
                      {faq.status === "active" ? "Active" : "Hidden"}
                    </span>
                  </td>

                  <td style={{ ...styles.tableCell, whiteSpace: "nowrap" }}>
                    <button type="button" style={styles.editBtn} onClick={() => setWebsiteFaqOverlay({ ...faq })}>
                      <i className="fi fi-rr-file-edit"></i>
                    </button>

                    <button type="button" style={{ ...styles.editBtn, color: "#dc2626", marginLeft: 6 }} onClick={() => deleteFaq(faq.id)}>
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