import { useEffect, useMemo, useRef, useState } from 'react';
import createAdminScheduleRequestsStyles from '../styles/AdminScheduleRequests';
import { listAdminScheduleRequests, updateScheduleRequest } from '../api/scheduleRequests';

const rowsPerPage = 10;

function formatDateRange(from, to) {
  const normalize = (v) => (v ? String(v).split('T')[0] : '');
  const start = normalize(from);
  const end = normalize(to);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || '—';
}

function formatSubmittedOn(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function extractCity(address) {
  if (!address) return 'N/A';
  const parts = String(address).split(',');
  return parts[parts.length - 1].trim() || 'N/A';
}

function mapRequest(row) {
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const fullReason = row.reason || '—';
  const reason = fullReason.length > 40 ? fullReason.substring(0, 40) + '…' : fullReason;
  return {
    id: row.id,
    dentistName: row.dentist_name || 'Unknown',
    requestType: row.request_type === 'transfer' ? 'Transfer Request' : 'Leave Request',
    currentBranch: extractCity(row.current_branch_address),
    scheduleDates: formatDateRange(row.date_from, row.date_to),
    workingDays: row.working_days,
    reason,
    fullReason,
    submittedOn: formatSubmittedOn(row.submitted_at),
    status: capitalize(row.status),
  };
}

export default function AdminScheduleRequests({
  adminSettingsStyles = {},
  isMobile = false,
  isSmallScreen = false,
  highlightRequestId = null,
}) {
  const styles = createAdminScheduleRequestsStyles({
    adminSettingsStyles,
    isMobile,
    isSmallScreen,
  });

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeHighlightId, setActiveHighlightId] = useState(highlightRequestId);
  const highlightRowRef = useRef(null);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!activeHighlightId) return;
    if (highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const timer = setTimeout(() => setActiveHighlightId(null), 5000);
    return () => clearTimeout(timer);
  }, [activeHighlightId, requests]);

  function loadRequests() {
    listAdminScheduleRequests()
      .then(data => setRequests((data.requests || []).map(mapRequest)))
      .catch(() => {});
  }

  const totalPages = Math.ceil(requests.length / rowsPerPage);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return requests.slice(start, start + rowsPerPage);
  }, [requests, currentPage]);

  function handleView(request) {
    setSelectedRequest(request);
  }

  function closeModal() {
    setSelectedRequest(null);
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  async function handleApprove() {
    if (!selectedRequest) return;
    try {
      await updateScheduleRequest(selectedRequest.id, 'approved');
      setRequests((prev) =>
        prev.map((r) => r.id === selectedRequest.id ? { ...r, status: 'Approved' } : r)
      );
    } catch {
      loadRequests();
    }
    setSelectedRequest(null);
  }

  async function handleReject() {
    if (!selectedRequest) return;
    try {
      await updateScheduleRequest(selectedRequest.id, 'rejected');
      setRequests((prev) =>
        prev.map((r) => r.id === selectedRequest.id ? { ...r, status: 'Rejected' } : r)
      );
    } catch {
      loadRequests();
    }
    setSelectedRequest(null);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function statusStyle(status) {
    const statusKey = String(status || '').toLowerCase();

    if (statusKey === 'approved') {
      return { ...styles.statusBadge, ...styles.statusApproved };
    }

    if (statusKey === 'rejected') {
      return { ...styles.statusBadge, ...styles.statusRejected };
    }

    return { ...styles.statusBadge, ...styles.statusPending };
  }

  return (
    <>
      <section style={styles.tableCard}>
        <div style={styles.accountHeader}>
          <div>
            <h3 style={styles.accountTitle}>Leave Requests</h3>
            <p style={styles.accountSubtitle}>
              Review dentist leave requests before approving or rejecting schedule changes.
            </p>
          </div>

          <span style={styles.totalBadge}>{requests.length} Requests</span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.branchTable}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Dentist Name</th>
                <th style={styles.tableHead}>Branch</th>
                <th style={styles.tableHead}>Leave Dates</th>
                <th style={styles.tableHead}>Reason</th>
                <th style={styles.tableHead}>Submitted On</th>
                <th style={styles.tableHead}>Status</th>
                <th style={styles.tableHead}>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyRow}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => {
                const isHighlighted = activeHighlightId && String(request.id) === String(activeHighlightId);
                return (
                  <tr
                    key={request.id}
                    ref={isHighlighted ? highlightRowRef : null}
                    style={{
                      ...styles.tableRow,
                      ...(isHighlighted ? {
                        background: '#fffbeb',
                        outline: '2px solid #f59e0b',
                        outlineOffset: '-2px',
                        transition: 'background 0.5s, outline 0.5s',
                      } : { transition: 'background 0.5s' }),
                    }}
                  >
                    <td style={styles.tableCellStrong}>{request.dentistName}</td>
                    <td style={styles.tableCell}>{request.currentBranch}</td>
                    <td style={styles.tableCell}>{request.scheduleDates}</td>
                    <td style={styles.tableCell}>{request.reason}</td>
                    <td style={styles.tableCell}>{request.submittedOn}</td>
                    <td style={styles.tableCell}>
                      <span style={statusStyle(request.status)}>{request.status}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        type="button"
                        style={styles.viewBtn}
                        onClick={() => handleView(request)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage === 1}
            style={{
              ...styles.pageBtn,
              ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>

          <span style={styles.pageInfo}>
            {requests.length === 0 ? 'Page 0 of 0' : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            style={{
              ...styles.pageBtn,
              ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
            }}
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
        </div>
      </section>

      {selectedRequest && (
        <div style={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div style={styles.detailsModal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Leave Request Details</h3>
                <p style={styles.modalSubtitle}>Full information for the selected request.</p>
              </div>

              <button type="button" style={styles.closeBtn} onClick={closeModal}>
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <div style={styles.detailsGrid}>
              <InfoItem styles={styles} label="Dentist Name" value={selectedRequest.dentistName} />
              <InfoItem styles={styles} label="Branch" value={selectedRequest.currentBranch} />
              <InfoItem styles={styles} label="Leave Dates" value={selectedRequest.scheduleDates} />
              <InfoItem styles={styles} label="Submitted On" value={selectedRequest.submittedOn} />
              <InfoItem
                styles={styles}
                label="Status"
                value={
                  <span style={statusStyle(selectedRequest.status)}>
                    {selectedRequest.status}
                  </span>
                }
              />
            </div>

            <div style={styles.reasonBox}>
              <span style={styles.infoLabel}>Reason</span>
              <p style={styles.reasonText}>{selectedRequest.fullReason}</p>
            </div>

            <div style={styles.modalActions}>
              <button type="button" style={styles.rejectBtn} onClick={handleReject}>
                Reject
              </button>

              <button type="button" style={styles.approveBtn} onClick={handleApprove}>
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoItem({ styles, label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || 'N/A'}</span>
    </div>
  );
}