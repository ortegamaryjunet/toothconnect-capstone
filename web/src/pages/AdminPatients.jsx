import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { listPatients } from '../api/patients';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import AdminProfileMenu from '../components/AdminProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminPatientsStyles from '../styles/AdminPatients';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

async function loadPdfTools() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return { jsPDF, autoTable };
}

export default function AdminPatients() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState('');

  const rowsPerPage = 10;

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminPatientsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    async function loadPatients() {
      setLoadingPatients(true);
      setPatientsError('');

      try {
        const rows = await listPatients();
        setPatients(rows.map((row, index) => mapPatientRow(row, index)));
      } catch (err) {
        setPatientsError(
          err.response?.data?.message || 'Failed to load patients.'
        );
      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
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
    document.body.style.overflow =
      showLogoutModal || showExportModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showExportModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        setShowExportModal(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const search = searchValue.toLowerCase().trim();

      const patientId = String(patient.id).toLowerCase();
      const lastName = String(patient.lastName).toLowerCase();
      const firstName = String(patient.firstName).toLowerCase();
      const middleName = String(patient.middleName).toLowerCase();
      const gender = String(patient.gender).toLowerCase();

      const fullName = `${lastName} ${firstName} ${middleName}`;

      const matchesSearch =
        patientId.includes(search) ||
        fullName.includes(search) ||
        firstName.includes(search) ||
        middleName.includes(search) ||
        lastName.includes(search);

      const matchesGender =
        genderFilter === 'all' || gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchValue, genderFilter]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, genderFilter]);

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleExportModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowExportModal(false);
    }
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

  function exportPatientsToCSV() {
    if (filteredPatients.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Patient ID',
      'Last Name',
      'First Name',
      'Middle Name',
      'Age',
      'Gender',
    ];

    const rows = filteredPatients.map((patient) => [
      patient.id,
      patient.lastName,
      patient.firstName,
      patient.middleName,
      patient.age,
      patient.gender,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(formatCSVValue).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'patient_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function exportPatientToPDF(patient) {
    const { jsPDF, autoTable } = await loadPdfTools();
    const doc = new jsPDF('p', 'mm', 'a4');
    let attachmentItems = [];

    try {
      const plans = await getTreatmentPlansByPatient(patient.userId);
      attachmentItems = await loadPdfAttachmentItems(plans);
    } catch (_err) {
      attachmentItems = [{ label: 'Unable to load attachments', isTextOnly: true }];
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const fullName = [
      patient.firstName,
      patient.middleName,
      patient.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    const generatedDate = new Date().toLocaleString('en-PH');

    function safeValue(value) {
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }

      return String(value);
    }

    function drawHeader() {
      doc.setFillColor(255, 248, 220);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setFillColor(139, 101, 8);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFillColor(212, 175, 55);
      doc.rect(0, 28, pageWidth, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Smile Empress Dental Hub', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Patient Record Report', 14, 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ToothConnect', pageWidth - 14, 12, {
        align: 'right',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Generated: ${generatedDate}`, pageWidth - 14, 20, {
        align: 'right',
      });
    }

    function drawFooter() {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('Generated by ToothConnect', 14, pageHeight - 9);
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        pageWidth - 14,
        pageHeight - 9,
        { align: 'right' }
      );
    }

    function drawSectionTitle(title, yPosition) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(14, yPosition, pageWidth - 28, 9, 2, 2, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title, 18, yPosition + 6);

      return yPosition + 13;
    }

    function addSection(title, rows, startY) {
      let yPosition = startY;

      if (yPosition > pageHeight - 45) {
        doc.addPage();
        drawHeader();
        yPosition = 40;
      }

      yPosition = drawSectionTitle(title, yPosition);

      autoTable(doc, {
        startY: yPosition,
        theme: 'grid',
        head: [['Field', 'Details']],
        body: rows,
        margin: {
          left: 14,
          right: 14,
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          textColor: [15, 23, 42],
          lineColor: [229, 231, 235],
          lineWidth: 0.25,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [255, 253, 242],
        },
        columnStyles: {
          0: {
            cellWidth: 55,
            fontStyle: 'bold',
            textColor: [51, 65, 85],
          },
          1: {
            cellWidth: 'auto',
          },
        },
        didDrawPage() {
          drawFooter();
        },
      });

      return doc.lastAutoTable.finalY + 8;
    }

    function addAttachmentSection(startY) {
      let yPosition = startY;
      const left = 14;
      const right = pageWidth - 14;
      const fieldWidth = 55;
      const detailsX = left + fieldWidth;
      const tableWidth = right - left;
      const detailsWidth = tableWidth - fieldWidth;
      const rowHeight = 57;
      const imageWidth = 54;
      const imageHeight = 40;
      const bottomLimit = pageHeight - 22;

      if (yPosition > pageHeight - 70) {
        doc.addPage();
        drawHeader();
        yPosition = 40;
      }

      yPosition = drawSectionTitle('Attachments', yPosition);

      const imageItems = attachmentItems.filter((item) => item.dataUrl);
      const textItems = attachmentItems.filter((item) => item.isTextOnly);
      const rows = imageItems.length
        ? imageItems
        : [{ label: textItems.map((item) => item.label).join('\n') || 'No attachments uploaded', isTextOnly: true }];

      function drawAttachmentTableHeader() {
        doc.setFillColor(212, 175, 55);
        doc.rect(left, yPosition, tableWidth, 10, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.25);
        doc.rect(left, yPosition, fieldWidth, 10);
        doc.rect(detailsX, yPosition, detailsWidth, 10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Field', left + 4, yPosition + 6.5);
        doc.text('Details', detailsX + 4, yPosition + 6.5);
        yPosition += 10;
      }

      drawAttachmentTableHeader();

      rows.forEach((item, index) => {
        const currentRowHeight = item.dataUrl ? rowHeight : 18;

        if (yPosition + currentRowHeight > bottomLimit) {
          doc.addPage();
          drawHeader();
          yPosition = 40;
          drawAttachmentTableHeader();
        }

        doc.setFillColor(255, 255, 255);
        doc.rect(left, yPosition, fieldWidth, currentRowHeight, 'F');
        doc.rect(detailsX, yPosition, detailsWidth, currentRowHeight, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(left, yPosition, fieldWidth, currentRowHeight);
        doc.rect(detailsX, yPosition, detailsWidth, currentRowHeight);

        if (index === 0) {
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text('Attachments', left + 4, yPosition + 9);
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        if (item.dataUrl) {
          const imageX = detailsX + 4;
          const imageY = yPosition + 5;
          doc.addImage(item.dataUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(7);
          doc.text(item.label, imageX, imageY + imageHeight + 5, {
            maxWidth: detailsWidth - 8,
          });
        } else {
          doc.text(item.label, detailsX + 4, yPosition + 9, {
            maxWidth: detailsWidth - 8,
          });
        }

        yPosition += currentRowHeight;
      });

      return yPosition + 8;
    }

    drawHeader();

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 39, pageWidth - 28, 29, 3, 3, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(fullName || 'Patient Name', 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Patient ID: ${safeValue(patient.id)}`, 20, 58);
    doc.text(`User ID: ${safeValue(patient.userId)}`, 20, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 101, 8);
    doc.text(`Gender: ${safeValue(patient.gender)}`, pageWidth - 20, 58, {
      align: 'right',
    });
    doc.text(`Age: ${safeValue(patient.age)}`, pageWidth - 20, 64, {
      align: 'right',
    });

    let nextY = 76;

    nextY = addSection(
      'Table Record Summary',
      [
        ['Patient ID', safeValue(patient.id)],
        ['Last Name', safeValue(patient.lastName)],
        ['First Name', safeValue(patient.firstName)],
        ['Middle Name', safeValue(patient.middleName)],
        ['Age', safeValue(patient.age)],
        ['Gender', safeValue(patient.gender)],
      ],
      nextY
    );

    nextY = addSection(
      'Patient Profile Details',
      [
        ['User ID', safeValue(patient.userId)],
        ['Full Name', safeValue(fullName)],
        ['Email Address', safeValue(patient.email)],
        ['Contact Number', safeValue(patient.contactNumber)],
        ['Birthday', safeValue(patient.birthday)],
        ['Address', safeValue(patient.address)],
        ['Status', safeValue(patient.status)],
        ['Date Created', safeValue(patient.createdAt)],
      ],
      nextY
    );

    nextY = addAttachmentSection(nextY);

    const totalPdfPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPdfPages; page += 1) {
      doc.setPage(page);
      drawFooter();
    }

    doc.save(`${safeValue(patient.id)}_patient_record.pdf`);
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link
            to="/adminPatients"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/adminEmployees" style={styles.menuItem}>
            <i
              className="fi fi-rr-stethoscope"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Clinic Employee</span>
          </Link>

          <Link to="/adminInventory" style={styles.menuItem}>
            <i className="fi fi-rr-boxes" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Inventory</span>
          </Link>

          <Link to="/adminTransactions" style={styles.menuItem}>
            <i className="fi fi-rr-file-invoice-dollar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Transactions</span>
          </Link>

          <Link to="/adminLogs" style={styles.menuItem}>
            <i
              className="fi fi-rr-clipboard-list"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Audit Logs</span>
          </Link>

          <Link to="/adminNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
            <NotificationUnreadBadge />
          </Link>

          <Link to="/adminReports" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-line-up"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Reports</span>
          </Link>

          <Link to="/adminSettings" style={styles.menuItem}>
            <i className="fi fi-rr-settings" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Settings</span>
          </Link>
        </nav>

        <div style={styles.logoutSection}>
          <div style={styles.dropdownDivider}></div>

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
            <AdminProfileMenu styles={styles} adminName={adminName} />
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                Organize and manage patient information, appointments, and
                treatment records.
              </h2>

              <p style={styles.heroText}>
                View patient profiles, monitor appointments, update treatment
                history, and manage clinic records.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i
                className="fi fi-rr-clipboard-user"
                style={styles.heroIcon}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.rightActions}>
              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                style={styles.genderFilter}
              >
                <option value="all">All Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Patient List</h3>

              <button
                type="button"
                style={styles.exportBtn}
                onClick={exportPatientsToCSV}
              >
                <i
                  className="fi fi-rr-file-csv"
                  style={styles.exportIcon}
                ></i>
                CSV
              </button>
            </div>

            {patientsError && (
              <div style={styles.errorText}>{patientsError}</div>
            )}

            {loadingPatients && (
              <div style={styles.loadingText}>Loading patients...</div>
            )}

            <div style={styles.tableWrapper}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Patient ID</th>
                    <th style={styles.tableHead}>Last Name</th>
                    <th style={styles.tableHead}>First Name</th>
                    <th style={styles.tableHead}>Middle Name</th>
                    <th style={styles.tableHead}>Age</th>
                    <th style={styles.tableHead}>Gender</th>
                    <th style={styles.tableHead}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        No patient records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{patient.id}</td>
                        <td style={styles.tableCell}>{patient.lastName}</td>
                        <td style={styles.tableCell}>{patient.firstName}</td>
                        <td style={styles.tableCell}>{patient.middleName}</td>
                        <td style={styles.tableCell}>{patient.age}</td>
                        <td style={styles.tableCell}>{patient.gender}</td>

                        <td style={styles.tableCell}>
                          <div style={styles.actionGroup}>
                            <Link
                              to={`/adminPatients/${patient.userId}`}
                              style={styles.viewBtn}
                              title="View patient profile"
                            >
                              View
                            </Link>

                            <button
                              type="button"
                              style={styles.pdfBtn}
                              title="Export patient as PDF"
                              onClick={() => exportPatientToPDF(patient)}
                            >
                              <i
                                className="fi fi-rr-file-pdf"
                                style={styles.pdfBtnIcon}
                              ></i>
                              PDF
                            </button>
                          </div>
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
                onClick={prevPage}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                }}
              >
                Prev
              </button>

              <span style={styles.pageInfo}>
                {filteredPatients.length === 0
                  ? 'Page 0 of 0'
                  : `Page ${currentPage} of ${totalPages}`}
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
                Next
              </button>
            </div>
          </section>
        </main>
      </div>

      {showLogoutModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
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

      {showExportModal && (
        <div
          style={styles.exportModalOverlay}
          onClick={handleExportModalOverlayClick}
        >
          <div style={styles.exportModalContent}>
            <h2 style={styles.exportModalTitle}>No Patient Records</h2>

            <div style={styles.exportModalDivider}></div>

            <p style={styles.exportModalText}>
              No patient records available to export.
            </p>

            <button
              type="button"
              style={styles.exportModalButton}
              onClick={() => setShowExportModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCSVValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

async function loadPdfAttachmentItems(plans) {
  const rows = uniquePdfAttachmentRows((Array.isArray(plans) ? plans : [])
    .flatMap((plan) => (plan.attachments || []).map((attachment) => ({
      id: attachment.id,
      tooth: plan.tooth_number,
      procedure: plan.planned_treatment,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      mimeType: attachment.mime_type,
      fileSize: attachment.file_size,
    }))));

  if (rows.length === 0) {
    return [{ label: 'No attachments uploaded', isTextOnly: true }];
  }

  const items = await Promise.all(rows.map(async (item) => {
    const label = `Tooth #${item.tooth} - ${item.procedure}`;

    if (!String(item.mimeType || '').startsWith('image/')) {
      return { label: `${label}: ${item.fileName}`, isTextOnly: true };
    }

    try {
      const dataUrl = await imageUrlToPngDataUrl(attachmentUrl(item.fileUrl));
      return { label, dataUrl };
    } catch (_err) {
      return { label: `${label}: image unavailable`, isTextOnly: true };
    }
  }));

  return items;
}

function uniquePdfAttachmentRows(rows) {
  const seen = new Set();

  return rows.filter((item) => {
    const key =
      item.id ||
      item.fileUrl ||
      `${item.fileName || ''}-${item.fileSize || ''}`;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function attachmentUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

async function imageUrlToPngDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load attachment image');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      middleName: '',
      lastName: '',
    };
  }

  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts[parts.length - 1],
  };
}

function formatPatientDisplayId(index = 0) {
  return `PI-${String(Number(index) + 1).padStart(4, '0')}`;
}

function mapPatientRow(row, index = 0) {
  const fullName = row.full_name || row.fullName || row.name || '';
  const nameParts = splitName(fullName);

  const firstName = row.first_name || row.firstName || nameParts.firstName;
  const middleName = row.middle_name || row.middleName || nameParts.middleName;
  const lastName = row.last_name || row.lastName || nameParts.lastName;
  const userId = row.user_id || row.userId || row.id;

  return {
    id: formatPatientDisplayId(index),
    rawId: row.id,
    userId,
    lastName,
    firstName,
    middleName,
    age: row.age || '',
    gender: row.gender || '',
    email: row.email || row.email_address || '',
    contactNumber:
      row.phone ||
      row.phone_number ||
      row.contact_number ||
      row.contactNumber ||
      '',
    birthday: row.birthday || row.birthdate || row.date_of_birth || '',
    address:
      row.address ||
      row.home_address ||
      row.homeAddress ||
      row.patient_address ||
      '',
    status: row.status || row.account_status || '',
    createdAt: row.created_at || row.createdAt || '',
  };
}
