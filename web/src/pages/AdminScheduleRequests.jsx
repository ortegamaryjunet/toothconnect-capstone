import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios';

const rowsPerPage = 10;
const REJECTION_REASON_MIN_LENGTH = 10;
const REJECTION_REASON_MAX_LENGTH = 500;
const REJECTION_REASON_ALLOWED_REGEX = /^[a-zA-Z0-9\s.,]+$/;
const REJECTION_REASON_WORD_REGEX = /[a-zA-Z]{2,}/;

const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected', 'cancelled'];

function formatDate(value) {
  if (!value) return 'N/A';
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 19).replace('T', ' ');
  }

  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(status) {
  const value = String(status || '').trim();

  if (!value) return 'N/A';

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatRequestType(type) {
  const value = String(type || '').trim();

  if (value === 'leave') return 'Leave';
  if (value === 'transfer') return 'Transfer';

  return value ? formatStatus(value) : 'N/A';
}

export default function AdminScheduleRequests({
  adminSettingsStyles,
  getStatusStyle,
  highlightRequestId,
}) {
  const styles = adminSettingsStyles;

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [approveRequest, setApproveRequest] = useState(null);
  const [rejectRequest, setRejectRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [rejectSuccessModal, setRejectSuccessModal] = useState(null);

  async function loadRequests(selectedStatus = statusFilter) {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const params = {};

      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      const res = await api.get('/dentist-dashboard/admin/schedule-requests', {
        params,
      });

      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to load schedule requests', err);
      setRequests([]);
      setMessage({
        text: err.response?.data?.message || 'Failed to load leave requests.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests('All');
  }, []);

  useEffect(() => {
    if (highlightRequestId) {
      setPage(1);
    }
  }, [highlightRequestId]);

  useEffect(() => {
    if (!rejectSuccessModal) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRejectSuccessModal(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [rejectSuccessModal]);

  const filteredRequests = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    return requests.filter((request) => {
      const status = String(request.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'All' || status === statusFilter.toLowerCase();

      const searchableText = [
        request.id,
        request.dentist_name,
        request.request_type,
        request.status,
        request.date_from,
        request.date_to,
        request.reason,
        request.rejection_reason,
        request.current_branch_address,
        request.requested_branch_name,
        request.transfer_type,
        request.duration,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchableText.includes(search);
    });
  }, [requests, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage));

  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, page]);

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setPage(1);
    loadRequests(value);
  }

  function isFinalStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    return ['approved', 'rejected', 'cancelled', 'canceled'].includes(normalized);
  }

  function getRequestSummaryRows(request) {
    if (!request) return [];

    return [
      ['Dentist', request.dentist_name || 'N/A'],
      ['Request Type', formatRequestType(request.request_type)],
      ['From Date', formatDate(request.date_from)],
      ['To Date', formatDate(request.date_to)],
      ['Working Days', request.working_days ?? 'N/A'],
      ['Current Branch', request.current_branch_address || 'N/A'],
      ['Requested Branch', request.requested_branch_name || 'N/A'],
      ['Reason', request.reason || 'N/A'],
      ['Submitted', formatDateTime(request.submitted_at)],
    ];
  }

  function closeApproveModal() {
    if (actionLoadingId) return;
    setApproveRequest(null);
  }

  function closeRejectModal() {
    if (actionLoadingId) return;
    setRejectRequest(null);
    setRejectReason('');
    setRejectReasonError('');
  }

  function getRejectReasonValidationError(value) {
    const rawValue = String(value || '');
    const cleanValue = rawValue.trim();

    if (!cleanValue) {
      return 'Please enter the reason for rejecting this leave request.';
    }

    if (cleanValue.length < REJECTION_REASON_MIN_LENGTH) {
      return 'Reason for rejection must be at least 10 characters.';
    }

    if (rawValue.length > REJECTION_REASON_MAX_LENGTH) {
      return 'Reason for rejection must not exceed 500 characters.';
    }

    if (
      !REJECTION_REASON_ALLOWED_REGEX.test(cleanValue) ||
      !REJECTION_REASON_WORD_REGEX.test(cleanValue)
    ) {
      return 'Please enter a valid reason for rejection. Special Characters are not allowed.';
    }

    return '';
  }

  function handleModalOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  async function updateRequestStatus(request, nextStatus, rejectionReason = '') {
    const currentStatus = String(request.status || '').toLowerCase();

    if (isFinalStatus(currentStatus)) {
      setMessage({
        text: 'This request already has a final status. No action is allowed.',
        type: 'error',
      });
      return;
    }

    setActionLoadingId(request.id);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.patch(
        `/dentist-dashboard/admin/schedule-requests/${request.id}`,
        {
          status: nextStatus,
          ...(nextStatus === 'rejected'
            ? { rejection_reason: rejectionReason }
            : {}),
        }
      );

      setMessage({
        text: res.data.message || `Request ${nextStatus} successfully.`,
        type: 'success',
      });

      await loadRequests(statusFilter);
      return true;
    } catch (err) {
      console.error('Failed to update schedule request', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to update request status.',
        type: 'error',
      });
      return false;
    } finally {
      setActionLoadingId(null);
    }
  }

  async function confirmApproveRequest() {
    if (!approveRequest) return;

    const updated = await updateRequestStatus(approveRequest, 'approved');

    if (updated) {
      setApproveRequest(null);
    }
  }

  async function confirmRejectRequest() {
    if (!rejectRequest) return;

    const cleanReason = rejectReason.trim();
    const validationError = getRejectReasonValidationError(rejectReason);

    if (validationError) {
      setRejectReasonError(validationError);
      return;
    }

    const updated = await updateRequestStatus(rejectRequest, 'rejected', cleanReason);

    if (updated) {
      closeRejectModal();
      setRejectSuccessModal({
        title: 'Leave Request Rejected',
        message: 'Leave request rejection successful.',
      });
    }
  }

  function renderActionButtons(request) {
    const status = String(request.status || '').toLowerCase();

    if (isFinalStatus(status)) {
      return (
        <span style={styles.actionMutedText}>
          No action available
        </span>
      );
    }

    return (
      <div style={styles.leaveRequestActionGroup}>
        <button
          type="button"
          style={{
            ...styles.approveBtn,
            opacity: actionLoadingId === request.id ? 0.7 : 1,
            cursor: actionLoadingId === request.id ? 'not-allowed' : 'pointer',
          }}
          disabled={actionLoadingId === request.id}
          onClick={() => setApproveRequest(request)}
        >
          <i className="fi fi-rr-check"></i>
          <span>{actionLoadingId === request.id ? 'Saving...' : 'Approve'}</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.rejectBtn,
            opacity: actionLoadingId === request.id ? 0.7 : 1,
            cursor: actionLoadingId === request.id ? 'not-allowed' : 'pointer',
          }}
          disabled={actionLoadingId === request.id}
          onClick={() => {
            setRejectRequest(request);
            setRejectReason('');
            setRejectReasonError('');
          }}
        >
          <i className="fi fi-rr-cross"></i>
          <span>{actionLoadingId === request.id ? 'Saving...' : 'Reject'}</span>
        </button>
      </div>
    );
  }

  const rejectReasonLength = rejectReason.length;
  const isRejectSubmitting = actionLoadingId === rejectRequest?.id;

  return (
    <main>
      <section style={styles.toolbar}>
        <div style={styles.searchBox}>
          <i className="fi fi-rr-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search dentist, reason, branch, or status"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
            }}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.rightActions}>
          <select
            value={statusFilter}
            onChange={(event) => handleStatusFilterChange(event.target.value)}
            style={styles.selectInput}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Status' : formatStatus(status)}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={styles.primaryBtn}
            onClick={() => loadRequests(statusFilter)}
            disabled={loading}
          >
            <i className="fi fi-rr-refresh"></i>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </section>

      {message.text && (
        <p style={message.type === 'success' ? styles.successText : styles.errorText}>
          {message.text}
        </p>
      )}

      <section style={styles.tableCard}>
        <div style={styles.tableWrapper}>
          <table style={{ ...styles.branchTable, minWidth: 1180 }}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Dentist</th>
                <th style={styles.tableHead}>Request Type</th>
                <th style={styles.tableHead}>Date From</th>
                <th style={styles.tableHead}>Date To</th>
                <th style={styles.tableHead}>Working Days</th>
                <th style={styles.tableHead}>Current Branch</th>
                <th style={styles.tableHead}>Requested Branch</th>
                <th style={styles.tableHead}>Reason</th>
                <th style={styles.tableHead}>Submitted</th>
                <th style={styles.tableHead}>Status</th>
                <th style={styles.tableHead}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={styles.emptyRow}>
                    Loading leave requests...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={11} style={styles.emptyRow}>
                    No leave request records found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => {
                  const isHighlighted =
                    String(request.id) === String(highlightRequestId || '');

                  return (
                    <tr
                      key={request.id}
                      style={{
                        ...styles.tableRow,
                        ...(isHighlighted
                          ? { background: '#eff6ff', outline: '2px solid #2563eb' }
                          : {}),
                      }}
                    >
                      <td style={styles.tableCell}>
                        {request.dentist_name || 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        {formatRequestType(request.request_type)}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(request.date_from)}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(request.date_to)}
                      </td>
                      <td style={styles.tableCell}>
                        {request.working_days ?? 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        {request.current_branch_address || 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        {request.requested_branch_name || 'N/A'}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={request.reason || ''}
                      >
                        {request.reason || 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDateTime(request.submitted_at)}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={getStatusStyle(request.status)}>
                          {formatStatus(request.status)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {renderActionButtons(request)}
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
            style={{
              ...styles.pageBtn,
              ...styles.prevPageBtn,
              ...(page <= 1 ? styles.pageBtnDisabled : {}),
            }}
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>

          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            style={{
              ...styles.pageBtn,
              ...styles.nextPageBtn,
              ...(page >= totalPages ? styles.pageBtnDisabled : {}),
            }}
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </section>

      {approveRequest && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeApproveModal)}
        >
          <div style={{ ...styles.modalContent, ...styles.leaveDecisionModalContent }}>
            <h2 style={styles.modalTitle}>Approve Leave Request</h2>
            <p style={styles.modalText}>
              Review the leave request details before approving this request.
            </p>

            <div style={styles.leaveDecisionDetails}>
              {getRequestSummaryRows(approveRequest).map(([label, value]) => (
                <div key={label} style={styles.leaveDecisionRow}>
                  <div style={styles.leaveDecisionLabel}>{label}</div>
                  <div style={styles.leaveDecisionValue}>{value}</div>
                </div>
              ))}
            </div>

            <p style={styles.leaveDecisionQuestion}>
              Do you want to approve this leave request?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeApproveModal}
                disabled={actionLoadingId === approveRequest.id}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.approveConfirmBtn }}
                onClick={confirmApproveRequest}
                disabled={actionLoadingId === approveRequest.id}
              >
                {actionLoadingId === approveRequest.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectRequest && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeRejectModal)}
        >
          <div style={{ ...styles.modalContent, ...styles.leaveDecisionModalContent }}>
            <h2 style={styles.modalTitle}>Reject Leave Request</h2>
            <p style={styles.modalText}>
              Enter the reason for rejecting this leave request.
            </p>

            <div style={styles.leaveDecisionDetails}>
              {getRequestSummaryRows(rejectRequest)
                .filter(([label]) => ['Dentist', 'From Date', 'To Date', 'Reason'].includes(label))
                .map(([label, value]) => (
                  <div key={label} style={styles.leaveDecisionRow}>
                    <div style={styles.leaveDecisionLabel}>{label}</div>
                    <div style={styles.leaveDecisionValue}>{value}</div>
                  </div>
                ))}
            </div>

            <label
              htmlFor="leave-rejection-remarks"
              style={{
                ...styles.leaveDecisionLabel,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Remarks
            </label>
            <textarea
              id="leave-rejection-remarks"
              rows={4}
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value);
                setRejectReasonError('');
              }}
              placeholder="Reason for rejection..."
              style={styles.leaveRejectTextarea}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: -6,
                marginBottom: rejectReasonError ? 4 : 14,
                color:
                  rejectReasonLength > REJECTION_REASON_MAX_LENGTH
                    ? '#dc2626'
                    : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {rejectReasonLength}/{REJECTION_REASON_MAX_LENGTH}
            </div>

            {rejectReasonError ? (
              <p style={styles.errorText}>{rejectReasonError}</p>
            ) : null}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeRejectModal}
                disabled={actionLoadingId === rejectRequest.id}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  ...styles.modalButton,
                  ...styles.rejectConfirmBtn,
                  ...(isRejectSubmitting
                    ? {
                        opacity: 0.7,
                        cursor: 'not-allowed',
                      }
                    : {}),
                }}
                onClick={confirmRejectRequest}
                disabled={isRejectSubmitting}
              >
                {isRejectSubmitting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectSuccessModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div
              style={{
                ...styles.modalIcon,
                background: '#dcfce7',
                color: '#16a34a',
              }}
            >
              <i className="fi fi-rr-check-circle" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>{rejectSuccessModal.title}</h2>
            <p style={{ ...styles.modalText, marginBottom: 0 }}>
              {rejectSuccessModal.message}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
