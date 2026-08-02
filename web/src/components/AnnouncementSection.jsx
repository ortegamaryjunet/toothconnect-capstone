import React from "react";

export default function AnnouncementSection({
  styles,
  websiteAnnouncements,
  setWebsiteAnnouncementOverlay,
  getStatusStyle,
  setDeleteAnnouncementId,
  setDeleteAnnouncementModal,
}) {
  const parseDateTime = (value) => {
    if (!value) {
      return null;
    }

    const cleanValue = String(value)
      .replace("T", " ")
      .replace(".000Z", "");

    const [date, time] = cleanValue.split(" ");

    if (!date || !time) {
      return null;
    }

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    return {
      year,
      month,
      day,
      hour,
      minute,
    };
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date.year,
      date.month - 1,
      date.day
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "--";
    }

    return new Date(
      2000,
      0,
      1,
      date.hour,
      date.minute
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <div style={styles.websiteAnnouncementHeader}>
        <div>
          <h3 style={styles.websiteAnnouncementTitle}>
            Website Announcements
          </h3>

          <p style={styles.websiteAnnouncementSubtitle}>
            Add announcements that will appear only within the selected date range.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryBtn}
          onClick={() =>
            setWebsiteAnnouncementOverlay({
              title: "",
              message: "",
              title_font_family: "",
              title_font_size: "",
              title_font_weight: "",
              title_color: "#000000",
              title_alignment: "left",
              message_font_family: "",
              message_font_size: "",
              message_font_weight: "",
              message_color: "#000000",
              message_alignment: "left",
              start_date: "",
              start_time: "",
              end_date: "",
              end_time: "",
              status: "active",
            })
          }
        >
          <i className="fi fi-rr-plus"></i>
          <span>Add Announcement</span>
        </button>
      </div>

      <div style={styles.websiteAnnouncementGrid}>
        {websiteAnnouncements.length === 0 ? (
          <div style={styles.websiteAnnouncementEmpty}>
            <i
              className="fi fi-rr-megaphone"
              style={styles.websiteAnnouncementEmptyIcon}
            ></i>

            <span>No announcements found.</span>
          </div>
        ) : (
          websiteAnnouncements.map((ann) => {
            const start = parseDateTime(ann.start_date);
            const end = parseDateTime(ann.end_date);

            return (
              <div key={ann.id} style={styles.websiteAnnouncementCard}>
                <div style={styles.websiteAnnouncementCardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={styles.websiteAnnouncementIconBox}>
                      <i className="fi fi-rr-megaphone"></i>
                    </div>

                    <div>
                      <h4
                        style={{
                          ...styles.websiteAnnouncementCardTitle,
                          fontFamily: ann.title_font_family || "Arial",
                          fontSize: ann.title_font_size || "16px",
                          fontWeight: ann.title_font_weight || "400",
                          color: ann.title_color || "#000000",
                          textAlign: ann.title_alignment || "left",
                        }}
                      >
                        {ann.title || "Untitled Announcement"}
                      </h4>

                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                        Announcement
                      </p>
                    </div>
                  </div>

                  {
                    (() => {
                      const now = new Date();
                      const expiry = new Date(ann.end_date);

                      const isExpired = expiry < now;

                      const displayStatus = isExpired
                        ? "Expired"
                        : ann.status === "active"
                        ? "Active"
                        : "Hidden";

                      return (
                        <span style={getStatusStyle(displayStatus)}>
                          {displayStatus}
                        </span>
                      );
                    })()
                  }
                </div>

                <p
                  style={{
                    ...styles.websiteAnnouncementCardMessage,
                    fontFamily: ann.message_font_family || "Arial",
                    fontSize: ann.message_font_size || "14px",
                    fontWeight: ann.message_font_weight || "400",
                    color: ann.message_color || "#000000",
                    textAlign: ann.message_alignment || "left",
                  }}
                >
                  {ann.message || "No announcement message provided."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap: 14,
                  }}
                >
                  <div style={styles.websiteAnnouncementDateBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <i className="fi fi-rr-calendar"></i>
                      <span style={styles.websiteAnnouncementDateLabel}>
                        From
                      </span>
                    </div>

                    <div style={styles.websiteAnnouncementDateValue}>
                      {formatDate(start)}
                    </div>

                    <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
                      <i className="fi fi-rr-clock-three" style={{ marginRight: 6 }}></i>
                      {formatTime(start)}
                    </div>
                  </div>

                  <div style={styles.websiteAnnouncementDateBox}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <i className="fi fi-rr-calendar"></i>
                      <span style={styles.websiteAnnouncementDateLabel}>
                        Until
                      </span>
                    </div>

                    <div style={styles.websiteAnnouncementDateValue}>
                      {formatDate(end)}
                    </div>

                    <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
                      <i className="fi fi-rr-clock-three" style={{ marginRight: 6 }}></i>
                      {formatTime(end)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid #edf2f7",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <i className="fi fi-rr-time-past"></i>
                    ID #{ann.id}
                  </span>

                  <div style={styles.websiteAnnouncementActions}>
                    <button
                      type="button"
                      style={styles.websiteAnnouncementEditBtn}
                      onClick={() =>
                        setWebsiteAnnouncementOverlay({
                          ...ann,
                          start_date: ann.start_date ? String(ann.start_date).slice(0, 10) : "",
                          start_time: ann.start_date ? String(ann.start_date).slice(11, 16) : "",
                          end_date: ann.end_date ? String(ann.end_date).slice(0, 10) : "",
                          end_time: ann.end_date ? String(ann.end_date).slice(11, 16) : "",
                        })
                      }
                    >
                      <i className="fi fi-rr-file-edit"></i>
                      Edit
                    </button>

                    <button
                      type="button"
                      style={styles.websiteAnnouncementDeleteBtn}
                      onClick={() => {
                        setDeleteAnnouncementId(ann.id);
                        setDeleteAnnouncementModal(true);
                      }}
                    >
                      <i className="fi fi-rr-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}