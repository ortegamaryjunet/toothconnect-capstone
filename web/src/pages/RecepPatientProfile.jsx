import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { listAppointments } from '../api/appointments';
import { getPatientProfile } from '../api/patients';
import { listPayments } from '../api/payments';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import api from '../api/axios';
import createRecepPatientProfileStyles from '../styles/RecepPatientProfile';
import TreatmentPlan from './DentistTreatmentPlan';

const rowsPerPage = 10;

const emptyPatientInfo = {
  fullName: 'Patient Name',
  patientId: 'No details found',
  nickname: 'No details found',
  gender: 'No details found',
  suffix: 'No details found',
  nationality: 'No details found',
  religion: 'No details found',
  occupation: 'No details found',
  dentalInsurance: 'No details found',
  effectiveDate: 'No details found',
  homeAddress: 'No details found',
  officeNo: 'No details found',
  faxNo: 'No details found',
  previousDentist: 'No details found',
  lastDentalVisit: 'No details found',
  physicianName: 'No details found',
  specialty: 'No details found',
  officeAddress: 'No details found',
  officeNumber: 'No details found',
  healthConditions: [],
};

export default function RecepPatientProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [activeSection, setActiveSection] = useState('profile');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [treatmentFilter, setTreatmentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [schedulePage, setSchedulePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [patientInfo, setPatientInfo] = useState(emptyPatientInfo);
  const [scheduleData, setScheduleData] = useState({ upcoming: [], past: [] });
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [historyPreviewAttachment, setHistoryPreviewAttachment] = useState(null);
  const [historyAttachmentModal, setHistoryAttachmentModal] = useState(null);
  const [historyCloseConfirmOpen, setHistoryCloseConfirmOpen] = useState(false);
  const [historyRescheduleModal, setHistoryRescheduleModal] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [showBackModal, setShowBackModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 800;
  const isSmallScreen = screenWidth <= 1100;
  const isVerySmall = screenWidth <= 560;

  const styles = createRecepPatientProfileStyles({
    isMobile,
    isSmallScreen,
    isVerySmall,
  });

  const treatmentOptions = useMemo(() => {
    const uniqueTreatments = [...new Set(payments.map((item) => item.treatment))];

    return ['All', ...uniqueTreatments];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchStatus =
        statusFilter === 'All' || payment.status === statusFilter;

      const matchMethod =
        methodFilter === 'All' || payment.method === methodFilter;

      const matchTreatment =
        treatmentFilter === 'All' || payment.treatment === treatmentFilter;

      return matchStatus && matchMethod && matchTreatment;
    });
  }, [payments, statusFilter, methodFilter, treatmentFilter]);

  const totalPages =
    filteredPayments.length === 0
      ? 0
      : Math.ceil(filteredPayments.length / rowsPerPage);

  const pagedPayments = useMemo(() => {
    const start = currentPage > 0 ? (currentPage - 1) * rowsPerPage : 0;

    return filteredPayments.slice(start, start + rowsPerPage);
  }, [filteredPayments, currentPage]);

  const filteredPastAppointments = useMemo(() => {
    return scheduleData.past.filter((appointment) => {
      return scheduleFilter === 'all' || appointment.status === scheduleFilter;
    });
  }, [scheduleData.past, scheduleFilter]);

  const scheduleTotalPages =
    filteredPastAppointments.length === 0
      ? 0
      : Math.ceil(filteredPastAppointments.length / rowsPerPage);

  const pagedPastAppointments = useMemo(() => {
    const start = schedulePage > 0 ? (schedulePage - 1) * rowsPerPage : 0;

    return filteredPastAppointments.slice(start, start + rowsPerPage);
  }, [filteredPastAppointments, schedulePage]);

  const historyTotalPages =
    treatmentHistory.length === 0
      ? 0
      : Math.ceil(treatmentHistory.length / rowsPerPage);

  const pagedTreatmentHistory = useMemo(() => {
    const start = historyPage > 0 ? (historyPage - 1) * rowsPerPage : 0;
    return treatmentHistory.slice(start, start + rowsPerPage);
  }, [treatmentHistory, historyPage]);

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
    fetchPatientDetails();
  }, [patientId]);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, methodFilter, treatmentFilter]);

  useEffect(() => {
    setSchedulePage(1);
  }, [scheduleFilter]);

  useEffect(() => {
    setCurrentPage((page) => fixPage(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setSchedulePage((page) => fixPage(page, scheduleTotalPages));
  }, [scheduleTotalPages]);

  useEffect(() => {
    setHistoryPage((page) => fixPage(page, historyTotalPages));
  }, [historyTotalPages]);

  function showSection(section) {
    setActiveSection(section);

    const mainContainer = document.getElementById('patientProfileMainContainer');

    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }

  function openBackModal() {
    setShowBackModal(true);
  }

  function closeBackModal() {
    setShowBackModal(false);
  }

  function handleBackConfirm() {
    navigate('/receptionistRecords');
  }

  function requestCloseHistoryAttachments() {
    setHistoryCloseConfirmOpen(true);
  }

  function closeHistoryAttachments() {
    setHistoryAttachmentModal(null);
    setHistoryCloseConfirmOpen(false);
  }

  function handleBackOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeBackModal();
    }
  }

  async function fetchPatientDetails() {
    if (!patientId) {
      setProfileError('No patient selected.');
      return;
    }

    setProfileError('');

    try {
      const [profile, appointmentRows, paymentRows, plans] = await Promise.all([
        getPatientProfile(patientId),
        listAppointments({ patient_id: patientId }),
        listPayments({ patient_id: patientId }),
        getTreatmentPlansByPatient(patientId).catch(() => []),
      ]);

      setPatientInfo(mapPatientInfo(profile));
      setScheduleData(mapScheduleData(appointmentRows || []));
      setTreatmentHistory(normalizeTreatmentHistory(appointmentRows || [], plans || []));
      setPayments((paymentRows || []).map(mapPayment));
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Failed to load patient profile.'
      );
      setPatientInfo(emptyPatientInfo);
      setScheduleData({ upcoming: [], past: [] });
      setTreatmentHistory([]);
      setPayments([]);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.topHeader}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={openBackModal}
        >
          Back
        </button>

        <h2 style={styles.topHeaderTitle}>Patient Information Record</h2>
      </header>

      <aside style={styles.sidebar}>
        <button
          type="button"
          style={{
            ...styles.menuItem,
            ...(activeSection === 'profile' ? styles.menuItemActive : {}),
          }}
          onClick={() => showSection('profile')}
        >
          <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Profile Information</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.menuItem,
            ...(activeSection === 'payment' ? styles.menuItemActive : {}),
          }}
          onClick={() => showSection('payment')}
        >
          <i className="fi fi-rr-credit-card" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Transaction</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.menuItem,
            ...(activeSection === 'schedule' ? styles.menuItemActive : {}),
          }}
          onClick={() => showSection('schedule')}
        >
          <i
            className="fi fi-rr-calendar-clock"
            style={styles.menuItemIcon}
          ></i>
          <span style={styles.menuItemText}>Schedule</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.menuItem,
            ...(activeSection === 'history' ? styles.menuItemActive : {}),
          }}
          onClick={() => showSection('history')}
        >
          <i className="fi fi-rr-time-past" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Treatment History</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.menuItem,
            ...(activeSection === 'plan' ? styles.menuItemActive : {}),
          }}
          onClick={() => showSection('plan')}
        >
          <i className="fi fi-rr-tooth" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Treatment Plan</span>
        </button>
      </aside>

      <main id="patientProfileMainContainer" style={styles.mainContainer}>
        {profileError && (
          <div style={{ color: '#b42318', marginBottom: 16, fontWeight: 600 }}>
            {profileError}
          </div>
        )}

        {activeSection === 'profile' && (
          <section style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.bannerTitle}>Profile Information</h3>
                <p style={styles.bannerText}>
                  Patient basic details and contact information.
                </p>
              </div>
            </div>

            <div style={styles.patientMainCard}>
              <div style={styles.patientAvatar}>
                <i className="fi fi-rr-user"></i>
              </div>

              <div>
                <h2 style={styles.patientName}>{patientInfo.fullName}</h2>
                <p style={styles.patientId}>Patient ID: {patientInfo.patientId}</p>
              </div>
            </div>

            <InfoCard title="Personal Information" styles={styles}>
              <div style={styles.infoGrid}>
                <InfoItem
                  styles={styles}
                  label="Nickname"
                  value={patientInfo.nickname}
                />

                <InfoItem
                  styles={styles}
                  label="Gender"
                  value={patientInfo.gender}
                />

                <InfoItem
                  styles={styles}
                  label="Suffix"
                  value={patientInfo.suffix}
                />

                <InfoItem
                  styles={styles}
                  label="Nationality"
                  value={patientInfo.nationality}
                />

                <InfoItem
                  styles={styles}
                  label="Religion"
                  value={patientInfo.religion}
                />

                <InfoItem
                  styles={styles}
                  label="Occupation"
                  value={patientInfo.occupation}
                />

                <InfoItem
                  styles={styles}
                  label="Dental Insurance"
                  value={patientInfo.dentalInsurance}
                />

                <InfoItem
                  styles={styles}
                  label="Effective Date"
                  value={patientInfo.effectiveDate}
                />

                <InfoItem
                  styles={styles}
                  label="Home Address"
                  value={patientInfo.homeAddress}
                  full
                />

                <InfoItem
                  styles={styles}
                  label="Office No."
                  value={patientInfo.officeNo}
                />

                <InfoItem
                  styles={styles}
                  label="Fax No."
                  value={patientInfo.faxNo}
                />
              </div>
            </InfoCard>

            <InfoCard title="Medical Assessment" styles={styles}>
              <h4 style={styles.subsectionTitle}>DENTAL HISTORY</h4>

              <div style={styles.infoGrid}>
                <InfoItem
                  styles={styles}
                  label="Previous Dentist Dr."
                  value={patientInfo.previousDentist}
                />

                <InfoItem
                  styles={styles}
                  label="Last Dental Visit"
                  value={patientInfo.lastDentalVisit}
                />
              </div>

              <h4 style={styles.subsectionTitle}>MEDICAL HISTORY</h4>

              <div style={styles.infoGrid}>
                <InfoItem
                  styles={styles}
                  label="Name of Physician Dr."
                  value={patientInfo.physicianName}
                />

                <InfoItem
                  styles={styles}
                  label="Specialty"
                  value={patientInfo.specialty}
                />

                <InfoItem
                  styles={styles}
                  label="Office Address"
                  value={patientInfo.officeAddress}
                />

                <InfoItem
                  styles={styles}
                  label="Office Number"
                  value={patientInfo.officeNumber}
                />
              </div>
            </InfoCard>

            <InfoCard title="Health Condition" styles={styles}>
              {patientInfo.healthConditions.length === 0 ? (
                <p style={styles.emptyText}>No health conditions recorded.</p>
              ) : (
                <div style={styles.conditionList}>
                  {patientInfo.healthConditions.map((condition) => (
                    <div key={condition} style={styles.conditionChip}>
                      <i className="fi fi-rr-check-circle"></i>
                      {condition}
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </section>
        )}

        {activeSection === 'payment' && (
          <section style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.bannerTitle}>Payment Transactions</h3>
                <p style={styles.bannerText}>
                  View payment history and transaction status.
                </p>
              </div>
            </div>

            <div style={styles.paymentActions}>
              <div style={styles.filters}>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(event) => setMethodFilter(event.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="All">All Method</option>
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>

                <select
                  value={treatmentFilter}
                  onChange={(event) => setTreatmentFilter(event.target.value)}
                  style={styles.filterSelect}
                >
                  {treatmentOptions.map((treatment) => (
                    <option key={treatment} value={treatment}>
                      {treatment === 'All' ? 'All Treatment' : treatment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.paymentTableContainer}>
              <table style={styles.paymentTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Treatment</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.noDataCell}>
                        No payment details found
                      </td>
                    </tr>
                  ) : (
                    pagedPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td style={styles.td}>{payment.id}</td>
                        <td style={styles.td}>{payment.date}</td>
                        <td style={styles.td}>{payment.time}</td>
                        <td style={styles.td}>{payment.treatment}</td>
                        <td style={styles.td}>{peso(payment.amount)}</td>
                        <td style={styles.td}>{payment.method}</td>
                        <td style={styles.td}>
                          <PaymentStatusBadge
                            styles={styles}
                            status={payment.status}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <Pagination
                styles={styles}
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                onNext={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
              />
            </div>
          </section>
        )}

        {activeSection === 'schedule' && (
          <section style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.bannerTitle}>Schedule</h3>
                <p style={styles.bannerText}>
                  Upcoming and past dental appointments.
                </p>
              </div>
            </div>

            <div style={styles.paymentActions}>
              <div style={styles.filters}>
                <select
                  value={scheduleFilter}
                  onChange={(event) => setScheduleFilter(event.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="No Show">No Show</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={styles.paymentTableContainer}>
              <table style={{ ...styles.paymentTable, minWidth: 760 }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Dentist</th>
                    <th style={styles.th}>Treatment</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedPastAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={styles.noDataCell}>
                        No past appointments found.
                      </td>
                    </tr>
                  ) : (
                    pagedPastAppointments.map((item, index) => (
                      <tr key={`${item.date}-${item.time}-${index}`}>
                        <td style={styles.td}>{item.date}</td>
                        <td style={styles.td}>{item.time}</td>
                        <td style={styles.td}>{item.dentist}</td>
                        <td style={styles.td}>{item.treatment}</td>
                        <td style={styles.td}>
                          <ScheduleStatusBadge styles={styles} status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <Pagination
                styles={styles}
                page={schedulePage}
                totalPages={scheduleTotalPages}
                onPrev={() => setSchedulePage((page) => Math.max(page - 1, 1))}
                onNext={() =>
                  setSchedulePage((page) =>
                    Math.min(page + 1, scheduleTotalPages)
                  )
                }
              />
            </div>
          </section>
        )}

        {activeSection === 'history' && (
          <section style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.bannerTitle}>Treatment History</h3>
                <p style={styles.bannerText}>
                  Completed treatments and uploaded treatment attachments.
                </p>
              </div>
            </div>

            <div style={styles.paymentTableContainer}>
              <table style={{ ...styles.paymentTable, minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Tooth No/s</th>
                    <th style={styles.th}>Procedure</th>
                    <th style={styles.th}>Dentist</th>
                    <th style={styles.th}>Note</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Attachment</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedTreatmentHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.noDataCell}>
                        No treatment history found.
                      </td>
                    </tr>
                  ) : (
                    pagedTreatmentHistory.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.date}</td>
                        <td style={styles.td}>{item.tooth}</td>
                        <td style={styles.td}>{item.procedure}</td>
                        <td style={styles.td}>{item.dentist}</td>
                        <td style={styles.td}>
                          <TreatmentHistoryNote
                            styles={styles}
                            item={item}
                            onOpenReschedules={setHistoryRescheduleModal}
                          />
                        </td>
                        <td style={styles.td}>
                          <ScheduleStatusBadge styles={styles} status={item.status} />
                        </td>
                        <td style={styles.td}>
                          <HistoryAttachmentButton
                            styles={styles}
                            item={item}
                            onOpenAttachments={setHistoryAttachmentModal}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <Pagination
                styles={styles}
                page={historyPage}
                totalPages={historyTotalPages}
                onPrev={() => setHistoryPage((page) => Math.max(page - 1, 1))}
                onNext={() =>
                  setHistoryPage((page) => Math.min(page + 1, historyTotalPages))
                }
              />
            </div>
          </section>
        )}

        {activeSection === 'plan' && (
          <section style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.bannerTitle}>Treatment Plan</h3>
                <p style={styles.bannerText}>
                  View the patient's dental chart and planned treatments.
                </p>
              </div>
            </div>

            <TreatmentPlan patientId={patientId} isMobile={isMobile} />
          </section>
        )}
      </main>

      {showBackModal && (
        <div style={styles.modal} onClick={handleBackOverlayClick}>
          <div style={styles.backModalContent}>
            <div style={styles.backModalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.backModalTitle}>Leave Patient Record</h2>
            <p style={styles.backModalText}>
              Are you sure you want to go back?
            </p>

            <div style={styles.backModalActions}>
              <button
                type="button"
                style={{ ...styles.backModalButton, ...styles.backCancelBtn }}
                onClick={closeBackModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.backModalButton, ...styles.backConfirmBtn }}
                onClick={handleBackConfirm}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {historyAttachmentModal && (
        <HistoryAttachmentModal
          styles={styles}
          row={historyAttachmentModal}
          onRequestClose={requestCloseHistoryAttachments}
          onPreviewAttachment={setHistoryPreviewAttachment}
        />
      )}

      {historyCloseConfirmOpen && (
        <div
          style={{ ...styles.modal, zIndex: 10001 }}
          onClick={() => setHistoryCloseConfirmOpen(false)}
        >
          <div style={styles.confirmModal} onClick={(event) => event.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <i className="fi fi-rr-exclamation" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>Close Attachments</h3>
            <p style={styles.confirmText}>
              Close attachments for {historyAttachmentModal?.tooth || 'this treatment'}?
            </p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setHistoryCloseConfirmOpen(false)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmDeleteBtn }}
                onClick={closeHistoryAttachments}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {historyRescheduleModal && (
        <RescheduleHistoryModal
          styles={styles}
          row={historyRescheduleModal}
          onClose={() => setHistoryRescheduleModal(null)}
        />
      )}

      {historyPreviewAttachment && (
        <div
          style={styles.attachmentLightboxOverlay}
          onClick={() => setHistoryPreviewAttachment(null)}
        >
          <div
            style={styles.attachmentLightboxContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              style={styles.attachmentCloseBtn}
              onClick={() => setHistoryPreviewAttachment(null)}
            >
              x
            </button>
            <h3 style={styles.attachmentPreviewTitle}>
              {historyPreviewAttachment.file_name}
            </h3>
            {isImageAttachment(historyPreviewAttachment) ? (
              <img
                src={attachmentUrl(historyPreviewAttachment.file_url)}
                alt={historyPreviewAttachment.file_name}
                style={styles.attachmentPreviewImage}
              />
            ) : (
              <iframe
                src={attachmentUrl(historyPreviewAttachment.file_url)}
                title={historyPreviewAttachment.file_name}
                style={styles.attachmentPreviewFrame}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function mapPatientInfo(profile = {}) {
  return {
    fullName: profile.full_name || 'Patient Name',
    patientId: profile.user_id ? `P${profile.user_id}` : 'No details found',
    nickname: profile.nickname || 'No details found',
    gender: profile.sex || 'No details found',
    suffix: profile.suffix || 'No details found',
    nationality: profile.nationality || 'No details found',
    religion: profile.religion || 'No details found',
    occupation: profile.occupation || 'No details found',
    dentalInsurance: profile.dental_insurance || 'No details found',
    effectiveDate: formatDate(profile.effective_date),
    homeAddress: profile.address || 'No details found',
    officeNo: profile.office_number || 'No details found',
    faxNo: profile.fax_number || 'No details found',
    previousDentist: profile.previous_dentist || 'No details found',
    lastDentalVisit: profile.last_dental_visit || 'No details found',
    physicianName: profile.physician_name || 'No details found',
    specialty: profile.physician_specialty || 'No details found',
    officeAddress: profile.physician_office_address || 'No details found',
    officeNumber: profile.physician_office_number || 'No details found',
    healthConditions: splitList(profile.medical_conditions),
  };
}

function mapScheduleData(appointments) {
  const now = Date.now();
  const mapped = appointments.map((appointment) => {
    const start = new Date(appointment.start_time);

    return {
      dentist: appointment.dentist_name || 'Dentist not set',
      date: formatDate(appointment.start_time),
      treatment: appointment.service_name || 'Treatment not set',
      time: formatTime(appointment.start_time),
      status: formatStatus(appointment.status),
      startMs: Number.isNaN(start.getTime()) ? 0 : start.getTime(),
    };
  });

  return {
    upcoming: mapped
      .filter((item) => item.startMs >= now && item.status !== 'Completed')
      .sort((a, b) => a.startMs - b.startMs),
    past: mapped
      .filter((item) => item.startMs < now || item.status === 'Completed')
      .sort((a, b) => b.startMs - a.startMs),
  };
}

function normalizeTreatmentHistory(appointments, plans = []) {
  if (!Array.isArray(appointments)) return [];

  const rows = appointments
    .filter((appointment) => String(appointment.status || '').toLowerCase() === 'completed')
    .map((appointment) => {
      const serviceName = String(appointment.service_name || '').toLowerCase().trim();
      let matchingPlans = plans.filter((plan) => {
        const plannedTreatment = String(plan.planned_treatment || '').toLowerCase().trim();
        if (!plannedTreatment || !serviceName) return false;
        return (
          plannedTreatment === serviceName ||
          plannedTreatment.includes(serviceName) ||
          serviceName.includes(plannedTreatment)
        );
      });

      if (matchingPlans.length === 0 && plans.length === 1) {
        matchingPlans = plans;
      }

      const noteMeta = parseRescheduleNote(appointment.dentist_note || '');

      return {
        id: appointment.id,
        historyKey: getCompletedVisitKey(appointment),
        date: formatDate(appointment.start_time),
        tooth: matchingPlans.map((plan) => `#${plan.tooth_number}`).join(', ') || 'N/A',
        procedure: appointment.service_name || 'Treatment not set',
        dentist: appointment.dentist_name || 'Dentist not set',
        note: noteMeta.note,
        rescheduleCount: noteMeta.count,
        rescheduleDetails: noteMeta.details,
        status: 'Completed',
        attachments: matchingPlans.flatMap((plan) => plan.attachments || []),
      };
    });

  return collapseCompletedHistoryRows(rows);
}

function mapPayment(payment) {
  const dateValue = payment.paid_at || payment.verified_at || payment.created_at;

  return {
    id: `TXN${payment.id}`,
    date: formatDate(dateValue),
    time: formatTime(dateValue),
    treatment: payment.service_name || 'Treatment not set',
    amount: Number(payment.amount || 0),
    method: formatPaymentMethod(payment.payment_method),
    status: mapPaymentStatus(payment.status),
  };
}

function InfoCard({ title, styles, children }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.cardTitle}>
        <h3 style={styles.cardTitleText}>{title}</h3>
      </div>

      {children}
    </div>
  );
}

function InfoItem({ styles, label, value, full = false }) {
  return (
    <div style={{ ...styles.infoItem, ...(full ? styles.infoItemFull : {}) }}>
      <span style={styles.infoItemLabel}>{label}</span>
      <strong style={styles.infoItemValue}>{value || 'No details found'}</strong>
    </div>
  );
}

function PaymentStatusBadge({ styles, status }) {
  const config = getPaymentStatusConfig(status);

  return (
    <span
      style={{
        ...styles.paymentStatus,
        ...styles[config.styleKey],
      }}
    >
      <i className={config.icon}></i>
      {status}
    </span>
  );
}

function ScheduleStatusBadge({ styles, status }) {
  const config = getScheduleStatusConfig(status);

  return (
    <span
      style={{
        ...styles.scheduleStatus,
        ...styles[config.styleKey],
      }}
    >
      <i className={config.icon}></i>
      {status}
    </span>
  );
}

function TreatmentHistoryNote({ styles, item, onOpenReschedules }) {
  const hasNote = Boolean(String(item.note || '').trim());
  const hasReschedules = Number(item.rescheduleCount || 0) > 0;

  if (!hasNote && !hasReschedules) {
    return <span>No note added.</span>;
  }

  return (
    <div style={styles.historyNoteWrap}>
      {hasNote && <span>{item.note}</span>}
      {hasReschedules && (
        <button
          type="button"
          style={styles.rescheduleTag}
          onClick={() => onOpenReschedules(item)}
          title="View reschedule history"
        >
          Rescheduled {item.rescheduleCount}x - click to view
        </button>
      )}
    </div>
  );
}

function RescheduleHistoryModal({ styles, row, onClose }) {
  return (
    <div style={styles.attachmentLightboxOverlay} onClick={onClose}>
      <div style={styles.rescheduleModal} onClick={(event) => event.stopPropagation()}>
        <button type="button" style={styles.attachmentCloseBtn} onClick={onClose}>
          x
        </button>
        <h3 style={styles.attachmentPreviewTitle}>Reschedule History</h3>
        <p style={styles.historyAttachmentMeta}>
          {row.tooth || 'N/A'} - {row.procedure || 'N/A'} - {row.date || 'N/A'}
        </p>
        <pre style={styles.rescheduleDetails}>
          {row.rescheduleDetails || 'No reschedule details recorded.'}
        </pre>
      </div>
    </div>
  );
}

function HistoryAttachmentButton({ styles, item, onOpenAttachments }) {
  const count = item.attachments?.length || 0;

  return (
    <button
      type="button"
      style={styles.historyAttachmentBtn}
      onClick={() => onOpenAttachments(item)}
    >
      Attachments
      <span style={styles.historyAttachmentCount}>{count}</span>
    </button>
  );
}

function HistoryAttachmentModal({ styles, row, onRequestClose, onPreviewAttachment }) {
  const attachments = row.attachments || [];

  return (
    <div style={styles.attachmentLightboxOverlay} onClick={onRequestClose}>
      <div
        style={styles.historyAttachmentModal}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.historyAttachmentHeader}>
          <div>
            <h3 style={styles.attachmentPreviewTitle}>Treatment Attachments</h3>
            <p style={styles.historyAttachmentMeta}>
              {row.tooth || 'N/A'} - {row.procedure || 'N/A'} - {row.status || 'Pending'}
            </p>
          </div>
          <button type="button" style={styles.attachmentCloseBtn} onClick={onRequestClose}>
            x
          </button>
        </div>

        {attachments.length === 0 ? (
          <div style={styles.historyAttachmentEmpty}>No attachments uploaded.</div>
        ) : (
          <div style={styles.historyAttachmentList}>
            {attachments.map((attachment) => (
              <div key={attachment.id} style={styles.historyAttachmentItem}>
                <div style={styles.historyAttachmentThumb}>
                  {isImageAttachment(attachment) ? (
                    <img
                      src={attachmentUrl(attachment.file_url)}
                      alt=""
                      style={styles.attachmentThumbImg}
                    />
                  ) : (
                    <i className="fi fi-rr-document" style={styles.attachmentFileIcon}></i>
                  )}
                </div>

                <div style={styles.historyAttachmentInfo}>
                  <strong style={styles.historyAttachmentName}>
                    {attachment.file_name || 'Attachment'}
                  </strong>
                  <span style={styles.historyAttachmentSubtext}>
                    {formatUploadDate(attachment.uploaded_at)} - {formatFileSize(attachment.file_size)}
                  </span>
                </div>

                <button
                  type="button"
                  style={styles.historyIconActionBtn}
                  title="View attachment"
                  onClick={() => onPreviewAttachment(attachment)}
                >
                  <i className="fi fi-rr-eye"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ styles, page, totalPages, onPrev, onNext }) {
  return (
    <div style={styles.pagination}>
      <button
        type="button"
        style={{
          ...styles.pageBtn,
          ...(page <= 1 ? styles.pageBtnDisabled : {}),
        }}
        disabled={page <= 1}
        onClick={onPrev}
      >
        Prev
      </button>

      <span style={styles.pageInfo}>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        style={{
          ...styles.pageBtn,
          ...(page >= totalPages || totalPages === 0
            ? styles.pageBtnDisabled
            : {}),
        }}
        disabled={page >= totalPages || totalPages === 0}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}

function attachmentUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function isImageAttachment(attachment) {
  return String(attachment.mime_type || '').startsWith('image/');
}

function getCompletedVisitKey(item) {
  const start = item.start_time ? new Date(item.start_time) : null;
  const startKey = start && !Number.isNaN(start.getTime())
    ? start.toISOString()
    : formatDate(item.start_time);
  return [
    startKey,
    item.service_id || item.service_name || '',
    item.dentist_id || item.dentist_name || '',
  ].join('|');
}

function collapseCompletedHistoryRows(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const existing = grouped.get(row.historyKey);
    if (!existing) {
      grouped.set(row.historyKey, row);
      return;
    }

    grouped.set(row.historyKey, {
      ...existing,
      note: existing.note || row.note,
      rescheduleCount: Math.max(existing.rescheduleCount || 0, row.rescheduleCount || 0),
      rescheduleDetails: mergeUniqueLines(existing.rescheduleDetails, row.rescheduleDetails),
      attachments: mergeUniqueAttachments(existing.attachments, row.attachments),
    });
  });

  return Array.from(grouped.values());
}

function parseRescheduleNote(note) {
  const lines = String(note || '').split(/\r?\n/);
  const rescheduleLines = lines.filter((line) =>
    /^\s*(Original|Rescheduled|Reason)\s*:/i.test(line)
  );
  const cleanLines = lines.filter((line) =>
    !/^\s*(Original|Rescheduled|Reason)\s*:/i.test(line)
  );
  const count = rescheduleLines.filter((line) =>
    /^\s*Rescheduled\s*:/i.test(line)
  ).length;

  return {
    note: cleanLines.join('\n').trim(),
    count,
    details: rescheduleLines.join('\n').trim(),
  };
}

function mergeUniqueLines(...values) {
  return [...new Set(values.flatMap((value) =>
    String(value || '').split(/\r?\n/).filter(Boolean)
  ))].join('\n');
}

function mergeUniqueAttachments(first = [], second = []) {
  const seen = new Set();
  return [...first, ...second].filter((attachment) => {
    const key = attachment.id || attachment.file_url || attachment.file_name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatUploadDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(value) {
  const size = Number(value || 0);
  if (!size) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function peso(value) {
  return `₱ ${Number(value || 0).toLocaleString('en-PH')}`;
}

function formatDate(value) {
  if (!value) return 'No details found';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return 'No details found';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No details found';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatStatus(value) {
  return String(value || 'scheduled')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPaymentMethod(value) {
  const method = String(value || '').replace(/_/g, ' ');
  return method.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'N/A';
}

function mapPaymentStatus(status) {
  if (status === 'verified') return 'Paid';
  if (status === 'rejected') return 'Failed';
  return 'Pending';
}

function splitList(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractLine(value, label) {
  const line = String(value || '')
    .split('\n')
    .find((item) => item.toLowerCase().startsWith(label.toLowerCase()));

  return line ? line.split(':').slice(1).join(':').trim() : '';
}

function fixPage(page, totalPages) {
  if (totalPages === 0) {
    return 0;
  }

  if (page < 1) {
    return 1;
  }

  if (page > totalPages) {
    return totalPages;
  }

  return page;
}

function getPaymentStatusConfig(status) {
  const key = String(status || '').toLowerCase();

  const map = {
    paid: {
      styleKey: 'paymentStatusPaid',
      icon: 'fi fi-rr-check-circle',
    },
    partial: {
      styleKey: 'paymentStatusPartial',
      icon: 'fi fi-rr-time-quarter-to',
    },
    pending: {
      styleKey: 'paymentStatusPending',
      icon: 'fi fi-rr-hourglass',
    },
    validated: {
      styleKey: 'paymentStatusPaid',
      icon: 'fi fi-rr-badge-check',
    },
    failed: {
      styleKey: 'paymentStatusFailed',
      icon: 'fi fi-rr-cross-circle',
    },
    overdue: {
      styleKey: 'paymentStatusFailed',
      icon: 'fi fi-rr-exclamation',
    },
    refunded: {
      styleKey: 'paymentStatusRefunded',
      icon: 'fi fi-rr-undo',
    },
    unpaid: {
      styleKey: 'paymentStatusUnpaid',
      icon: 'fi fi-rr-cross-circle',
    },
  };

  return (
    map[key] || {
      styleKey: 'paymentStatusUnpaid',
      icon: 'fi fi-rr-interrogation',
    }
  );
}

function getScheduleStatusConfig(status) {
  const key = String(status || '').toLowerCase();

  switch (key) {
    case 'completed':
      return {
        icon: 'fi fi-rr-calendar-check',
        styleKey: 'scheduleStatusCompleted',
      };

    case 'cancelled':
      return {
        icon: 'fi fi-rr-ban',
        styleKey: 'scheduleStatusCancelled',
      };

    case 'no show':
      return {
        icon: 'fi fi-rr-user-time',
        styleKey: 'scheduleStatusNoShow',
      };

    case 'rescheduled':
    case 'reschedule':
      return {
        icon: 'fi fi-rr-refresh',
        styleKey: 'scheduleStatusRescheduled',
      };

    case 'scheduled':
    default:
      return {
        icon: 'fi fi-rr-calendar',
        styleKey: 'scheduleStatusScheduled',
      };
  }
}