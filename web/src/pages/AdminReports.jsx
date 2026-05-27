import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import {
  getClinicDentistPerformance,
  getConsumptionReport,
  getPatientTreatmentReport,
  getPatientVisitReport,
  getPatientSatisfactionReport,
  getStockAvailabilityReport,
} from '../api/reports';
import { getRevenueReport } from '../api/payments';
import { listAuditLogs } from '../api/auditLogs';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import createAdminReportsStyles from '../styles/AdminReports';
import clinicLogo from '../assets/adminImages/clinic-logo.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const reportOptions = [
  {
    value: 'clinicDentist',
    label: 'Clinic and Dentist Performance',
  },
  {
    value: 'satisfaction',
    label: 'Patient Satisfaction Ratings and Feedback',
  },
  {
    value: 'revenue',
    label: 'Revenue, Income, and Expense',
  },
  {
    value: 'visits',
    label: 'Patient Visit',
  },
  {
    value: 'treatments',
    label: 'Patient Treatment',
  },
  {
    value: 'stockAvailability',
    label: 'Stock Items Availability',
  },
  {
    value: 'consumption',
    label: 'Monthly and Quarterly Consumption',
  },
  {
    value: 'audit',
    label: 'Audit Trails and Activity Logs',
  },
];

const reportData = {
  clinicDentist: {
    title: 'Clinic and Dentist Performance Reports',
    mainChartTitle: 'Completed Appointments by Dentist',
    statusChartTitle: 'Dentist Rating Distribution',
    labels: [],
    mainData: [],
    statusLabels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    statusData: [0, 0, 0, 0, 0],
    headers: [
      'ID',
      'Dentist Name',
      'Total Patients',
      'Treatments Done',
      'Rating',
      'Date',
    ],
    rows: [],
  },

  satisfaction: {
    title: 'Patient Satisfaction Ratings and Feedback Reports',
    mainChartTitle: 'Average Rating by Dentist',
    statusChartTitle: 'Rating Distribution',
    labels: [],
    mainData: [],
    statusLabels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    statusData: [0, 0, 0, 0, 0],
    headers: [
      'ID',
      'Patient Name',
      'Rating',
      'Feedback',
      'Dentist',
      'Date',
    ],
    rows: [],
  },

  revenue: {
    title: 'Revenue, Income, and Expense Reports',
    mainChartTitle: 'Revenue and Expense Overview',
    statusChartTitle: 'Financial Status',
    summary: {
      totalRecords: 0,
      activeData: 0,
      thisMonth: 0,
      attention: 0,
    },
    labels: [],
    mainData: [],
    statusLabels: ['Income', 'Expense', 'Net'],
    statusData: [0, 0, 0],
    headers: ['ID', 'Date', 'Description', 'Income', 'Expense', 'Net Amount', 'Status'],
    rows: [],
  },

  visits: {
    title: 'Patient Visit Reports',
    mainChartTitle: 'Patient Visits by Month',
    statusChartTitle: 'Appointment Status',
    labels: [],
    mainData: [],
    statusLabels: [],
    statusData: [],
    headers: ['ID', 'Patient Name', 'Branch Location', 'Dentist', 'Visit Date', 'Purpose', 'Status'],
    rows: [],
  },

  treatments: {
    title: 'Patient Treatment Reports',
    mainChartTitle: 'Patient Treatments by Month',
    statusChartTitle: 'Treatment Types',
    labels: [],
    mainData: [],
    statusLabels: [],
    statusData: [],
    headers: [
      'ID',
      'Patient Name',
      'Branch Location',
      'Treatment',
      'Tooth',
      'Dentist',
      'Treatment Date',
      'Notes',
      'Status',
    ],
    rows: [],
  },

  stockAvailability: {
    title: 'Stock Items Availability Reports',
    mainChartTitle: 'Available Quantity by Item Type',
    statusChartTitle: 'Stock Status',
    labels: [],
    mainData: [],
    statusLabels: ['Available', 'Low Stock', 'Out of Stock'],
    statusData: [0, 0, 0],
    headers: [
      'ID',
      'Item Name',
      'Branch Location',
      'Item Type',
      'Category',
      'Quantity',
      'Unit',
      'Status',
    ],
    rows: [],
  },

  consumption: {
    title: 'Monthly and Quarterly Consumption Reports',
    mainChartTitle: 'Consumed Quantity by Month',
    statusChartTitle: 'Consumption Status',
    labels: [],
    mainData: [],
    statusLabels: ['Normal', 'High'],
    statusData: [0, 0],
    headers: [
      'ID',
      'Item Name',
      'Branch Location',
      'Category',
      'Month',
      'Quarter',
      'Consumed Quantity',
      'Status',
    ],
    rows: [],
  },

  audit: {
    title: 'Audit Trails and Activity Logs Reports',
    mainChartTitle: 'Audit Activity Overview',
    statusChartTitle: 'Audit Status',
    summary: {
      totalRecords: 0,
      activeData: 0,
      thisMonth: 0,
      attention: 0,
    },
    labels: [],
    mainData: [],
    statusLabels: ['Success', 'Failed'],
    statusData: [0, 0],
    headers: [
      'ID',
      'Timestamp',
      'Role Type',
      'Name',
      'Action Type',
      'Module Section',
      'IP Address',
      'Status',
    ],
    rows: [],
  },
};

function formatPeso(value) {
  return `\u20B1${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function parseAmount(value) {
  return Number(String(value || 0).replace(/[^0-9.-]/g, '')) || 0;
}

function getBranchCity(branch) {
  const address = branch?.address || '';
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return branch?.name || 'Branch';
  }

  const cityPart =
    parts.find((part) => !/\d/.test(part)) ||
    parts[parts.length - 1];

  return cityPart.replace(/\b(branch|clinic)\b/gi, '').trim() || cityPart;
}

const AUDIT_MODULE_MAP = {
  appointment_created: 'Appointments',
  appointment_cancelled: 'Appointments',
  appointment_status_changed: 'Appointments',
  appointment_consumption: 'Inventory',
  payment_recorded_by_staff: 'Payments',
  payment_status_updated: 'Payments',
  payment_receipt_reupload_enabled: 'Payments',
  payment_amount_updated: 'Payments',
  treatment_created: 'Patient Records',
  treatment_deleted: 'Patient Records',
  inventory_restock: 'Inventory',
  inventory_purchase_expense: 'Inventory',
};

const AUDIT_ACTION_LABEL_MAP = {
  appointment_created: 'Created appointment',
  appointment_cancelled: 'Cancelled appointment',
  appointment_status_changed: 'Updated appointment status',
  appointment_consumption: 'Recorded service consumption',
  payment_recorded_by_staff: 'Recorded payment',
  payment_status_updated: 'Updated payment status',
  payment_receipt_reupload_enabled: 'Enabled receipt reupload',
  payment_amount_updated: 'Updated payment amount',
  treatment_created: 'Added treatment',
  treatment_deleted: 'Deleted treatment',
  inventory_restock: 'Restocked inventory',
  inventory_purchase_expense: 'Created purchase expense',
};

function transformAuditLogsToReport(data) {
  const logs = data.logs || [];

  function formatDT(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const t = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${y}-${m}-${day} ${t}`;
  }

  const rows = logs.map(log => [
    log.id,
    formatDT(log.created_at),
    log.user_role ? log.user_role.charAt(0).toUpperCase() + log.user_role.slice(1) : 'Unknown',
    log.user_name || 'Unknown',
    AUDIT_ACTION_LABEL_MAP[log.action] || log.action,
    AUDIT_MODULE_MAP[log.action] || 'System',
    'N/A',
    'Success',
  ]);

  const moduleCounts = {};
  for (const log of logs) {
    const mod = AUDIT_MODULE_MAP[log.action] || 'System';
    moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
  }
  const moduleLabels = Object.keys(moduleCounts);
  const moduleData = moduleLabels.map(l => moduleCounts[l]);

  const now = new Date();
  const thisMonth = logs.filter(log => {
    const d = new Date(log.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return {
    title: 'Audit Trails and Activity Logs Reports',
    mainChartTitle: 'Audit Activity by Module',
    statusChartTitle: 'Audit Status',
    summary: { totalRecords: logs.length, activeData: logs.length, thisMonth, attention: 0 },
    labels: moduleLabels.length ? moduleLabels : ['No Data'],
    mainData: moduleData.length ? moduleData : [0],
    statusLabels: ['Success', 'Failed'],
    statusData: [logs.length, 0],
    headers: ['ID', 'Timestamp', 'Role Type', 'Name', 'Action Type', 'Module Section', 'IP Address', 'Status'],
    rows,
  };
}

export default function AdminReports() {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportModalMessage, setExportModalMessage] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [reportType, setReportType] = useState('clinicDentist');
  const [appliedReportType, setAppliedReportType] = useState('clinicDentist');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [appliedBranchFilter, setAppliedBranchFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [liveReports, setLiveReports] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [filterClicked, setFilterClicked] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);

  const rowsPerPage = 10;

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminReportsStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const currentReport =
    liveReports[appliedReportType] ||
    reportData[appliedReportType] ||
    reportData.clinicDentist;
  const isRevenueReport = appliedReportType === 'revenue';
  const isClinicDentistReport = appliedReportType === 'clinicDentist';
  const isSatisfactionReport = appliedReportType === 'satisfaction';
  const isPatientVisitReport = appliedReportType === 'visits';
  const isPatientTreatmentReport = appliedReportType === 'treatments';
  const isStockAvailabilityReport = appliedReportType === 'stockAvailability';
  const isConsumptionReport = appliedReportType === 'consumption';
  const reportUsesBranchFilter =
    reportType === 'clinicDentist' || reportType === 'satisfaction';
  const showReportSummary =
    !isClinicDentistReport &&
    !isSatisfactionReport &&
    !isPatientVisitReport &&
    !isPatientTreatmentReport &&
    !isStockAvailabilityReport &&
    !isConsumptionReport;

  const revenueRows = useMemo(() => {
    if (!isRevenueReport) return [];

    return (currentReport.rows || []).map((row) => ({
      id: row[0],
      period: row[1],
      description: row[2],
      income: parseAmount(row[3]),
      expense: parseAmount(row[4]),
      revenue: parseAmount(row[5]),
      status: row[6],
    }));
  }, [currentReport, isRevenueReport]);

  const totalIncome = revenueRows.reduce((sum, row) => sum + row.income, 0);
  const totalExpense = revenueRows.reduce((sum, row) => sum + row.expense, 0);
  const netRevenue = totalIncome - totalExpense;

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
    document.body.style.overflow = showLogoutModal || showExportModal ? 'hidden' : '';

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

  useEffect(() => {
    setSearchValue('');
    setCurrentPage(1);
  }, [appliedReportType]);

  useEffect(() => {
    async function loadLiveReport() {
      setReportLoading(true);
      setReportError('');

      try {
        const params = {
          from: appliedFromDate || undefined,
          to: appliedToDate || undefined,
          branch_id:
            appliedReportType === 'clinicDentist' ||
            appliedReportType === 'satisfaction'
              ? appliedBranchFilter || undefined
              : undefined,
        };

        const reportLoaders = {
          clinicDentist: getClinicDentistPerformance,
          satisfaction: getPatientSatisfactionReport,
          revenue: getRevenueReport,
          visits: getPatientVisitReport,
          treatments: getPatientTreatmentReport,
          stockAvailability: getStockAvailabilityReport,
          consumption: getConsumptionReport,
          audit: (p) => listAuditLogs({ from: p.from, to: p.to }).then(transformAuditLogsToReport),
        };

        const data = await reportLoaders[appliedReportType](params);

        setLiveReports((prev) => ({
          ...prev,
          [appliedReportType]: data,
        }));
      } catch (err) {
        setReportError(
          err.response?.data?.message ||
            'Failed to load report records from the database.'
        );
      } finally {
        setReportLoading(false);
      }
    }

    if (
      appliedReportType === 'clinicDentist' ||
      appliedReportType === 'satisfaction' ||
      appliedReportType === 'revenue' ||
      appliedReportType === 'visits' ||
      appliedReportType === 'treatments' ||
      appliedReportType === 'stockAvailability' ||
      appliedReportType === 'consumption' ||
      appliedReportType === 'audit'
    ) {
      loadLiveReport();
    }
  }, [appliedReportType, appliedFromDate, appliedToDate, appliedBranchFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadBranchOptions() {
      try {
        const branchesRes = await api.get('/auth/branches');
        if (!isMounted) return;
        setBranchOptions(branchesRes.data.branches || []);
      } catch (err) {
        console.error('Failed to load branch options.', err);
      }
    }

    loadBranchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (isRevenueReport) return [];

    const search = searchValue.toLowerCase().trim();

    return currentReport.rows.filter((row) => {
      const rowText = row.join(' ').toLowerCase();

      const rowDate = row.find((cell) =>
        /^\d{4}-\d{2}-\d{2}/.test(String(cell))
      );

      const matchesSearch = rowText.includes(search);

      const matchesFromDate =
        !appliedFromDate ||
        !rowDate ||
        String(rowDate).substring(0, 10) >= appliedFromDate;

      const matchesToDate =
        !appliedToDate ||
        !rowDate ||
        String(rowDate).substring(0, 10) <= appliedToDate;

      return matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [
    currentReport,
    searchValue,
    appliedFromDate,
    appliedToDate,
    isRevenueReport,
  ]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = useMemo(() => {
    if (isRevenueReport) return [];

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, isRevenueReport]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, appliedFromDate, appliedToDate]);

  const mainChartData = useMemo(() => {
    return {
      labels: currentReport.labels,
      datasets: [
        {
          label: currentReport.mainChartTitle,
          data: currentReport.mainData,
          backgroundColor: '#5b7fc1',
          borderRadius: 5,
        },
      ],
    };
  }, [currentReport]);

  const statusChartData = useMemo(() => {
    return {
      labels: currentReport.statusLabels || [],
      datasets: [
        {
          data: currentReport.statusData || [],
          backgroundColor: ['#5b7fc1', '#f6c23e', '#e74c3c', '#1cc88a'],
          borderWidth: 0,
        },
      ],
    };
  }, [currentReport]);

  const revenueChartData = {
    labels: revenueRows.map((item) => item.period),
    datasets: [
      {
        label: 'Income',
        data: revenueRows.map((item) => item.income),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: revenueRows.map((item) => item.expense),
        backgroundColor: '#dc2626',
        borderRadius: 6,
      },
      {
        label: 'Revenue',
        data: revenueRows.map((item) => item.revenue),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: {
            family: 'Arial',
            size: 13,
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatPeso(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#475569',
          font: {
            family: 'Arial',
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#475569',
          callback(value) {
            return formatPeso(value);
          },
          font: {
            family: 'Arial',
          },
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '55%' : '62%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

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

  function applyFilter() {
    setFilterClicked(true);
    window.setTimeout(() => {
      setFilterClicked(false);
    }, 180);

    setAppliedReportType(reportType);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedBranchFilter(branchFilter);
    setCurrentPage(1);
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

  function getStatusStyle(value) {
    const successStatus = [
      'Success',
      'Active',
      'Available',
      'Excellent',
      'Good',
      'Positive',
      'Completed',
      'Used',
      'Normal',
    ];

    const warningStatus = [
      'Low Stock',
      'Pending',
      'Ongoing',
      'Follow Up',
      'High',
      'Needs Improvement',
      'Neutral',
    ];

    const failedStatus = [
      'Failed',
      'Inactive',
      'Expired',
      'Cancelled',
      'Negative',
      'Critical',
      'Out of Stock',
    ];

    if (successStatus.includes(value)) {
      return { ...styles.statusBadge, ...styles.statusSuccess };
    }

    if (warningStatus.includes(value)) {
      return { ...styles.statusBadge, ...styles.statusWarning };
    }

    if (failedStatus.includes(value)) {
      return { ...styles.statusBadge, ...styles.statusFailed };
    }

    return null;
  }

  function createFileName(title, extension) {
    return (
      title
        .toLowerCase()
        .replace(/ and /g, '-')
        .replace(/,/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') + `.${extension}`
    );
  }

  function downloadFile(content, fileName, fileType) {
    const blob = new Blob([content], { type: fileType });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  function showNoExportDataModal(message) {
    setExportModalMessage(message);
    setShowExportModal(true);
  }

  function handleExportModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setShowExportModal(false);
    }
  }

  function getReportTitle() {
    return isRevenueReport
      ? 'Revenue, Income, and Expense Reports'
      : currentReport.title;
  }

  function getTableExportRows() {
    if (isRevenueReport) {
      return revenueRows.map((row) => [
        row.period,
        formatPeso(row.income),
        formatPeso(row.expense),
        formatPeso(row.revenue),
      ]);
    }

    return filteredRows || [];
  }

  function getReportExportRows() {
    if (isRevenueReport) {
      return [
        ...revenueRows.map((row) => [
          row.period,
          formatPeso(row.income),
          formatPeso(row.expense),
          formatPeso(row.revenue),
        ]),
        [
          'Total',
          formatPeso(totalIncome),
          formatPeso(totalExpense),
          formatPeso(netRevenue),
        ],
      ];
    }

    return currentReport.rows || [];
  }

  function getExportHeaders() {
    if (isRevenueReport) {
      return ['Period', 'Income', 'Expenses', 'Revenue'];
    }

    return currentReport.headers || [];
  }

  function formatCSVValue(value) {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function exportToCSV() {
    const tableRows = getTableExportRows();

    if (tableRows.length === 0) {
      showNoExportDataModal('No table records available to export.');
      return;
    }

    const csv = [];

    csv.push([getReportTitle()]);
    csv.push(['Smile Empress Dental Hub']);
    csv.push(['Generated Report', new Date().toLocaleString('en-PH')]);
    csv.push(['Date Range', `${appliedFromDate || 'All'} to ${appliedToDate || 'All'}`]);
    csv.push([]);
    csv.push(getExportHeaders());

    tableRows.forEach((row) => {
      csv.push(row);
    });

    if (isRevenueReport) {
      csv.push([
        'Total',
        formatPeso(totalIncome),
        formatPeso(totalExpense),
        formatPeso(netRevenue),
      ]);
    }

    const csvContent =
      '\uFEFF' + csv.map((row) => row.map(formatCSVValue).join(',')).join('\n');

    downloadFile(
      csvContent,
      createFileName(getReportTitle(), 'csv'),
      'text/csv;charset=utf-8;'
    );
  }

  function exportToPDF() {
    const pdfRows = getReportExportRows();

    if (pdfRows.length === 0) {
      showNoExportDataModal('No report data available to export.');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(255, 248, 220);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(212, 175, 55);
    doc.roundedRect(10, 10, pageWidth - 20, 30, 4, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(getReportTitle(), 16, 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Smile Empress Dental Hub', 16, 31);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.text(
      `Generated: ${new Date().toLocaleString('en-PH')}`,
      pageWidth - 16,
      48,
      { align: 'right' }
    );

    doc.text(
      `Date Range: ${appliedFromDate || 'All'} to ${appliedToDate || 'All'}`,
      16,
      48
    );

    autoTable(doc, {
      head: [getExportHeaders()],
      body: pdfRows,
      startY: 56,
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: [15, 23, 42],
        fillColor: [255, 255, 255],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [255, 253, 242],
      },
      didDrawPage() {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text('Generated by ToothConnect', 10, pageHeight - 8);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          pageWidth - 10,
          pageHeight - 8,
          { align: 'right' }
        );
      },
    });

    doc.save(createFileName(getReportTitle(), 'pdf'));
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link to="/admin" style={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/adminPatients" style={styles.menuItem}>
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

          <Link
            to="/adminReports"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
            <i className="fi fi-rr-sign-out-alt" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            <div style={styles.adminProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.adminInfo}>
                <div style={styles.adminName}>{adminName}</div>
                <div style={styles.adminPosition}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Reports and Records</span>

              <h2 style={styles.heroTitle}>
                Generate and manage clinic reports with real-time insights.
              </h2>

              <p style={styles.heroText}>
                Track revenue, patient visits, treatments, inventory records,
                and clinic activity in one organized dashboard.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i
                className="fi fi-rr-chart-histogram"
                style={styles.heroIcon}
              ></i>
            </div>
          </section>

          <section style={styles.filterCard}>
            <div style={{ ...styles.filterGroup, ...styles.reportTypeGroup }}>
              <label style={styles.filterLabel}>Report Type</label>

              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                style={styles.filterSelect}
              >
                {reportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {reportUsesBranchFilter && (
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Branch</label>

                <select
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {getBranchCity(branch)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>From</label>

              <input
                type="date"
                value={fromDate}
                onChange={(event) => handleFromDateChange(event.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>To</label>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => handleToDateChange(event.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterActionGroup}>
              <button
                type="button"
                onClick={applyFilter}
                style={{
                  ...styles.filterBtn,
                  transform: filterClicked ? 'scale(0.97)' : 'scale(1)',
                  opacity: filterClicked ? 0.82 : 1,
                  transition: 'transform 120ms ease, opacity 120ms ease',
                }}
              >
                Apply Filter
              </button>

              <button
                type="button"
                onClick={exportToPDF}
                style={{ ...styles.exportBtn, ...styles.exportPdf }}
              >
                <i className="fi fi-rr-file-pdf"></i>
                PDF
              </button>
            </div>
          </section>

          {isRevenueReport ? (
            <RevenueReportSection
              styles={styles}
              revenueRows={revenueRows}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              netRevenue={netRevenue}
              revenueChartData={revenueChartData}
              revenueChartOptions={revenueChartOptions}
              exportToCSV={exportToCSV}
            />
          ) : (
            <>
              {showReportSummary && (
                <section style={styles.summaryGrid}>
                  <SummaryCard
                    styles={styles}
                    icon="fi fi-rr-document"
                    colorStyle={styles.summaryIconBlue}
                    label="Total Records"
                    value={currentReport.summary.totalRecords}
                  />

                  <SummaryCard
                    styles={styles}
                    icon="fi fi-rr-check-circle"
                    colorStyle={styles.summaryIconGreen}
                    label="Active Data"
                    value={currentReport.summary.activeData}
                  />

                  <SummaryCard
                    styles={styles}
                    icon="fi fi-rr-calendar"
                    colorStyle={styles.summaryIconYellow}
                    label="This Month"
                    value={currentReport.summary.thisMonth}
                  />

                  <SummaryCard
                    styles={styles}
                    icon="fi fi-rr-exclamation"
                    colorStyle={styles.summaryIconRed}
                    label="Needs Attention"
                    value={currentReport.summary.attention}
                  />
                </section>
              )}

              <section style={styles.chartsGrid}>
                <div style={{ ...styles.reportCard, ...styles.chartLarge }}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>
                        {currentReport.mainChartTitle}
                      </h3>
                      <p style={styles.cardSubtitle}>
                        Selected report chart overview.
                      </p>
                    </div>
                  </div>

                  <div style={styles.chartBox}>
                    <Bar data={mainChartData} options={mainChartOptions} />
                  </div>
                </div>

                <div style={styles.reportCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>
                        {currentReport.statusChartTitle}
                      </h3>
                      <p style={styles.cardSubtitle}>
                        {isClinicDentistReport || isSatisfactionReport
                          ? 'Rating breakdown from 1 to 5 stars.'
                          : 'Status breakdown.'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.smallChart}>
                    <Doughnut
                      data={statusChartData}
                      options={statusChartOptions}
                    />
                  </div>
                </div>
              </section>

              <section style={{ ...styles.reportCard, ...styles.tableCard }}>
                <div style={styles.tableHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{currentReport.title}</h3>
                    <p style={styles.cardSubtitle}>
                      {reportLoading
                        ? 'Loading report records from the database...'
                        : 'View, search, and export report records.'}
                    </p>
                    {reportError && (
                      <p style={{ ...styles.cardSubtitle, color: '#b91c1c' }}>
                        {reportError}
                      </p>
                    )}
                  </div>

                  <div style={styles.tableActions}>
                    <div style={styles.tableSearch}>
                      <i className="fi fi-rr-search" style={styles.searchIcon}></i>

                      <input
                        type="text"
                        placeholder="Search records"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        style={styles.searchInput}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={exportToCSV}
                      style={{ ...styles.exportBtn, ...styles.exportCsv }}
                    >
                      <i className="fi fi-rr-file-csv"></i>
                      CSV
                    </button>

                  </div>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.reportsTable}>
                    <thead>
                      <tr>
                        {currentReport.headers.map((header) => (
                          <th key={header} style={styles.tableHead}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={currentReport.headers.length}
                            style={styles.emptyRow}
                          >
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, rowIndex) => (
                          <tr key={`${appliedReportType}-${rowIndex}`}>
                            {row.map((cell, cellIndex) => {
                              const statusStyle = getStatusStyle(cell);

                              return (
                                <td
                                  key={`${cell}-${cellIndex}`}
                                  style={styles.tableCell}
                                >
                                  {statusStyle ? (
                                    <span style={statusStyle}>{cell}</span>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

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
                      {filteredRows.length === 0
                        ? 'Page 0 of 0'
                        : `Page ${currentPage} of ${totalPages}`}
                    </span>

                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      style={{
                        ...styles.pageBtn,
                        ...(currentPage >= totalPages
                          ? styles.pageBtnDisabled
                          : {}),
                      }}
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
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
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
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
              {exportModalMessage || 'No records available to export.'}
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

function RevenueReportSection({
  styles,
  revenueRows,
  totalIncome,
  totalExpense,
  netRevenue,
  revenueChartData,
  revenueChartOptions,
  exportToCSV,
}) {
  return (
    <section style={styles.revenueContent}>
      <section style={styles.revenueLayout}>
        <div style={styles.revenueLeftContent}>
          <section style={styles.revenueSummaryGrid}>
            <RevenueSummaryCard
              styles={styles}
              icon="fi fi-rr-money"
              colorStyle={styles.summaryIconGreen}
              title="Total Income"
              value={formatPeso(totalIncome)}
            />

            <RevenueSummaryCard
              styles={styles}
              icon="fi fi-rr-receipt"
              colorStyle={styles.summaryIconRed}
              title="Total Expenses"
              value={formatPeso(totalExpense)}
            />

            <RevenueSummaryCard
              styles={styles}
              icon="fi fi-rr-chart-histogram"
              colorStyle={styles.summaryIconBlue}
              title="Net Revenue"
              value={formatPeso(netRevenue)}
            />
          </section>

          <section style={styles.revenueMiddleGrid}>
            <div style={styles.reportCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>
                    Income, Expenses, and Revenue
                  </h3>
                  <p style={styles.cardSubtitle}>
                    Compares paid appointment income and inventory expenses.
                  </p>
                </div>
              </div>

              <div style={styles.revenueChartBox}>
                <Bar data={revenueChartData} options={revenueChartOptions} />
              </div>
            </div>

            <div style={styles.reportCard}>
              <h3 style={styles.cardTitle}>
                How Revenue is Calculated
              </h3>

              <div style={styles.revenueFormulaItem}>
                <p style={styles.revenueFormulaText}>
                  <strong style={styles.revenueIncomeText}>Income =</strong>
                  <br />
                  sum of paid appointment payments
                </p>
              </div>

              <div style={styles.revenueFormulaItem}>
                <p style={styles.revenueFormulaText}>
                  <strong style={styles.revenueExpenseText}>Expenses =</strong>
                  <br />
                  sum of inventory purchases
                </p>
              </div>

              <div
                style={{
                  ...styles.revenueFormulaItem,
                  borderBottom: 'none',
                }}
              >
                <p style={styles.revenueFormulaText}>
                  <strong style={styles.revenueBlueText}>Revenue =</strong>
                  <br />
                  Income - Expenses
                </p>
              </div>
            </div>
          </section>

          <section style={{ ...styles.reportCard, ...styles.tableCard }}>
            <div style={styles.tableHeader}>
              <div>
                <h3 style={styles.cardTitle}>Period Summary</h3>
                <p style={styles.cardSubtitle}>
                  Simple breakdown of income, expenses, and net revenue.
                </p>
              </div>

              <div style={styles.tableActions}>
                <button
                  type="button"
                  onClick={exportToCSV}
                  style={{ ...styles.exportBtn, ...styles.exportCsv }}
                >
                  <i className="fi fi-rr-file"></i>
                  CSV
                </button>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.revenueSummaryTable}>
                <thead>
                  <tr>
                    <th style={styles.revenueTableHead}>Period</th>
                    <th style={styles.revenueTableHead}>Income</th>
                    <th style={styles.revenueTableHead}>Expenses</th>
                    <th style={styles.revenueTableHead}>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {revenueRows.map((row) => (
                    <tr key={row.id}>
                      <td style={styles.revenueTableCell}>{row.period}</td>

                      <td style={styles.revenueTableCell}>
                        {formatPeso(row.income)}
                      </td>

                      <td style={styles.revenueTableCell}>
                        {formatPeso(row.expense)}
                      </td>

                      <td
                        style={{
                          ...styles.revenueTableCell,
                          ...styles.revenueCell,
                        }}
                      >
                        {formatPeso(row.revenue)}
                      </td>
                    </tr>
                  ))}

                  {revenueRows.length === 0 && (
                    <tr>
                      <td colSpan={4} style={styles.emptyRow}>
                        No revenue records found.
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td
                      style={{
                        ...styles.revenueTableCell,
                        ...styles.revenueTotalCell,
                      }}
                    >
                      Total
                    </td>

                    <td
                      style={{
                        ...styles.revenueTableCell,
                        ...styles.revenueTotalIncomeCell,
                      }}
                    >
                      {formatPeso(totalIncome)}
                    </td>

                    <td
                      style={{
                        ...styles.revenueTableCell,
                        ...styles.revenueTotalExpenseCell,
                      }}
                    >
                      {formatPeso(totalExpense)}
                    </td>

                    <td
                      style={{
                        ...styles.revenueTableCell,
                        ...styles.revenueTotalRevenueCell,
                      }}
                    >
                      {formatPeso(netRevenue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}

function RevenueSummaryCard({
  styles,
  icon,
  colorStyle,
  title,
  value,
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, ...colorStyle }}>
        <i className={icon} style={styles.summaryIconText}></i>
      </div>

      <div style={styles.summaryText}>
        <p style={styles.summaryLabel}>{title}</p>
        <h2 style={{ ...styles.summaryValue, ...styles.revenueSummaryAmount }}>
          {value}
        </h2>
      </div>
    </div>
  );
}

function SummaryCard({ styles, icon, colorStyle, label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, ...colorStyle }}>
        <i className={icon} style={styles.summaryIconText}></i>
      </div>

      <div style={styles.summaryText}>
        <p style={styles.summaryLabel}>{label}</p>
        <h2 style={styles.summaryValue}>{value}</h2>
      </div>
    </div>
  );
}