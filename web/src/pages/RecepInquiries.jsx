import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import StaffHeaderAvatar from '../components/StaffHeaderAvatar';
import clinicLogo from '../assets/clinicLogo/clinic-logo-nav.png';
import createRecepInquiriesStyles from '../styles/RecepInquiries';

const rowsPerPage = 10;

export default function RecepInquiries() {
  const { user } = useAuth();
  const profileMenuRef = useRef(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rangeFromDate, setRangeFromDate] = useState('');
  const [rangeToDate, setRangeToDate] = useState('');
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' });
  const [isClearRangePressed, setIsClearRangePressed] = useState(false);

  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replyHistory, setReplyHistory] = useState([]);
  const [replyHistoryLoading, setReplyHistoryLoading] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 480;
  const isSmallScreen = screenWidth <= 1200;

  const receptionistName = user?.name || 'Receptionist';

  const s = createRecepInquiriesStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
  });

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const origMargin = document.body.style.margin;
    const origOverflowX = document.body.style.overflowX;
    const origHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = origMargin;
      document.body.style.overflowX = origOverflowX;
      document.documentElement.style.overflowX = origHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, appliedRange.from, appliedRange.to]);

  async function loadInquiries() {
    setLoading(true);

    try {
      const res = await api.get('/website/inquiries');
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedPeriodInquiries = useMemo(() => {
    const from = appliedRange.from;
    const to = appliedRange.to;

    if (!from && !to) {
      return inquiries;
    }

    return inquiries.filter((inq) => {
      const dateText = String(inq.created_at || '').slice(0, 10);

      if (!dateText) {
        return false;
      }

      if (from && dateText < from) {
        return false;
      }

      if (to && dateText > to) {
        return false;
      }

      return true;
    });
  }, [inquiries, appliedRange.from, appliedRange.to]);

  const filteredInquiries = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) {
      return selectedPeriodInquiries;
    }

    return selectedPeriodInquiries.filter((inq) => {
      return (
        (inq.full_name || '').toLowerCase().includes(q) ||
        (inq.phone_number || '').toLowerCase().includes(q) ||
        (inq.concern || '').toLowerCase().includes(q) ||
        (inq.branch || '').toLowerCase().includes(q)
      );
    });
  }, [selectedPeriodInquiries, searchText]);

  const totalPages = Math.ceil(filteredInquiries.length / rowsPerPage) || 0;

  const pagedInquiries = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    return filteredInquiries.slice(start, start + rowsPerPage);
  }, [filteredInquiries, currentPage]);

  const unansweredCount = useMemo(() => {
    return inquiries.filter((inq) => Number(inq.reply_count || 0) === 0)
      .length;
  }, [inquiries]);

  function handleClearDateRange() {
    setRangeFromDate('');
    setRangeToDate('');
    setAppliedRange({ from: '', to: '' });
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  async function openReplyModal(inq) {
    setReplyModal(inq);
    setReplyText('');
    setReplyError('');
    setReplyHistory([]);
    setReplyHistoryLoading(true);

    try {
      const res = await api.get(`/website/inquiries/${inq.id}/replies`);
      setReplyHistory(res.data.replies || []);
    } catch {
      setReplyHistory([]);
    } finally {
      setReplyHistoryLoading(false);
    }
  }

  function closeReplyModal() {
    setReplyModal(null);
    setReplyText('');
    setReplyError('');
    setReplyHistory([]);
  }

  async function sendReply() {
    if (!replyText.trim()) {
      setReplyError('Please enter a reply message.');
      return;
    }

    setReplySending(true);
    setReplyError('');

    try {
      await api.post(`/website/inquiries/${replyModal.id}/reply`, {
        reply_message: replyText.trim(),
      });

      const res = await api.get(`/website/inquiries/${replyModal.id}/replies`);
      setReplyHistory(res.data.replies || []);
      setReplyText('');

      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === replyModal.id
            ? { ...inq, reply_count: (inq.reply_count || 0) + 1 }
            : inq
        )
      );
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplySending(false);
    }
  }

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={s.logoImg} />
        </div>

        <nav style={s.menu}>
          <Link to="/receptionist" style={s.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={s.menuItemIcon}
            ></i>
            <span style={s.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/receptionistAppointments" style={s.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={s.menuItemIcon}
            ></i>
            <span style={s.menuItemText}>Appointment</span>
          </Link>

          <Link to="/receptionistRecords" style={s.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={s.menuItemIcon}
            ></i>
            <span style={s.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/receptionistReceipts" style={s.menuItem}>
            <i
              className="fi fi-rr-file-invoice-dollar"
              style={s.menuItemIcon}
            ></i>
            <span style={s.menuItemText}>Receipt Verification</span>
          </Link>

          <Link to="/receptionistPatientAcc" style={s.menuItem}>
            <i className="fi fi-rr-id-badge" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Patient Account</span>
          </Link>

          <Link to="/receptionistInventory" style={s.menuItem}>
            <i className="fi fi-rr-boxes" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Inventory</span>
          </Link>

          <Link to="/receptionistMessage" style={s.menuItem}>
            <i className="fi fi-rr-comment-alt" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Messages</span>
            <MessageUnreadBadge />
          </Link>

          <Link
            to="/receptionistInquiries"
            style={{ ...s.menuItem, ...s.menuItemActive }}
          >
            <i className="fi fi-rr-inbox-in" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Online Inquiries</span>
          </Link>

          <Link to="/receptionistNotif" style={s.menuItem}>
            <i className="fi fi-rr-bell" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Notification</span>
            <NotificationUnreadBadge />
          </Link>
        </nav>

        <div style={s.logoutSection}>
          <button
            type="button"
            style={{ ...s.menuItem, ...s.logoutItem, width: '100%' }}
            onClick={() => setShowLogoutModal(true)}
          >
            <i className="fi fi-rr-sign-out-alt" style={s.menuItemIcon}></i>
            <span style={s.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={s.mainContainer}>
        <header style={s.topHeader}>
          <div style={s.headerActions}>
            <div style={s.profileDropdownWrapper} ref={profileMenuRef}>
              <button
                type="button"
                style={s.receptProfile}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <StaffHeaderAvatar styles={s} />

                <div style={s.receptInfo}>
                  <div style={s.receptName}>{receptionistName}</div>
                  <div style={s.receptPosition}>Receptionist</div>
                </div>
              </button>

              {showProfileMenu && (
                <div style={s.profileDropdown}>
                  <Link
                    to="/receptionistProfile"
                    style={s.viewProfileButton}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={s.mainContent}>
          <section style={s.heroSection}>
            <div style={s.heroContent}>
              <span style={s.heroBadge}>ONLINE INQUIRIES</span>

              <h2 style={s.heroTitle}>Manage Online Inquiries</h2>

              <p style={s.heroText}>
                View and track inquiries submitted through the website for your
                branch.
              </p>
            </div>

            {!isMobile && (
              <div style={s.heroIcon}>
                <i className="fi fi-rr-inbox-in" style={s.heroIconText}></i>
              </div>
            )}
          </section>

          <section style={s.summaryGrid}>
            <div style={s.summaryCard}>
              <div style={{ ...s.summaryIconWrap, background: '#eff6ff' }}>
                <i
                  className="fi fi-rr-inbox-in"
                  style={{ fontSize: 20, color: '#2563eb' }}
                ></i>
              </div>

              <div>
                <div style={s.summaryLabel}>Total Inquiries</div>
                <div style={s.summaryValue}>{inquiries.length}</div>
              </div>
            </div>

            <div style={s.summaryCard}>
              <div style={{ ...s.summaryIconWrap, background: '#fefce8' }}>
                <i
                  className="fi fi-rr-calendar"
                  style={{ fontSize: 20, color: '#ca8a04' }}
                ></i>
              </div>

              <div>
                <div style={s.summaryLabel}>Selected Period</div>
                <div style={s.summaryValue}>
                  {selectedPeriodInquiries.length}
                </div>
              </div>
            </div>

            <div style={s.summaryCard}>
              <div style={{ ...s.summaryIconWrap, background: '#f0fdf4' }}>
                <i
                  className="fi fi-rr-building"
                  style={{ fontSize: 20, color: '#16a34a' }}
                ></i>
              </div>

              <div>
                <div style={s.summaryLabel}>Unanswered</div>
                <div style={s.summaryValue}>{unansweredCount}</div>
              </div>
            </div>
          </section>

          <section style={s.filterCard}>
            <div style={s.searchBox}>
              <i className="fi fi-rr-search" style={s.searchIcon}></i>

              <input
                type="text"
                placeholder="Search name, phone, concern, or branch"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={s.searchInput}
              />
            </div>

            <div style={s.filterRight}>
              <div style={s.dateRangeRow}>
                <label style={s.dateRangeGroup}>
                  <span style={s.dateRangeLabel}>From</span>

                  <input
                    type="date"
                    value={rangeFromDate}
                    max={rangeToDate || ''}
                    onChange={(e) => {
                      const nextFrom = e.target.value;

                      if (
                        rangeToDate &&
                        nextFrom &&
                        nextFrom > rangeToDate
                      ) {
                        return;
                      }

                      setRangeFromDate(nextFrom);
                      setAppliedRange((prev) => ({
                        ...prev,
                        from: nextFrom,
                      }));
                    }}
                    style={s.dateRangeInput}
                  />
                </label>

                <label style={s.dateRangeGroup}>
                  <span style={s.dateRangeLabel}>To</span>

                  <input
                    type="date"
                    value={rangeToDate}
                    min={rangeFromDate || ''}
                    onChange={(e) => {
                      const nextTo = e.target.value;

                      if (
                        rangeFromDate &&
                        nextTo &&
                        nextTo < rangeFromDate
                      ) {
                        return;
                      }

                      setRangeToDate(nextTo);
                      setAppliedRange((prev) => ({
                        ...prev,
                        to: nextTo,
                      }));
                    }}
                    style={s.dateRangeInput}
                  />
                </label>

                <button
                  type="button"
                  style={{
                    ...s.dateRangeClearBtn,
                    ...(isClearRangePressed
                      ? s.dateRangeClearBtnPressed
                      : {}),
                  }}
                  onMouseDown={() => setIsClearRangePressed(true)}
                  onMouseUp={() => setIsClearRangePressed(false)}
                  onMouseLeave={() => setIsClearRangePressed(false)}
                  onClick={handleClearDateRange}
                >
                  Clear Range
                </button>
              </div>
            </div>
          </section>

          <section style={s.tableCard}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={s.cardTitle}>Inquiry List</h3>

                <p style={s.cardSubtitle}>
                  Online inquiries submitted for your branch only.
                </p>
              </div>

              <button type="button" style={s.refreshBtn} onClick={loadInquiries}>
                <i className="fi fi-rr-refresh"></i>
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <p style={s.loadingText}>Loading inquiries...</p>
            ) : (
              <div style={s.tableScroll}>
                <table style={s.inquiryTable}>
                  <thead>
                    <tr>
                      {[
                        'Full Name',
                        'Email',
                        'Phone',
                        'Branch',
                        'Concern',
                        'Message',
                        'Date Submitted',
                        'Action',
                      ].map((col) => (
                        <th key={col} style={s.th}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pagedInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={s.emptyCell}>
                          No inquiries found for your branch.
                        </td>
                      </tr>
                    ) : (
                      pagedInquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td style={s.td}>{inq.full_name}</td>
                          <td style={s.td}>{inq.email_address || '-'}</td>
                          <td style={s.td}>{inq.phone_number}</td>
                          <td style={s.td}>{inq.branch}</td>
                          <td style={s.td}>{inq.concern}</td>
                          <td style={{ ...s.td, maxWidth: 220 }}>
                            {inq.message}
                          </td>
                          <td style={s.td}>
                            {String(inq.created_at || '').slice(0, 10)}
                          </td>
                          <td style={s.td}>
                            <button
                              type="button"
                              style={s.replyBtn}
                              onClick={() => openReplyModal(inq)}
                            >
                              <i
                                className="fi fi-rr-paper-plane"
                                style={{
                                  fontSize: 12,
                                  marginRight: 2,
                                }}
                              ></i>
                              Reply
                              {inq.reply_count > 0 && (
                                <span style={s.replyCountBadge}>
                                  {inq.reply_count}
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <div style={s.pagination}>
                <button
                  type="button"
                  style={{
                    ...s.pageBtn,
                    ...s.prevPageBtn,
                    ...(currentPage <= 1 || totalPages === 0
                      ? s.pageBtnDisabled
                      : {}),
                  }}
                  disabled={currentPage <= 1 || totalPages === 0}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>

                <span style={s.pageInfo}>
                  Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  style={{
                    ...s.pageBtn,
                    ...s.nextPageBtn,
                    ...(totalPages === 0 || currentPage >= totalPages
                      ? s.pageBtnDisabled
                      : {}),
                  }}
                  disabled={totalPages === 0 || currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      totalPages === 0 ? 1 : Math.min(totalPages, p + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {replyModal && (
        <div
          style={s.replyOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeReplyModal();
            }
          }}
        >
          <div style={s.replyModalBox}>
            <div style={s.replyModalHeader}>
              <div>
                <div style={s.replyModalTitle}>Reply to Inquiry</div>
                <div style={s.replyModalSub}>
                  {replyModal.full_name} · {replyModal.email_address}
                </div>
              </div>

              <button
                type="button"
                style={s.replyCloseBtn}
                onClick={closeReplyModal}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <div style={s.replyModalBody}>
              <div style={s.replyCard}>
                <div style={s.replyCardHeader}>
                  <div style={s.replyCardIcon}>
                    <i className="fi fi-rr-user"></i>
                  </div>

                  <div>
                    <div style={s.replyCardTitle}>Patient Information</div>
                    <div style={s.replyCardSubtitle}>
                      Review the inquiry details before replying.
                    </div>
                  </div>
                </div>

                <div style={s.replyInfoGrid}>
                  <div style={s.replyInfoItem}>
                    <div style={s.replyInfoLabel}>Full Name</div>
                    <div style={s.replyInfoValue}>
                      {replyModal.full_name || "-"}
                    </div>
                  </div>

                  <div style={s.replyInfoItem}>
                    <div style={s.replyInfoLabel}>Email Address</div>
                    <div style={s.replyInfoValue}>
                      {replyModal.email_address || "-"}
                    </div>
                  </div>

                  <div style={s.replyInfoItem}>
                    <div style={s.replyInfoLabel}>Phone Number</div>
                    <div style={s.replyInfoValue}>
                      {replyModal.phone_number || "-"}
                    </div>
                  </div>

                  <div style={s.replyInfoItem}>
                    <div style={s.replyInfoLabel}>Branch</div>
                    <div style={s.replyInfoValue}>
                      {replyModal.branch || "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      ...s.replyInfoItem,
                      gridColumn: "1 / -1",
                    }}
                  >
                    <div style={s.replyInfoLabel}>Concern</div>

                    <div>
                      <span style={s.replyConcernBadge}>
                        {replyModal.concern}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={s.replyMessageBox}>
                  <div style={s.replyMessageLabel}>
                    Patient Message
                  </div>

                  <div style={s.replyOriginalMsg}>
                    {replyModal.message}
                  </div>
                </div>
              </div>

              {replyHistoryLoading ? (
                <div style={s.replyLoadingCard}>
                  <i
                    className="fi fi-rr-spinner"
                    style={{ marginRight: 8 }}
                  ></i>

                  Loading conversation...
                </div>
              ) : replyHistory.length > 0 ? (
                <div style={s.replyCard}>
                  <div style={s.replyHistoryHeader}>
                    <span>Conversation History</span>

                    <span style={s.replyHistoryCount}>
                      {replyHistory.length} Replies
                    </span>
                  </div>

                  <div style={s.replyHistoryList}>
                    {replyHistory.map((r) => (
                      <div key={r.id} style={s.replyBubble}>
                        <div style={s.replyBubbleHeader}>
                          <div style={s.replyAvatar}>
                            <i className="fi fi-rr-user"></i>
                          </div>

                          <div>
                            <div style={s.replySender}>
                              {r.replied_by_name}
                            </div>

                            <div style={s.replyDate}>
                              {String(r.created_at || "")
                                .slice(0, 16)
                                .replace("T", " ")}
                            </div>
                          </div>
                        </div>

                        <div style={s.replyBubbleText}>
                          {r.reply_message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div style={s.replyCard}>
                <div style={s.replyEditorHeader}>
                  <i className="fi fi-rr-edit"></i>
                  <span>Write Reply</span>
                </div>

                <textarea
                  style={s.replyTextarea}
                  placeholder="Type your reply to the patient..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  disabled={replySending}
                />

                {replyError && (
                  <div style={s.replyErrorText}>
                    <i
                      className="fi fi-rr-cross-circle"
                      style={{ marginRight: 6 }}
                    ></i>

                    {replyError}
                  </div>
                )}
              </div>

              <div style={s.replyModalActions}>
                <button
                  type="button"
                  style={s.replyCancelBtn}
                  onClick={closeReplyModal}
                  disabled={replySending}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  style={s.replySendBtn}
                  onClick={sendReply}
                  disabled={replySending}
                >
                  {replySending ? (
                    "Sending..."
                  ) : (
                    <>
                      <i
                        className="fi fi-rr-paper-plane"
                        style={{ marginRight: 8 }}
                      ></i>

                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div
          style={s.modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div style={s.modalContent}>
            <div style={s.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={s.modalIconText}
              ></i>
            </div>

            <h2 style={s.modalTitle}>Confirm Logout</h2>

            <p style={s.modalText}>Are you sure you want to log out?</p>

            <div style={s.modalActions}>
              <button
                type="button"
                style={{ ...s.modalButton, ...s.cancelBtn }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...s.modalButton, ...s.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}