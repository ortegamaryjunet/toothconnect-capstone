import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { listMyPatients } from '../api/patients';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import createDentistRecordsStyles from '../styles/DentistRecords';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import DentistProfileMenu from '../components/DentistProfileMenu';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';

async function loadPdfTools() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return { jsPDF, autoTable };
}

const rowsPerPage = 10;

export default function DentistRecords() {
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [serviceNames, setServiceNames] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [searchValue, setSearchValue] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [nameFilter, setNameFilter] = useState('most-recent');
  const [currentPage, setCurrentPage] = useState(1);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState('');

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistRecordsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    api
      .get('/auth/staff-profile/me')
      .then((res) => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchPatients() {
      setPatientsLoading(true);
      setPatientsError('');

      try {
        const data = await listMyPatients();
        setPatients(normalizePatients(data));
      } catch (err) {
        setPatientsError(
          err.response?.data?.message || 'Failed to load patients.'
        );
      } finally {
        setPatientsLoading(false);
      }
    }

    fetchPatients();
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
    const search = searchValue.toLowerCase().trim();

    const filtered = patients.filter((patient) => {
      const name = String(patient.name || '').toLowerCase();
      const lastVisit = patient.lastVisit
        ? String(patient.lastVisit).slice(0, 10)
        : '';

      const matchesSearch = name.includes(search);
      const matchesFromDate = !fromDate || lastVisit >= fromDate;
      const matchesToDate = !toDate || lastVisit <= toDate;

      return matchesSearch && matchesFromDate && matchesToDate;
    });

    return [...filtered].sort((a, b) => {
      const aName = String(a.name || '').toLowerCase();
      const bName = String(b.name || '').toLowerCase();

      if (nameFilter === 'a-z') {
        return aName.localeCompare(bName);
      }

      if (nameFilter === 'z-a') {
        return bName.localeCompare(aName);
      }

      const aDate = new Date(a.lastVisit || '1900-01-01').getTime();
      const bDate = new Date(b.lastVisit || '1900-01-01').getTime();

      return bDate - aDate;
    });
  }, [patients, searchValue, fromDate, toDate, nameFilter]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, fromDate, toDate, nameFilter]);

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

  function handleSearchChange(value) {
    const lettersOnly = value.replace(/[^a-zA-ZñÑ\s]/g, '');
    setSearchValue(lettersOnly);
  }

  function handleFromDateChange(value) {
    setFromDate(value);

    if (toDate && value && toDate < value) {
      setToDate('');
    }
  }

  function handleToDateChange(value) {
    if (fromDate && value && value < fromDate) {
      return;
    }

    setToDate(value);
  }

  function exportPatientsToCSV() {
    if (filteredPatients.length === 0) {
      setShowExportModal(true);
      return;
    }

    const headers = [
      'Patient No',
      'Full Name',
      'Contact',
      'Email',
      'Last Visit',
      'Visits',
    ];

    const rows = filteredPatients.map((patient) => [
      formatPatientNo(patient.id),
      patient.name,
      patient.contactNumber || 'N/A',
      patient.email || 'N/A',
      patient.lastVisit ? patient.lastVisit.slice(0, 10) : 'N/A',
      patient.totalAppointments,
    ]);

    const csv = [];
    csv.push(['Smile Empress Dental Hub']);
    csv.push(['Dentist Patient Records']);
    csv.push(['Generated Date', new Date().toLocaleString('en-PH')]);
    csv.push(['Dentist', user?.name || 'Dentist']);
    csv.push([
      'Date Range',
      `${fromDate || 'All'} to ${toDate || 'All'}`,
    ]);
    csv.push([]);
    csv.push(headers);
    rows.forEach((row) => csv.push(row));

    const csvContent =
      '\uFEFF' +
      csv.map((row) => row.map(formatCSVValue).join(',')).join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'dentist_patient_records.csv';

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
      const plans = await getTreatmentPlansByPatient(patient.userId || patient.id);
      attachmentItems = await loadPdfAttachmentItems(plans);
    } catch (_err) {
      attachmentItems = [{ label: 'Unable to load attachments', isTextOnly: true }];
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
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
      doc.text('Dentist Patient Record Report', 14, 20);

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
    doc.text(safeValue(patient.name), 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Patient No: ${formatPatientNo(patient.id)}`, 20, 58);
    doc.text(`Dentist: ${safeValue(user?.name || 'Dentist')}`, 20, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 101, 8);
    doc.text(
      `Last Visit: ${
        patient.lastVisit ? patient.lastVisit.slice(0, 10) : 'N/A'
      }`,
      pageWidth - 20,
      58,
      { align: 'right' }
    );

    doc.text(
      `Visits: ${safeValue(patient.totalAppointments)}`,
      pageWidth - 20,
      64,
      { align: 'right' }
    );

    let nextY = 76;

    nextY = addSection(
      'Table Record Summary',
      [
        ['Patient No', formatPatientNo(patient.id)],
        ['Full Name', safeValue(patient.name)],
        ['Contact', safeValue(patient.contactNumber)],
        ['Email', safeValue(patient.email)],
        [
          'Last Visit',
          patient.lastVisit ? patient.lastVisit.slice(0, 10) : 'N/A',
        ],
        ['Visits', safeValue(patient.totalAppointments)],
      ],
      nextY
    );

    nextY = addSection(
      'Patient Profile Details',
      [
        ['Patient ID', safeValue(patient.id)],
        ['User ID', safeValue(patient.userId)],
        ['Full Name', safeValue(patient.name)],
        ['Email Address', safeValue(patient.email)],
        ['Contact Number', safeValue(patient.contactNumber)],
        ['Gender', safeValue(patient.gender)],
        ['Age', safeValue(patient.age)],
        ['Birthday', safeValue(patient.birthday)],
        ['Address', safeValue(patient.address)],
        ['Account Status', safeValue(patient.status)],
        [
          'Last Visit',
          patient.lastVisit ? patient.lastVisit.slice(0, 10) : 'N/A',
        ],
        ['Total Visits', safeValue(patient.totalAppointments)],
      ],
      nextY
    );

    nextY = addSection(
      'Treatment and Appointment Details',
      [
        ['Latest Treatment', safeValue(patient.latestTreatment)],
        ['Treatment Status', safeValue(patient.treatmentStatus)],
        ['Appointment Status', safeValue(patient.appointmentStatus)],
        ['Reason for Visit', safeValue(patient.reasonForVisit)],
        ['Notes', safeValue(patient.notes)],
      ],
      nextY
    );

    nextY = addAttachmentSection(nextY);

    const totalPdfPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPdfPages; page += 1) {
      doc.setPage(page);
      drawFooter();
    }

    doc.save(`${formatPatientNo(patient.id)}_dentist_patient_record.pdf`);
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

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/dentist" style={styles.menuItem}>
            <i
              className="fi fi-rr-chart-histogram"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/dentistAppointment" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link
            to="/dentistRecords"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i
              className="fi fi-rr-clipboard-user"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Patient Records</span>
          </Link>

          <Link to="/dentistProfile" style={styles.menuItem}>
            <i className="fi fi-rr-id-badge" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>View Profile</span>
          </Link>

          <Link to="/dentistSchedule" style={styles.menuItem}>
            <i className="fi fi-rr-calendar" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>My Schedule</span>
          </Link>

          <Link to="/dentistNotif" style={styles.menuItem}>
            <i className="fi fi-rr-bell" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Notifications</span>
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
            <DentistProfileMenu
              styles={styles}
              dentistName={user?.name || 'Dentist'}
              specialization="Dentist"
            />
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Patient Records</span>

              <h2 style={styles.heroTitle}>
                Review your patients and track their treatment progress
              </h2>

              <p style={styles.heroText}>
                Search, filter, and view patient visit details assigned to your
                care.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i
                className="fi fi-rr-clipboard-user"
                style={styles.heroIconText}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search patient name"
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <div style={styles.dateRangeGroup}>
                <div style={styles.dateRangeField}>
                  <label style={styles.dateRangeLabel}>From</label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      handleFromDateChange(event.target.value)
                    }
                    style={styles.filterInput}
                  />
                </div>

                <div style={styles.dateRangeField}>
                  <label style={styles.dateRangeLabel}>To</label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) =>
                      handleToDateChange(event.target.value)
                    }
                    style={styles.filterInput}
                  />
                </div>
              </div>

              <select
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
                style={styles.filterSelect}
              >
                <option value="most-recent">Most Recent</option>
                <option value="a-z">Name A-Z</option>
                <option value="z-a">Name Z-A</option>
              </select>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <div>
                <h3 style={styles.tableTitle}>Patient List</h3>
              </div>

              <button
                type="button"
                style={styles.exportCsvBtn}
                onClick={exportPatientsToCSV}
              >
                <i className="fi fi-rr-file-csv"></i>
                Export CSV
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.patientTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Patient No</th>
                    <th style={styles.tableHead}>Full Name</th>
                    <th style={styles.tableHead}>Contact</th>
                    <th style={styles.tableHead}>Email</th>
                    <th style={styles.tableHead}>Last Visit</th>
                    <th style={styles.tableHead}>Visits</th>
                    <th style={styles.tableHead}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patientsLoading ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        Loading patients...
                      </td>
                    </tr>
                  ) : patientsError ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        {patientsError}
                      </td>
                    </tr>
                  ) : paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyRow}>
                        No patient found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <tr key={patient.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          {formatPatientNo(patient.id)}
                        </td>
                        <td style={styles.tableCell}>{patient.name}</td>
                        <td style={styles.tableCell}>
                          {patient.contactNumber || '—'}
                        </td>
                        <td style={styles.tableCell}>
                          {patient.email || '—'}
                        </td>
                        <td style={styles.tableCell}>
                          {patient.lastVisit
                            ? patient.lastVisit.slice(0, 10)
                            : '—'}
                        </td>
                        <td style={styles.tableCell}>
                          {patient.totalAppointments}
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.actionGroup}>
                            <Link
                              to={`/dentistRecords/${patient.id}`}
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
            <h2 style={styles.exportModalTitle}>No Records Found</h2>

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

function normalizePatients(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    userId: item.user_id || item.userId || item.id,
    name: item.name || item.full_name || item.fullName || 'Unknown',
    email: item.email || item.email_address || '',
    contactNumber:
      item.phone ||
      item.contact_number ||
      item.contactNumber ||
      item.phone_number ||
      '',
    lastVisit: item.last_visit || item.lastVisit || '',
    totalAppointments:
      item.total_appointments || item.totalAppointments || 0,
    gender: item.gender || '',
    age: item.age || '',
    birthday: item.birthday || item.birthdate || item.date_of_birth || '',
    address:
      item.address ||
      item.home_address ||
      item.homeAddress ||
      item.patient_address ||
      '',
    status: item.status || item.account_status || '',
    latestTreatment:
      item.latest_treatment ||
      item.latestTreatment ||
      item.treatment ||
      '',
    treatmentStatus: item.treatment_status || item.treatmentStatus || '',
    appointmentStatus:
      item.appointment_status || item.appointmentStatus || '',
    reasonForVisit:
      item.reason_for_visit ||
      item.reasonForVisit ||
      item.reason_for_booking ||
      '',
    notes: item.notes || item.remarks || '',
  }));
}

function formatPatientNo(id) {
  return `P-${String(id).padStart(4, '0')}`;
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
