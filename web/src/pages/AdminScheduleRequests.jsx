import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios';

const rowsPerPage = 10;

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

  async function updateRequestStatus(request, nextStatus) {
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
        { status: nextStatus }
      );

      setMessage({
        text: res.data.message || `Request ${nextStatus} successfully.`,
        type: 'success',
      });

      await loadRequests(statusFilter);
    } catch (err) {
      console.error('Failed to update schedule request', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to update request status.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
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
          onClick={() => updateRequestStatus(request, 'approved')}
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
          onClick={() => updateRequestStatus(request, 'rejected')}
        >
          <i className="fi fi-rr-cross"></i>
          <span>{actionLoadingId === request.id ? 'Saving...' : 'Reject'}</span>
        </button>
      </div>
    );
  }

  return (
    <>
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
              ...(page <= 1 ? styles.pageBtnDisabled : {}),
            }}
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>

          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            style={{
              ...styles.pageBtn,
              ...(page >= totalPages ? styles.pageBtnDisabled : {}),
            }}
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
        </div>
      </section>
    </>
  );
}