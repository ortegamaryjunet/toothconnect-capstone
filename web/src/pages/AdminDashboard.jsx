import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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

import { getAdminDashboardReport } from '../api/reports';
import { useAuth } from '../auth/AuthContext';
import createAdminDashboardStyles from '../styles/AdminDashboard';

import clinicLogo from '../assets/adminImages/clinic-logo.png';
import patientsIcon from '../assets/adminImages/patients.png';
import appointmentIcon from '../assets/adminImages/appt.png';
import staffIcon from '../assets/adminImages/clinic-staff.png';
import revenueIcon from '../assets/adminImages/revenue.png';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const today = new Date();
  const firstDashboardYear = 2026;
  const currentYear = today.getFullYear();

  const [visitMonth, setVisitMonth] = useState(today.getMonth());
  const [visitYear, setVisitYear] = useState(currentYear);
  const [incomeYear, setIncomeYear] = useState(currentYear);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      totalAppointments: 0,
      totalEmployees: 0,
      revenue: 0,
    },
    patientVisits: {
      newPatients: [],
      returningPatients: [],
    },
    stockSummary: {
      totalProduct: 0,
      inStock: 0,
      lowStock: 0,
      outStock: 0,
    },
    incomeExpenses: {
      income: Array(12).fill(0),
      expenses: Array(12).fill(0),
    },
    expenseBreakdown: {
      labels: [
        'Rental',
        'Wages',
        'Dental Supplies',
        'Dental Equipment',
        'Medicines',
        'Others',
      ],
      data: Array(6).fill(0),
    },
    patientFeedback: [],
    patientSatisfaction: {
      averageRating: 0,
      totalFeedback: 0,
      ratingCounts: [0, 0, 0, 0, 0],
    },
  });
  const [dashboardError, setDashboardError] = useState('');

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createAdminDashboardStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const adminName = user?.name || user?.email || 'Admin';

  const dashboardStats = dashboardData.stats;
  const stockSummary = dashboardData.stockSummary;

  const totalStock =
    stockSummary.inStock + stockSummary.lowStock + stockSummary.outStock;

  const inStockPercent =
    totalStock > 0 ? (stockSummary.inStock / totalStock) * 100 : 0;

  const lowStockPercent =
    totalStock > 0 ? (stockSummary.lowStock / totalStock) * 100 : 0;

  const outStockPercent =
    totalStock > 0 ? (stockSummary.outStock / totalStock) * 100 : 0;

  const dashboardYears = useMemo(() => {
    const lastYear = Math.max(firstDashboardYear, currentYear + 4);
    return Array.from(
      { length: lastYear - firstDashboardYear + 1 },
      (_, index) => firstDashboardYear + index
    );
  }, [currentYear]);

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
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      try {
        setDashboardError('');

        const data = await getAdminDashboardReport({
          visit_month: Number(visitMonth) + 1,
          visit_year: visitYear,
          income_year: incomeYear,
        });

        if (isCurrent) {
          setDashboardData((current) => ({
            ...current,
            ...data,
            stats: {
              ...current.stats,
              ...(data.stats || {}),
            },
            patientVisits: {
              ...current.patientVisits,
              ...(data.patientVisits || {}),
            },
            stockSummary: {
              ...current.stockSummary,
              ...(data.stockSummary || {}),
            },
            incomeExpenses: {
              ...current.incomeExpenses,
              ...(data.incomeExpenses || {}),
            },
            expenseBreakdown: {
              ...current.expenseBreakdown,
              ...(data.expenseBreakdown || {}),
            },
            patientFeedback: data.patientFeedback || [],
            patientSatisfaction: {
              ...current.patientSatisfaction,
              ...(data.patientSatisfaction || {}),
            },
          }));
        }
      } catch (err) {
        console.error(err);
        if (isCurrent) {
          setDashboardError('Unable to load live dashboard data.');
        }
      }
    }

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, [visitMonth, visitYear, incomeYear]);

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

  function getWeekLabels(month, year) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const labels = [];

    let week = 1;
    let start = 1;

    while (start <= totalDays) {
      const end = Math.min(start + 6, totalDays);
      labels.push(`Week ${week} (${start}-${end})`);
      start += 7;
      week += 1;
    }

    return labels;
  }

  const visitLabels = useMemo(() => {
    return getWeekLabels(Number(visitMonth), Number(visitYear));
  }, [visitMonth, visitYear]);

  const visitChartData = useMemo(() => {
    return {
      labels: visitLabels,
      datasets: [
        {
          label: 'New Patients',
          data: visitLabels.map((_, index) =>
            Number(dashboardData.patientVisits.newPatients?.[index] || 0)
          ),
          backgroundColor: '#2563eb',
          borderRadius: 6,
        },
        {
          label: 'Returning Patients',
          data: visitLabels.map((_, index) =>
            Number(dashboardData.patientVisits.returningPatients?.[index] || 0)
          ),
          backgroundColor: '#93c5fd',
          borderRadius: 6,
        },
      ],
    };
  }, [dashboardData.patientVisits, visitLabels]);

  const incomeChartData = useMemo(() => {
    return {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        {
          label: 'Income',
          data: Array.from({ length: 12 }, (_, index) =>
            Number(dashboardData.incomeExpenses.income?.[index] || 0)
          ),
          backgroundColor: '#2563eb',
          borderRadius: 6,
        },
        {
          label: 'Expenses',
          data: Array.from({ length: 12 }, (_, index) =>
            Number(dashboardData.incomeExpenses.expenses?.[index] || 0)
          ),
          backgroundColor: '#7c3aed',
          borderRadius: 6,
        },
      ],
    };
  }, [dashboardData.incomeExpenses, incomeYear]);

  const expenseChartData = useMemo(() => {
    return {
      labels: dashboardData.expenseBreakdown.labels,
      datasets: [
        {
          data: dashboardData.expenseBreakdown.data.map((value) =>
            Number(value || 0)
          ),
          backgroundColor: [
            '#2563eb',
            '#f59e0b',
            '#ef4444',
            '#7c3aed',
            '#22c55e',
            '#ec4899',
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardData.expenseBreakdown]);

  const hasIncomeExpenseData = incomeChartData.datasets.some((dataset) =>
    dataset.data.some((value) => Number(value || 0) > 0)
  );

  const hasExpenseBreakdownData = expenseChartData.datasets[0].data.some(
    (value) => Number(value || 0) > 0
  );

  const latestFeedback = dashboardData.patientFeedback || [];
  const patientSatisfaction = dashboardData.patientSatisfaction || {};
  const ratingCounts = patientSatisfaction.ratingCounts || [0, 0, 0, 0, 0];
  const totalRatings = ratingCounts.reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  function getRatingPercent(index) {
    if (totalRatings === 0) return '0%';
    return `${(Number(ratingCounts[index] || 0) / totalRatings) * 100}%`;
  }

  function getFeedbackDotStyle(rating) {
    if (Number(rating) >= 5) return styles.dotSuccess;
    if (Number(rating) >= 4) return styles.dotWarning;
    return styles.dotFailed;
  }

  const defaultChartOptions = {
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
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const moneyChartOptions = {
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
        ticks: {
          callback: (value) => '₱ ' + Number(value).toLocaleString('en-PH'),
        },
      },
    },
  };

  const expenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '58%' : '65%',
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
        },
      },
    },
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link
            to="/admin"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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
          <section style={styles.dashboardHero}>
            <div>
              <span style={styles.heroBadge}>Dashboard Overview</span>

              <h2 style={styles.heroTitle}>
                Keep track of clinic performance, inventory, and reports.
              </h2>

              <p style={styles.heroText}>
                Monitor patients, appointments, employee records, revenue, and
                clinic activity in one clean dashboard.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i
                className="fi fi-rr-chart-histogram"
                style={styles.heroIconText}
              ></i>
            </div>
          </section>

          {dashboardError && (
            <p style={styles.errorText}>{dashboardError}</p>
          )}

          <section style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryIcon, ...styles.summaryIconBlue }}>
                <img
                  src={patientsIcon}
                  alt="Patients"
                  style={styles.summaryIconImg}
                />
              </div>

              <div>
                <p style={styles.summaryLabel}>Total Patients</p>
                <h2 style={styles.summaryValue}>
                  {dashboardStats.totalPatients}
                </h2>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div
                style={{ ...styles.summaryIcon, ...styles.summaryIconGreen }}
              >
                <img
                  src={appointmentIcon}
                  alt="Appointments"
                  style={styles.summaryIconImg}
                />
              </div>

              <div>
                <p style={styles.summaryLabel}>Total Appointments</p>
                <h2 style={styles.summaryValue}>
                  {dashboardStats.totalAppointments}
                </h2>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div
                style={{ ...styles.summaryIcon, ...styles.summaryIconPurple }}
              >
                <img
                  src={staffIcon}
                  alt="Employees"
                  style={styles.summaryIconImg}
                />
              </div>

              <div>
                <p style={styles.summaryLabel}>Total Employees</p>
                <h2 style={styles.summaryValue}>
                  {dashboardStats.totalEmployees}
                </h2>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div
                style={{ ...styles.summaryIcon, ...styles.summaryIconOrange }}
              >
                <img
                  src={revenueIcon}
                  alt="Revenue"
                  style={styles.summaryIconImg}
                />
              </div>

              <div>
                <p style={styles.summaryLabel}>Revenue</p>
                <h2 style={styles.summaryValue}>
                  ₱ {dashboardStats.revenue.toLocaleString('en-PH')}
                </h2>
              </div>
            </div>
          </section>

          <section style={styles.dashboardGrid}>
            <div style={{ ...styles.dashboardCard, ...styles.tallCard }}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Patient Visit</h3>
                  <p style={styles.cardSubtitle}>
                    Weekly patient visits by selected month and year.
                  </p>
                </div>

                <div style={styles.dateFilter}>
                  <select
                    value={visitMonth}
                    onChange={(event) =>
                      setVisitMonth(Number(event.target.value))
                    }
                    style={styles.select}
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>

                  <select
                    value={visitYear}
                    onChange={(event) =>
                      setVisitYear(Number(event.target.value))
                    }
                    style={styles.select}
                  >
                    {dashboardYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.largeChart}>
                <Bar data={visitChartData} options={defaultChartOptions} />
              </div>
            </div>

            <div style={styles.dashboardCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Stock Availability</h3>
                  <p style={styles.cardSubtitle}>Inventory stock summary.</p>
                </div>

                <Link to="/adminInventory" style={styles.cardLink}>
                  View All
                </Link>
              </div>

              <div style={styles.stockNumbers}>
                <div style={styles.stockNumberBox}>
                  <p style={styles.stockNumberLabel}>Total Product</p>
                  <h4 style={styles.stockNumberValue}>
                    {stockSummary.totalProduct}
                  </h4>
                </div>
              </div>

              <div style={styles.stockBar}>
                <div
                  style={{
                    ...styles.inStock,
                    width: `${inStockPercent}%`,
                  }}
                ></div>

                <div
                  style={{
                    ...styles.lowStock,
                    width: `${lowStockPercent}%`,
                  }}
                ></div>

                <div
                  style={{
                    ...styles.outStock,
                    width: `${outStockPercent}%`,
                  }}
                ></div>
              </div>

              <div style={styles.stockLabels}>
                <span>In Stock</span>
                <span>Low Stock</span>
                <span>Out of Stock</span>
              </div>
            </div>

            <div style={{ ...styles.dashboardCard, ...styles.tallCard }}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Income & Expenses</h3>
                  <p style={styles.cardSubtitle}>
                    Monthly financial overview.
                  </p>
                </div>

                <select
                  value={incomeYear}
                  onChange={(event) => setIncomeYear(Number(event.target.value))}
                  style={styles.select}
                >
                  {dashboardYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.chartBox}>
                {hasIncomeExpenseData ? (
                  <Bar data={incomeChartData} options={moneyChartOptions} />
                ) : (
                  <div style={styles.emptyChart}>
                    No income or expense records for {incomeYear}.
                  </div>
                )}
              </div>
            </div>

            <div style={styles.dashboardCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Expenses</h3>
                  <p style={styles.cardSubtitle}>
                    Expense category breakdown.
                  </p>
                </div>
              </div>

              <div style={styles.chartBox}>
                {hasExpenseBreakdownData ? (
                  <Doughnut
                    data={expenseChartData}
                    options={expenseChartOptions}
                  />
                ) : (
                  <div style={styles.emptyChart}>
                    No expense records for {incomeYear}.
                  </div>
                )}
              </div>
            </div>

            <div style={styles.dashboardCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Patient Feedback</h3>
                  <p style={styles.cardSubtitle}>
                    Latest patient feedback and ratings.
                  </p>
                </div>

                <Link to="/adminReport" style={styles.cardLink}>
                  View Reports
                </Link>
              </div>

              <div style={styles.activityList}>
                {latestFeedback.length > 0 ? (
                  latestFeedback.map((item) => (
                    <div key={item.id} style={styles.activityItem}>
                      <span
                        style={{
                          ...styles.dot,
                          ...getFeedbackDotStyle(item.rating),
                        }}
                      ></span>

                      <div>
                        <p style={styles.activityText}>
                          {item.patientName} rated {item.rating} star
                          {Number(item.rating) === 1 ? '' : 's'}
                        </p>
                        <small style={styles.activitySmall}>
                          {item.feedback}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyChart}>
                    No patient feedback records yet.
                  </div>
                )}
              </div>
            </div>

            <div style={styles.dashboardCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Patient Satisfaction</h3>
                  <p style={styles.cardSubtitle}>Average clinic rating.</p>
                </div>
              </div>

              <div style={styles.ratingBox}>
                <h2 style={styles.ratingValue}>
                  {Number(patientSatisfaction.averageRating || 0).toFixed(1)}
                </h2>
                <p style={styles.ratingLabel}>Average Rating</p>
                <small style={styles.activitySmall}>
                  {Number(patientSatisfaction.totalFeedback || 0)} feedback record
                  {Number(patientSatisfaction.totalFeedback || 0) === 1 ? '' : 's'}
                </small>
              </div>

              <div style={styles.ratingBars}>
                <RatingRow styles={styles} number="5" width={getRatingPercent(0)} />
                <RatingRow styles={styles} number="4" width={getRatingPercent(1)} />
                <RatingRow styles={styles} number="3" width={getRatingPercent(2)} />
                <RatingRow styles={styles} number="2" width={getRatingPercent(3)} />
                <RatingRow styles={styles} number="1" width={getRatingPercent(4)} />
              </div>
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
    </div>
  );
}

function RatingRow({ styles, number, width }) {
  return (
    <div style={styles.ratingRow}>
      <span style={styles.ratingNumber}>{number}</span>

      <div style={styles.bar}>
        <div style={{ ...styles.fill, width }}></div>
      </div>
    </div>
  );
}
