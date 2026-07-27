import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createStaffPayment,
  listPayments,
  reopenReceiptUpload,
  updatePaymentAmount,
  updatePaymentStatus,
} from '../api/payments';
import { useAuth } from '../auth/AuthContext';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createRecepReceiptsStyles from '../styles/RecepReceipts';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

function getReceiptStatusLabel(status) {
  const labels = {
    'Pending Validation': 'Pending',
    Validated: 'Acknowledged',
  };

  return labels[status] || status;
}

function mapPaymentToReceipt(payment) {
  const paidOrCreated = payment.paid_at || payment.receipt_uploaded_at || payment.created_at;
  const isStaffRecorded = payment.payment_source === 'staff_recorded';
  const staffProofUrl = payment.proof_image_url || '';
  const staffProofFileName =
    payment.proof_image_file_name ||
    getFileNameFromUrl(staffProofUrl) ||
    'Recorded manually by staff';

  return {
    id: `APT-${payment.appointment_id}`,
    appointmentId: payment.appointment_id,
    paymentId: payment.id,
    patientName: payment.patient_name || 'Unnamed Patient',
    service: payment.service_name || 'Treatment not set',
    dentist: payment.dentist_name || 'Dentist not set',
    appointmentDate: formatDate(paidOrCreated),
    appointmentTime: formatTime(paidOrCreated),
    amountValue: Number(payment.amount_received || payment.amount || 0),
    amount: formatPeso(payment.amount_received || payment.amount),
    paymentMethod: formatPaymentMethod(payment.payment_method, payment.ewallet_provider),
    rawPaymentMethod: payment.payment_method || '',
    paymentSource: payment.payment_source || 'patient_upload',
    referenceNumber: payment.reference_number || '',
    proofImageUrl: payment.proof_image_url || '',
    recordedByName: payment.recorded_by_name || '',
    recordedAt: payment.recorded_at ? formatDateTime(payment.recorded_at) : '',
    fileType: isStaffRecorded
      ? staffProofUrl
        ? 'Staff Proof'
        : 'Staff Recorded'
      : payment.receipt_mime_type
        ? payment.receipt_mime_type.split('/').pop().toUpperCase()
        : 'Pending',
    fileName: isStaffRecorded
      ? staffProofFileName
      : payment.receipt_file_name || 'Awaiting patient upload',
    receiptUrl: payment.receipt_url || '',
    uploadedAt: isStaffRecorded
      ? payment.recorded_at
        ? formatDateTime(payment.recorded_at)
        : 'Recorded manually'
      : payment.receipt_uploaded_at
        ? formatDateTime(payment.receipt_uploaded_at)
        : 'Not uploaded yet',
    status: payment.status === 'verified'
      ? 'Validated'
      : payment.status === 'rejected'
        ? 'Rejected'
        : 'Pending Validation',
  };
}

function getFileNameFromUrl(url) {
  if (!url) return '';

  const cleanPath = String(url).split('?')[0];
  const fileName = cleanPath.split('/').pop();

  return fileName ? decodeURIComponent(fileName) : '';
}

function getPaymentDisplayPriority(payment) {
  let priority = 0;

  if (payment.status === 'rejected') priority += 10;
  if (payment.status === 'pending') priority += 20;
  if (payment.payment_source === 'staff_recorded') priority += 30;
  if (payment.status === 'verified') priority += 40;

  return priority;
}

function getPaymentActivityTime(payment) {
  const value =
    payment.paid_at ||
    payment.verified_at ||
    payment.recorded_at ||
    payment.receipt_uploaded_at ||
    payment.updated_at ||
    payment.created_at;
  const time = value ? new Date(value).getTime() : 0;

  return Number.isFinite(time) ? time : 0;
}

function preferPaymentForReceipt(currentPayment, nextPayment) {
  if (!currentPayment) return nextPayment;

  const currentPriority = getPaymentDisplayPriority(currentPayment);
  const nextPriority = getPaymentDisplayPriority(nextPayment);

  if (nextPriority !== currentPriority) {
    return nextPriority > currentPriority ? nextPayment : currentPayment;
  }

  return getPaymentActivityTime(nextPayment) > getPaymentActivityTime(currentPayment)
    ? nextPayment
    : currentPayment;
}

function prepareReceiptPayments(payments) {
  const paymentsByAppointment = new Map();

  payments
    .filter((payment) => payment.payment_method !== 'cash' || payment.payment_source === 'staff_recorded')
    .forEach((payment) => {
      paymentsByAppointment.set(
        payment.appointment_id,
        preferPaymentForReceipt(paymentsByAppointment.get(payment.appointment_id), payment)
      );
    });

  return Array.from(paymentsByAppointment.values()).sort(
    (a, b) => getPaymentActivityTime(b) - getPaymentActivityTime(a)
  );
}

function receiptStatusLabel(status) {
  if (status === 'Validated') return 'Acknowledged Receipt';
  if (status === 'Pending Validation') return 'Pending Acknowledgement';
  return status;
}

function formatPeso(value) {
  return `₱${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPaymentMethod(value, provider) {
  const providerValue = String(provider || '').trim();

  if ((value === 'ewallet' || value === 'bank_transfer') && providerValue) {
    return providerValue;
  }

  const labels = {
    cash: 'Cash',
    ewallet: 'E-wallet',
    bank_transfer: 'Bank',
    card: 'Card',
  };

  return labels[value] || 'Payment';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '-';
  return `${formatDate(value)} at ${formatTime(value)}`;
}

export default function RecepReceipts() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightPaymentId = searchParams.get('highlightPaymentId');
  const receiptRefs = useRef({});

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [expandedReceiptIds, setExpandedReceiptIds] = useState([]);

  const [receipts, setReceipts] = useState([]);
  const [highlightedReceiptId, setHighlightedReceiptId] = useState('');

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [messageModal, setMessageModal] = useState({
    show: false,
    title: '',
    text: '',
    type: 'success',
  });
  const [manualPaymentModal, setManualPaymentModal] = useState({
    show: false,
    receipt: null,
    method: 'cash',
    amount: '',
    reference: '',
    proofFile: null,
    saving: false,
  });

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isTablet = screenWidth <= 992;

  const styles = createRecepReceiptsStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isTablet,
  });

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

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (!highlightPaymentId || receipts.length === 0) {
      return undefined;
    }

    const targetReceipt = receipts.find(
      (receipt) => String(receipt.paymentId) === String(highlightPaymentId)
    );

    if (!targetReceipt) {
      return undefined;
    }

    setSearchText('');
    setStatusFilter('all');
    setExpandedReceiptIds((currentIds) =>
      currentIds.includes(targetReceipt.id)
        ? currentIds
        : [...currentIds, targetReceipt.id]
    );
    setHighlightedReceiptId(targetReceipt.id);

    window.setTimeout(() => {
      receiptRefs.current[targetReceipt.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);

    const timeoutId = window.setTimeout(() => {
      setHighlightedReceiptId('');
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [highlightPaymentId, receipts]);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    if (showLogoutModal || messageModal.show || manualPaymentModal.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, messageModal.show, manualPaymentModal.show]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeMessageModal();
        closeManualPaymentModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredReceipts = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const patientName = receipt.patientName.toLowerCase();
      const appointmentId = receipt.id.toLowerCase();

      const matchesSearch =
        patientName.includes(searchValue) || appointmentId.includes(searchValue);

      const matchesStatus =
        statusFilter === 'all' || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchText, statusFilter]);

  const receptionistName = user?.name || user?.email || 'Receptionist';

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function handleModalOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  function toggleReceiptDetails(receiptId) {
    setExpandedReceiptIds((currentIds) => {
      if (currentIds.includes(receiptId)) {
        return currentIds.filter((id) => id !== receiptId);
      }

      return [...currentIds, receiptId];
    });
  }

  async function updateReceiptStatus(receipt, status) {
    try {
      await updatePaymentStatus(receipt.paymentId, {
        status: status === 'Validated' ? 'verified' : 'rejected',
      });

      setReceipts((currentReceipts) =>
        currentReceipts.map((currentReceipt) =>
          currentReceipt.paymentId === receipt.paymentId
            ? { ...currentReceipt, status }
            : currentReceipt
        )
      );

      if (status === 'Validated') {
        showMessage(
          'Payment Receipt Acknowledged',
          'The patient uploaded receipt has been acknowledged successfully.',
          'success'
        );
        return;
      }

      showMessage(
        'Receipt Rejected',
        'The patient uploaded receipt has been marked as rejected.',
        'error'
      );
    } catch (err) {
      showMessage(
        'Update Failed',
        err.response?.data?.message || 'Failed to update receipt status.',
        'error'
      );
    }
  }

  async function handleReopenReceiptUpload(receipt) {
    try {
      await reopenReceiptUpload(receipt.paymentId);

      setReceipts((currentReceipts) =>
        currentReceipts.map((currentReceipt) =>
          currentReceipt.paymentId === receipt.paymentId
            ? {
                ...currentReceipt,
                status: 'Pending Validation',
                fileType: 'Pending',
                fileName: 'Awaiting patient upload',
                receiptUrl: '',
                uploadedAt: 'Not uploaded yet',
              }
            : currentReceipt
        )
      );

      showMessage(
        'Upload Re-enabled',
        'The patient can now upload a new payment receipt from mobile.',
        'success'
      );
    } catch (err) {
      showMessage(
        'Update Failed',
        err.response?.data?.message || 'Failed to re-enable receipt upload.',
        'error'
      );
    }
  }

  async function handleUpdateAmount(receipt, amount) {
    try {
      const updated = await updatePaymentAmount(receipt.paymentId, { amount });
      const amountValue = Number(updated.amount ?? amount);

      setReceipts((currentReceipts) =>
        currentReceipts.map((currentReceipt) =>
          currentReceipt.paymentId === receipt.paymentId
            ? {
                ...currentReceipt,
                amountValue,
                amount: formatPeso(amountValue),
              }
            : currentReceipt
        )
      );

      showMessage('Amount Updated', 'The pending receipt amount has been updated.', 'success');
      return true;
    } catch (err) {
      showMessage(
        'Update Failed',
        err.response?.data?.message || 'Failed to update payment amount.',
        'error'
      );
      return false;
    }
  }

  function openManualPaymentModal(receipt) {
    setManualPaymentModal({
      show: true,
      receipt,
      method: 'cash',
      amount: String(receipt.amountValue || ''),
      reference: '',
      proofFile: null,
      saving: false,
    });
  }

  function closeManualPaymentModal() {
    setManualPaymentModal({
      show: false,
      receipt: null,
      method: 'cash',
      amount: '',
      reference: '',
      proofFile: null,
      saving: false,
    });
  }

  async function submitManualPayment(event) {
    event.preventDefault();

    const receipt = manualPaymentModal.receipt;
    const amount = Number(manualPaymentModal.amount);

    if (!receipt || !Number.isFinite(amount) || amount <= 0) {
      showMessage('Invalid Amount', 'Please enter an amount greater than zero.', 'error');
      return;
    }

    const methodMap = {
      cash: { payment_method: 'cash', ewallet_provider: '' },
      gcash_qr: { payment_method: 'ewallet', ewallet_provider: 'GCash (QR, in person)' },
      card: { payment_method: 'card', ewallet_provider: '' },
      bank_transfer: { payment_method: 'bank_transfer', ewallet_provider: '' },
    };
    const mappedMethod = methodMap[manualPaymentModal.method] || methodMap.cash;
    const formData = new FormData();

    formData.append('appointment_id', receipt.appointmentId);
    formData.append('amount', String(amount));
    formData.append('payment_method', mappedMethod.payment_method);
    formData.append('ewallet_provider', mappedMethod.ewallet_provider);
    formData.append('reference_number', manualPaymentModal.reference.trim());
    formData.append('staff_recorded', 'true');

    if (manualPaymentModal.proofFile) {
      formData.append('proof_image', manualPaymentModal.proofFile);
    }

    setManualPaymentModal((current) => ({ ...current, saving: true }));

    try {
      const saved = await createStaffPayment(formData);
      const nextPaymentMethod = formatPaymentMethod(
        mappedMethod.payment_method,
        mappedMethod.ewallet_provider
      );

      setReceipts((currentReceipts) =>
        currentReceipts.map((currentReceipt) =>
          currentReceipt.paymentId === receipt.paymentId
            ? {
                ...currentReceipt,
                paymentId: saved.id || currentReceipt.paymentId,
                amountValue: amount,
                amount: formatPeso(amount),
                paymentMethod: nextPaymentMethod,
                rawPaymentMethod: mappedMethod.payment_method,
                paymentSource: 'staff_recorded',
                referenceNumber: manualPaymentModal.reference.trim(),
                proofImageUrl: saved.proof_image_url || '',
                status: 'Validated',
                fileType: saved.proof_image_url ? 'Staff Proof' : 'Staff Recorded',
                fileName: saved.proof_image_url
                  ? manualPaymentModal.proofFile?.name || 'Staff proof uploaded'
                  : 'Recorded manually by staff',
                uploadedAt: 'Recorded manually',
                recordedByName: receptionistName,
                recordedAt: formatDateTime(new Date()),
              }
            : currentReceipt
        )
      );

      closeManualPaymentModal();
      showMessage('Payment Recorded', 'The appointment has been marked as paid.', 'success');
    } catch (err) {
      setManualPaymentModal((current) => ({ ...current, saving: false }));
      showMessage(
        'Payment Not Recorded',
        err.response?.data?.message || 'Failed to record manual payment.',
        'error'
      );
    }
  }

  async function fetchReceipts() {
    try {
      const data = await listPayments();
      setReceipts(
        prepareReceiptPayments(data).map(mapPaymentToReceipt)
      );
    } catch (err) {
      setReceipts([]);
    }
  }

  function showMessage(title, text, type) {
    setMessageModal({
      show: true,
      title,
      text,
      type,
    });
  }

  function closeMessageModal() {
    setMessageModal({
      show: false,
      title: '',
      text: '',
      type: 'success',
    });
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/receptionist" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/receptionistAppointments" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/receptionistRecords" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link
            to="/receptionistReceipts"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-file-invoice-dollar"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Receipt Verification</span>
          </Link>

          <Link to="/receptionistPatientAcc" style={styles.menuItem}>
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Patient Account</span>
          </Link>

          <Link to="/receptionistInventory" style={styles.menuItem}>
            <i className="fi fi-rr-boxes" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Inventory</span>
          </Link>

          <Link to="/receptionistMessage" style={styles.menuItem}>
            <i
              className="fi fi-rr-comment-alt"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Messages</span>
            <MessageUnreadBadge />
          </Link>

          <Link to="/receptionistInquiries" style={styles.menuItem}>
            <i className="fi fi-rr-inbox-in" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Online Inquiries</span>
          </Link>

          <Link to="/receptionistNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notification</span>
            <NotificationUnreadBadge />
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <button
            type="button"
            style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }}
            onClick={openLogoutModal}
          >
            <i
              className="fi fi-rr-sign-out-alt"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>

        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            <div style={styles.profileDropdownWrapper} ref={profileMenuRef}>
              <button
                type="button"
                style={styles.receptProfile}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <div style={styles.avatar}>
                  <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
                </div>

                <div style={styles.receptInfo}>
                  <div style={styles.receptName}>{receptionistName}</div>
                  <div style={styles.receptPosition}>Receptionist</div>
                </div>
              </button>

              {showProfileMenu && (
                <div style={styles.profileDropdown}>
                  <Link
                    to="/receptionistProfile"
                    style={styles.viewProfileButton}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={styles.receiptContent}>
          <section style={styles.pageHero}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>
                Receipt Verification
              </span>

              <h2 style={styles.heroTitle}>
                Review and validate patient payment receipts.
              </h2>

              <p style={styles.heroText}>
                Verify submitted payment proofs, review appointment transaction
                details, and confirm pending patient payments.
              </p>
            </div>

            {!isVerySmall && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-file-invoice-dollar"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.receiptTools}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient or appointment ID"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.statusFilter}
            >
              <option value="all">All Status</option>
              <option value="Pending Validation">Pending Acknowledgement</option>
              <option value="Validated">Acknowledged Receipt</option>
              <option value="Rejected">Rejected</option>
            </select>
          </section>

          <section style={styles.receiptList}>
            {filteredReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.paymentId}
                styles={styles}
                receipt={receipt}
                isExpanded={expandedReceiptIds.includes(receipt.id)}
                onToggleDetails={() => toggleReceiptDetails(receipt.id)}
                onValidate={() => updateReceiptStatus(receipt, 'Validated')}
                onReject={() => updateReceiptStatus(receipt, 'Rejected')}
                onReopenUpload={() => handleReopenReceiptUpload(receipt)}
                onSaveAmount={(amount) => handleUpdateAmount(receipt, amount)}
                onRecordManualPayment={() => openManualPaymentModal(receipt)}
                isHighlighted={highlightedReceiptId === receipt.id}
                cardRef={(element) => {
                  if (element) {
                    receiptRefs.current[receipt.id] = element;
                  }
                }}
              />
            ))}
          </section>

          {filteredReceipts.length === 0 && (
            <div style={styles.emptyState}>
              <i
                className="fi fi-rr-folder-open"
                style={styles.emptyStateIcon}
              ></i>
              <h3 style={styles.emptyStateTitle}>No receipt records found</h3>
              <p style={styles.emptyStateText}>
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </main>
      </div>

      {manualPaymentModal.show && (
        <div
          style={styles.manualPaymentModal}
          onClick={(event) => handleModalOverlayClick(event, closeManualPaymentModal)}
        >
          <form style={styles.manualPaymentBox} onSubmit={submitManualPayment}>
            <div style={styles.manualPaymentHeader}>
              <div>
                <h3 style={styles.manualPaymentTitle}>Record payment manually</h3>
                <p style={styles.manualPaymentText}>
                  For cash or in-person QR payments. This marks the appointment as paid immediately.
                </p>
              </div>

              <button
                type="button"
                style={styles.manualPaymentClose}
                onClick={closeManualPaymentModal}
                aria-label="Close"
              >
                x
              </button>
            </div>

            <label style={styles.manualPaymentLabel}>Payment method</label>
            <select
              value={manualPaymentModal.method}
              onChange={(event) =>
                setManualPaymentModal((current) => ({
                  ...current,
                  method: event.target.value,
                }))
              }
              style={styles.manualPaymentInput}
            >
              <option value="cash">Cash</option>
              <option value="gcash_qr">GCash (QR, in person)</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>

            <label style={styles.manualPaymentLabel}>Amount received</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={manualPaymentModal.amount}
              onChange={(event) =>
                setManualPaymentModal((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              style={styles.manualPaymentInput}
            />

            <label style={styles.manualPaymentLabel}>Reference / OR number (optional)</label>
            <input
              type="text"
              value={manualPaymentModal.reference}
              onChange={(event) =>
                setManualPaymentModal((current) => ({
                  ...current,
                  reference: event.target.value,
                }))
              }
              placeholder="e.g. OR-10231"
              style={styles.manualPaymentInput}
            />

            <label style={styles.manualPaymentLabel}>Proof of payment (optional)</label>
            <label style={styles.manualPaymentUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setManualPaymentModal((current) => ({
                    ...current,
                    proofFile: event.target.files?.[0] || null,
                  }))
                }
                style={styles.manualPaymentFileInput}
              />
              <i className="fi fi-rr-upload"></i>
              <span>
                {manualPaymentModal.proofFile
                  ? manualPaymentModal.proofFile.name
                  : 'Attach screenshot or photo'}
              </span>
            </label>

            <div style={styles.recordedByRow}>
              <i className="fi fi-rr-user"></i>
              <span>Recorded by: {receptionistName}</span>
            </div>

            <div style={styles.manualPaymentActions}>
              <button
                type="button"
                style={styles.manualPaymentCancel}
                onClick={closeManualPaymentModal}
                disabled={manualPaymentModal.saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.manualPaymentSubmit}
                disabled={manualPaymentModal.saving}
              >
                {manualPaymentModal.saving ? 'Recording...' : 'Mark as paid'}
              </button>
            </div>
          </form>
        </div>
      )}

      {messageModal.show && (
        <div
          style={styles.messageModal}
          onClick={(event) => handleModalOverlayClick(event, closeMessageModal)}
        >
          <div style={styles.messageBox}>
            <div
              style={{
                ...styles.messageIcon,
                ...(messageModal.type === 'error'
                  ? styles.messageIconError
                  : {}),
              }}
            >
              <i
                className={
                  messageModal.type === 'error'
                    ? 'fi fi-rr-cross-circle'
                    : 'fi fi-rr-money-check'
                }
              ></i>
            </div>

            <h3 style={styles.messageTitle}>{messageModal.title}</h3>
            <p style={styles.messageText}>{messageModal.text}</p>

            <button
              type="button"
              style={styles.messageButton}
              onClick={closeMessageModal}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div
          style={styles.modal}
          onClick={(event) => handleModalOverlayClick(event, closeLogoutModal)}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>
            <p style={styles.modalText}>Are you sure you want to log out?</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
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

function ReceiptCard({
  styles,
  receipt,
  isExpanded,
  isHighlighted,
  cardRef,
  onToggleDetails,
  onValidate,
  onReject,
  onReopenUpload,
  onSaveAmount,
  onRecordManualPayment,
}) {
  const isStaffRecorded = receipt.paymentSource === 'staff_recorded';
  const isStaffProof = isStaffRecorded && Boolean(receipt.proofImageUrl);
  const viewableReceiptUrl = isStaffProof ? receipt.proofImageUrl : receipt.receiptUrl;
  const hasUploadedReceipt = Boolean(viewableReceiptUrl);
  const receiptSectionTitle = isStaffRecorded
    ? 'Receptionist Upload Receipt'
    : 'Patient Uploaded Receipt';
  const receiptSectionSubtitle = isStaffRecorded
    ? `This receipt was submitted by ${receipt.recordedByName || 'the receptionist'}.`
    : 'This receipt was submitted by the patient and is ready for acknowledgement.';
  const canReviewReceipt = hasUploadedReceipt && receipt.status === 'Pending Validation';
  const canEditAmount = receipt.status === 'Pending Validation' && !isStaffRecorded;
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState(String(receipt.amountValue || ''));
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  useEffect(() => {
    setAmountInput(String(receipt.amountValue || ''));
  }, [receipt.amountValue]);

  async function saveAmount() {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setIsSavingAmount(true);
    const didSave = await onSaveAmount(amount);
    setIsSavingAmount(false);
    if (didSave) setIsEditingAmount(false);
  }

  return (
    <article
      ref={cardRef}
      style={{
        ...styles.receiptCard,
        ...(isHighlighted ? styles.receiptCardHighlighted : {}),
      }}
    >
      <div style={styles.receiptSummary}>
        <div style={styles.receiptMain}>
          <div style={styles.receiptIcon}>
            <i className="fi fi-rr-receipt"></i>
          </div>

          <div>
            <h3 style={styles.receiptPatientName}>{receipt.patientName}</h3>
            <p style={styles.receiptSummaryText}>
              {receipt.id} • {receipt.service} • {receipt.amount}
            </p>
          </div>
        </div>

        <span
          style={{
            ...styles.status,
            ...(receipt.status === 'Pending Validation'
              ? styles.statusPending
              : {}),
            ...(receipt.status === 'Validated' ? styles.statusValidated : {}),
            ...(receipt.status === 'Rejected' ? styles.statusRejected : {}),
          }}
        >
          {receiptStatusLabel(receipt.status)}
        </span>
      </div>

      <div style={styles.receiptMeta}>
        <span style={styles.receiptMetaItem}>
          <i className="fi fi-rr-calendar"></i>
          {receipt.appointmentDate}
        </span>

        <span style={styles.receiptMetaItem}>
          <i className="fi fi-rr-clock-three"></i>
          {receipt.appointmentTime}
        </span>

        <span style={styles.receiptMetaItem}>
          <i className="fi fi-rr-wallet"></i>
          {receipt.paymentMethod}
        </span>

        <span style={styles.receiptMetaItem}>
          <i className="fi fi-rr-file"></i>
          {receipt.fileType}
        </span>
      </div>

      <div style={styles.summaryActions}>
        <button
          type="button"
          style={styles.viewDetailsBtn}
          onClick={onToggleDetails}
        >
          <i
            className={isExpanded ? 'fi fi-rr-angle-up' : 'fi fi-rr-eye'}
          ></i>
          {isExpanded ? 'Hide Full Details' : 'View Full Details'}
        </button>
      </div>

      {isExpanded && (
        <div style={styles.receiptFullDetails}>
          <div style={styles.detailsGrid}>
            <DetailBox
              styles={styles}
              label="Appointment ID"
              value={receipt.id}
            />

            <DetailBox
              styles={styles}
              label="Patient Name"
              value={receipt.patientName}
            />

            <DetailBox
              styles={styles}
              label="Dentist"
              value={receipt.dentist}
            />

            <DetailBox
              styles={styles}
              label="Service"
              value={receipt.service}
            />

            <DetailBox
              styles={styles}
              label="Appointment Date"
              value={receipt.appointmentDate}
            />

            <DetailBox
              styles={styles}
              label="Appointment Time"
              value={receipt.appointmentTime}
            />

            <DetailBox
              styles={styles}
              label="Payment Method"
              value={receipt.paymentMethod}
            />

            <div style={styles.detailBox}>
              <label style={styles.detailLabel}>Amount Paid</label>

              {isEditingAmount ? (
                <div style={styles.amountEditRow}>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    style={styles.amountInput}
                  />

                  <button
                    type="button"
                    style={styles.amountSaveBtn}
                    onClick={saveAmount}
                    disabled={isSavingAmount}
                  >
                    {isSavingAmount ? 'Saving...' : 'Save'}
                  </button>

                  <button
                    type="button"
                    style={styles.amountCancelBtn}
                    onClick={() => {
                      setAmountInput(String(receipt.amountValue || ''));
                      setIsEditingAmount(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={styles.amountDisplayRow}>
                  <p style={styles.detailValue}>{receipt.amount}</p>

                  {canEditAmount && (
                    <button
                      type="button"
                      style={styles.amountEditBtn}
                      onClick={() => setIsEditingAmount(true)}
                    >
                      <i className="fi fi-rr-pencil"></i>
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.uploadedReceiptSection}>
            <div style={styles.uploadedReceiptHeader}>
              <div>
                <h3 style={styles.uploadedReceiptTitle}>
                  {receiptSectionTitle}
                </h3>
                <p style={styles.uploadedReceiptSubtitle}>
                  {receiptSectionSubtitle}
                </p>
              </div>

              <span style={styles.receiptFileType}>{receipt.fileType}</span>
            </div>

            <div style={styles.uploadedReceiptBox}>
              {hasUploadedReceipt ? (
                <a
                  href={viewableReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.receiptPreview, ...styles.receiptPreviewLink }}
                  aria-label={`View ${receipt.fileName}`}
                >
                  <i className="fi fi-rr-receipt"></i>
                </a>
              ) : (
                <div style={styles.receiptPreview}>
                  <i className="fi fi-rr-clock"></i>
                </div>
              )}

              <div style={styles.receiptInfo}>
                {hasUploadedReceipt ? (
                  <a
                    href={viewableReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.receiptFileNameLink}
                  >
                    {receipt.fileName}
                  </a>
                ) : (
                  <h4 style={styles.receiptFileName}>{receipt.fileName}</h4>
                )}
                <p style={styles.receiptUploadedAt}>
                  {hasUploadedReceipt && !isStaffRecorded
                    ? `Uploaded on ${receipt.uploadedAt}`
                    : receipt.uploadedAt}
                </p>

                {hasUploadedReceipt && (
                  <a
                    href={viewableReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.viewReceiptLink}
                  >
                    <i className="fi fi-rr-eye"></i>
                    View receipt
                  </a>
                )}
              </div>

              {!hasUploadedReceipt && receipt.status === 'Pending Validation' && (
                <button
                  type="button"
                  style={styles.manualPaymentBtn}
                  onClick={onRecordManualPayment}
                >
                  Record payment manually
                </button>
              )}
            </div>
          </div>

          <div style={styles.actions}>
            {receipt.status === 'Rejected' && (
              <button
                type="button"
                style={styles.reopenUploadBtn}
                onClick={onReopenUpload}
              >
                <i className="fi fi-rr-upload"></i>
                Allow Re-upload
              </button>
            )}

            <button
              type="button"
              style={{
                ...styles.rejectBtn,
                ...(!canReviewReceipt ? styles.actionBtnDisabled : {}),
              }}
              onClick={onReject}
              disabled={!canReviewReceipt}
            >
              <i className="fi fi-rr-cross-circle"></i>
              Reject Receipt
            </button>

            <button
              type="button"
              style={{
                ...styles.validateBtn,
                ...(!canReviewReceipt ? styles.actionBtnDisabled : {}),
              }}
              onClick={onValidate}
              disabled={!canReviewReceipt}
            >
              <i className="fi fi-rr-money-check"></i>
              Acknowledge Receipt
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DetailBox({ styles, label, value }) {
  return (
    <div style={styles.detailBox}>
      <label style={styles.detailLabel}>{label}</label>
      <p style={styles.detailValue}>{value}</p>
    </div>
  );
}
