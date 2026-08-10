import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { getPatientProfile } from '../api/patients';
import { listAppointments } from '../api/appointments';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import api from '../api/axios';
import createDentistViewProfileStyles from '../styles/DentistViewProfile';
import TreatmentPlan from './DentistTreatmentPlan';

const rowsPerPage = 10;

export default function DentistViewProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeSection, setActiveSection] = useState('profile');
  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patientError, setPatientError] = useState('');
  const [showBackModal, setShowBackModal] = useState(false);

  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDentistFilter, setHistoryDentistFilter] = useState('All');
  const [historyProcedureFilter, setHistoryProcedureFilter] = useState('All');

  const isMobile = screenWidth <= 850;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistViewProfileStyles({
    isMobile,
    isSmallScreen,
    isAdminView: user?.role === 'admin',
  });

  const backPath = user?.role === 'admin' ? '/adminPatients' : '/dentistRecords';
  const patient = mapPatientProfile(patientProfile, patientId);

  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [historyPreviewAttachment, setHistoryPreviewAttachment] = useState(null);
  const [historyAttachmentModal, setHistoryAttachmentModal] = useState(null);
  const [historyCloseConfirmOpen, setHistoryCloseConfirmOpen] = useState(false);
  const [historyRescheduleModal, setHistoryRescheduleModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const dentistFilterOptions = useMemo(() => {
    const names = treatmentHistory.map((item) => item.dentist).filter(Boolean);
    return [...new Set(names)];
  }, [treatmentHistory]);

  const procedureOptions = useMemo(() => {
    const procs = treatmentHistory.map((item) => item.procedure).filter(Boolean);
    return [...new Set(procs)];
  }, [treatmentHistory]);

  useEffect(() => {
    if (!patientId) return;

    async function loadPatientProfile() {
      setLoadingPatient(true);
      setPatientError('');

      try {
        const profile = await getPatientProfile(patientId);
        setPatientProfile(profile);
      } catch (err) {
        setPatientError(
          err.response?.data?.message || 'Failed to load patient profile.'
        );
      } finally {
        setLoadingPatient(false);
      }
    }

    async function loadTreatmentHistory() {
      setHistoryLoading(true);
      setHistoryError('');

      try {
        const [appointments, plans] = await Promise.all([
          listAppointments({
            patient_id: patientId,
            status: 'completed',
          }),
          getTreatmentPlansByPatient(patientId),
        ]);
        setTreatmentHistory(normalizeHistory(appointments, plans));
      } catch (err) {
        setHistoryError(
          err.response?.data?.message || 'Failed to load treatment history.'
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    loadPatientProfile();
    loadTreatmentHistory();
  }, [patientId]);

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

  const filteredTreatmentHistory = useMemo(() => {
    const search = historySearch.toLowerCase().trim();

    return treatmentHistory.filter((item) => {
      const searchMatch =
        String(item.date || '').toLowerCase().includes(search) ||
        String(item.tooth || '').toLowerCase().includes(search) ||
        String(item.procedure || '').toLowerCase().includes(search) ||
        String(item.dentist || '').toLowerCase().includes(search) ||
        String(item.note || '').toLowerCase().includes(search) ||
        String(item.status || '').toLowerCase().includes(search);

      const dentistMatch =
        historyDentistFilter === 'All' || item.dentist === historyDentistFilter;

      const procedureMatch =
        historyProcedureFilter === 'All' ||
        item.procedure === historyProcedureFilter;

      return searchMatch && dentistMatch && procedureMatch;
    });
  }, [
    treatmentHistory,
    historySearch,
    historyDentistFilter,
    historyProcedureFilter,
  ]);

  const historyTotalPages = Math.ceil(
    filteredTreatmentHistory.length / rowsPerPage
  );

  const paginatedTreatmentHistory = useMemo(() => {
    const start = (historyCurrentPage - 1) * rowsPerPage;
    return filteredTreatmentHistory.slice(start, start + rowsPerPage);
  }, [filteredTreatmentHistory, historyCurrentPage]);

  useEffect(() => {
    setHistoryCurrentPage(1);
  }, [historySearch, historyDentistFilter, historyProcedureFilter]);

  function getStatusStyle(status) {
    const key = String(status || 'Pending').toLowerCase();

    if (key === 'completed') {
      return { ...styles.statusBadge, ...styles.statusCompleted };
    }

    if (key === 'ongoing') {
      return { ...styles.statusBadge, ...styles.statusOngoing };
    }

    if (key === 'cancelled') {
      return { ...styles.statusBadge, ...styles.statusCancelled };
    }

    return { ...styles.statusBadge, ...styles.statusPending };
  }

  function prevHistoryPage() {
    if (historyCurrentPage > 1) {
      setHistoryCurrentPage((prev) => prev - 1);
    }
  }

  function nextHistoryPage() {
    if (historyCurrentPage < historyTotalPages) {
      setHistoryCurrentPage((prev) => prev + 1);
    }
  }

  function openBackModal() {
    setShowBackModal(true);
  }

  function closeBackModal() {
    setShowBackModal(false);
  }

  function confirmBack() {
    navigate(backPath);
  }

  function requestCloseHistoryAttachments() {
    setHistoryCloseConfirmOpen(true);
  }

  function closeHistoryAttachments() {
    setHistoryAttachmentModal(null);
    setHistoryCloseConfirmOpen(false);
  }

  function handleBackModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeBackModal();
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.topHeader}>
        <button type="button" style={styles.backLink} onClick={openBackModal}>Back</button>

        <h2 style={styles.headerTitle}>Patient Information Record</h2>
      </header>

      <aside style={styles.sidebar}>
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          style={{ ...styles.menuItem, ...(activeSection === 'profile' ? styles.menuItemActive : {}), }}
        >
          <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Patient Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('history')}
          style={{
            ...styles.menuItem,
            ...(activeSection === 'history' ? styles.menuItemActive : {}),
          }}
        >
          <i className="fi fi-rr-time-past" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Treatment History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('plan')}
          style={{
            ...styles.menuItem,
            ...(activeSection === 'plan' ? styles.menuItemActive : {}),
          }}
        >
          <i className="fi fi-rr-tooth" style={styles.menuItemIcon}></i>
          <span style={styles.menuItemText}>Treatment Plan</span>
        </button>
      </aside>

      <main style={styles.mainContainer}>
        {patientError && (
          <div style={styles.errorBox}>
            {patientError}
          </div>
        )}

        {loadingPatient && (
          <div style={styles.loadingBox}>Loading patient information...</div>
        )}

        {activeSection === 'profile' && (
          <section>
            <SectionBanner
              styles={styles}
              title="Patient Details"
              text="Review the patient’s basic profile, contact information, and medical background."
            />

            <div style={styles.patientCard}>
              <div style={styles.patientAvatar}>
                <i className="fi fi-rr-user"></i>
              </div>

              <div>
                <h2 style={styles.patientName}>{patient.name}</h2>
                <p style={styles.patientNumber}>
                  Patient No: {patient.patientNo}
                </p>
              </div>
            </div>

            <InfoCard title="Personal Information" styles={styles}>
              <div style={styles.infoGrid}>
                <InfoBox styles={styles} label="Nickname" value={patient.nickname} />
                <InfoBox styles={styles} label="Gender" value={patient.gender} />
                <InfoBox styles={styles} label="Suffix" value={patient.suffix} />
                <InfoBox styles={styles} label="Nationality" value={patient.nationality} />
                <InfoBox styles={styles} label="Religion" value={patient.religion} />
                <InfoBox styles={styles} label="Occupation" value={patient.occupation} />
                <InfoBox styles={styles} label="Age" value={patient.age} />
                <InfoBox styles={styles} label="Email" value={patient.email} />
                <InfoBox styles={styles} label="Contact Number" value={patient.contactNumber} />
                <InfoBox styles={styles} label="Dental Insurance" value={patient.dentalInsurance} />
                <InfoBox styles={styles} label="Effective Date" value={patient.effectiveDate} />
                <InfoBox styles={styles} label="Office Number" value={patient.officeNumber} />
                <InfoBox styles={styles} label="Home Address" value={patient.homeAddress} full />
                <InfoBox styles={styles} label="Fax Number" value={patient.faxNumber} />
              </div>
            </InfoCard>

            <InfoCard title="Medical Assessment" styles={styles}>
              <h4 style={styles.subHeading}>Dental History</h4>

              <div style={styles.infoGrid}>
                <InfoBox styles={styles} label="Previous Dentist" value={patient.previousDentist} />
                <InfoBox styles={styles} label="Last Dental Visit" value={patient.lastDentalVisit} />
                <InfoBox styles={styles} label="Dental History" value={patient.dentalHistory} full />
              </div>

              <h4 style={styles.subHeading}>Medical History</h4>

              <div style={styles.infoGrid}>
                <InfoBox styles={styles} label="Physician Name" value={patient.physicianName} />
                <InfoBox styles={styles} label="Specialty" value={patient.specialty} />
                <InfoBox styles={styles} label="Clinic Address" value={patient.clinicAddress} />
                <InfoBox styles={styles} label="Clinic Contact Number" value={patient.clinicContactNumber} />
              </div>
            </InfoCard>

            <InfoCard title="Health Conditions" styles={styles}>
              {patient.healthConditions.length === 0 ? (
                <div style={styles.emptyBox}>No health conditions recorded.</div>
              ) : (
                <div style={styles.conditionList}>
                  {patient.healthConditions.map((condition) => (
                    <div key={condition} style={styles.conditionChip}>
                      <i className="fi fi-rr-check"></i>
                      {condition}
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </section>
        )}

        {activeSection === 'history' && (
          <section>
            <SectionBanner
              styles={styles}
              title="Treatment History"
              text="Review completed appointments and notes added by the dentist."
            />

            {historyLoading && (
              <div style={styles.loadingBox}>Loading treatment history...</div>
            )}

            {historyError && (
              <div style={styles.errorBox}>{historyError}</div>
            )}

            <div style={styles.filterCard}>
              <div style={styles.searchBox}>
                <i className="fi fi-rr-search" style={styles.searchIcon}></i>

                <input
                  type="text"
                  placeholder="Search treatment history"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={historyDentistFilter}
                onChange={(event) => setHistoryDentistFilter(event.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Dentist</option>
                {dentistFilterOptions.map((dentist) => (
                  <option key={dentist} value={dentist}>
                    {dentist}
                  </option>
                ))}
              </select>

              <select
                value={historyProcedureFilter}
                onChange={(event) =>
                  setHistoryProcedureFilter(event.target.value)
                }
                style={styles.filterSelect}
              >
                <option value="All">All Procedure</option>
                {procedureOptions.map((procedure) => (
                  <option key={procedure} value={procedure}>
                    {procedure}
                  </option>
                ))}
              </select>
            </div>

            <TreatmentHistoryTable
              styles={styles}
              rows={paginatedTreatmentHistory}
              emptyText="No treatment history found."
              pageInfo={filteredTreatmentHistory.length === 0 ? 'Page 0 of 0' : `Page ${historyCurrentPage} of ${historyTotalPages}`}
              onPrev={prevHistoryPage}
              onNext={nextHistoryPage}
              prevDisabled={filteredTreatmentHistory.length === 0 || historyCurrentPage === 1}
              nextDisabled={filteredTreatmentHistory.length === 0 || historyCurrentPage >= historyTotalPages}
              getStatusStyle={getStatusStyle}
              onOpenAttachments={setHistoryAttachmentModal}
              onOpenReschedules={setHistoryRescheduleModal}
            />
          </section>
        )}

        {activeSection === 'plan' && (
          <section>
            <SectionBanner
              styles={styles}
              title="Treatment Plan"
              text="View the patient’s dental chart and planned treatments."
            />

            <TreatmentPlan patientId={patientId} isMobile={isMobile} />
          </section>
        )}
      </main>

      {showBackModal && (
        <div style={styles.modal} onClick={handleBackModalOverlayClick}>
          <div style={styles.backModalContent}>
            <div style={styles.backModalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.backModalTitle}>Leave Patient Record</h2>
            <p style={styles.backModalText}>
              {user?.role === 'admin'
                ? 'Are you sure you want to go back?'
                : 'Are you sure you want to go back? Any unsaved changes will be lost.'}
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
                onClick={confirmBack}
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

function SectionBanner({ styles, title, text }) {
  return (
    <div style={styles.sectionBanner}>
      <h2 style={styles.sectionBannerTitle}>{title}</h2>
      <p style={styles.sectionBannerText}>{text}</p>
    </div>
  );
}

function InfoCard({ styles, title, children }) {
  return (
    <div style={styles.infoCard}>
      <h3 style={styles.infoCardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function InfoBox({ styles, label, value, full = false }) {
  return (
    <div style={{ ...styles.infoBox, ...(full ? styles.infoBoxFull : {}) }}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || 'N/A'}</strong>
    </div>
  );
}

function formatDateOnly(value) {
  if (!value) return 'N/A';

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toISOString().slice(0, 10);
}

function mapPatientProfile(profile, patientId) {
  const fullName = profile?.full_name || 'Patient Name';

  const healthConditions = [
    profile?.medical_conditions,
    profile?.allergies ? `Allergies: ${profile.allergies}` : '',
    profile?.medications ? `Medications: ${profile.medications}` : '',
  ].filter(Boolean);

  return {
    id: patientId || 'N/A',
    name: fullName,
    patientNo: patientId || 'N/A',
    nickname: profile?.nickname || 'N/A',
    gender: profile?.sex || 'N/A',
    age: profile?.age || 'N/A',
    suffix: profile?.suffix || 'N/A',
    nationality: profile?.nationality || 'N/A',
    religion: profile?.religion || 'N/A',
    occupation: profile?.occupation || 'N/A',
    email: profile?.email || 'N/A',
    contactNumber: profile?.contact_number || 'N/A',
    dentalInsurance: profile?.dental_insurance || 'N/A',
    effectiveDate: formatDateOnly(profile?.effective_date),
    officeNumber: profile?.office_number || 'N/A',
    homeAddress: profile?.address || 'N/A',
    faxNumber: profile?.fax_number || 'N/A',
    previousDentist: profile?.previous_dentist || 'N/A',
    lastDentalVisit: formatDateOnly(profile?.last_visit),
    physicianName: profile?.physician_name || 'N/A',
    specialty: profile?.physician_specialty || 'N/A',
    clinicAddress: profile?.physician_office_address || 'N/A',
    clinicContactNumber: profile?.physician_office_number || 'N/A',
    lastVisit: formatDateOnly(profile?.last_visit),
    dentalHistory: profile?.dental_history || 'N/A',
    healthConditions,
  };
}

function normalizeHistory(items, plans = []) {
  if (!Array.isArray(items)) return [];

  const rows = items
    .filter((item) => String(item.status || '').toLowerCase() === 'completed')
    .map((item) => {
    const d = item.start_time ? new Date(item.start_time) : null;
    const dateStr = d && !Number.isNaN(d.getTime())
      ? d.toISOString().slice(0, 10)
      : 'N/A';

    const serviceName = String(item.service_name || '').toLowerCase().trim();
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

    const attachments = matchingPlans.flatMap((plan) => plan.attachments || []);
    const noteMeta = parseRescheduleNote(item.dentist_note || '');

    return {
      id: item.id,
      historyKey: getCompletedVisitKey(item, dateStr),
      date: dateStr,
      tooth: matchingPlans.map((plan) => `#${plan.tooth_number}`).join(', ') || 'N/A',
      procedure: item.service_name || 'N/A',
      dentist: item.dentist_name || 'N/A',
      note: noteMeta.note,
      rescheduleCount: noteMeta.count,
      rescheduleDetails: noteMeta.details,
      status: 'Completed',
      attachments,
    };
  });

  return collapseCompletedHistoryRows(rows);
}

function TreatmentHistoryTable({ styles, rows, emptyText, pageInfo, onPrev, onNext, prevDisabled, nextDisabled, getStatusStyle, onOpenAttachments, onOpenReschedules, }) {
  return (
    <div style={styles.tableCard}>
      <div style={styles.tableWrapper}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Date</th>
              <th style={styles.tableHead}>Tooth No/s</th>
              <th style={styles.tableHead}>Procedure</th>
              <th style={styles.tableHead}>Dentist Name</th>
              <th style={styles.tableHead}>Note</th>
              <th style={styles.tableHead}>Status</th>
              <th style={styles.tableHead}>Attachment</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyRow}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{item.date || 'N/A'}</td>
                  <td style={styles.tableCell}>{item.tooth || 'N/A'}</td>
                  <td style={styles.tableCell}>{item.procedure || 'N/A'}</td>
                  <td style={styles.tableCell}>{item.dentist || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    <TreatmentHistoryNote
                      styles={styles}
                      item={item}
                      onOpenReschedules={onOpenReschedules}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <span style={getStatusStyle(item.status)}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <HistoryAttachmentButton
                      styles={styles}
                      item={item}
                      onOpenAttachments={onOpenAttachments}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          style={{ ...styles.pageBtn, ...styles.prevPageBtn,
            ...(prevDisabled ? styles.pageBtnDisabled : {}),
          }}
        >
          Previous
        </button>

        <span style={styles.pageInfo}>{pageInfo}</span>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          style={{ ...styles.pageBtn, ...styles.nextPageBtn,
            ...(nextDisabled ? styles.pageBtnDisabled : {}),
          }}
        >
          Next
        </button>
      </div>
    </div>
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
      style={{
        ...styles.historyAttachmentBtn,
        ...(count === 0 ? styles.historyAttachmentBtnDisabled : {}),
      }}
      disabled={count === 0}
      onClick={() => onOpenAttachments(item)}
    >
      <i className="fi fi-rr-eye"></i>
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

function getCompletedVisitKey(item, fallbackDate) {
  const start = item.start_time ? new Date(item.start_time) : null;
  const startKey = start && !Number.isNaN(start.getTime())
    ? start.toISOString()
    : fallbackDate;
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

function formatFileSize(value) {
  const size = Number(value || 0);
  if (!size) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
