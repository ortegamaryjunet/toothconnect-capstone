import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  listEquipment,
  listMedicines,
  listSupplies,
} from '../api/inventory';
import { fetchRecepDashboard } from '../api/recepDashboard';
import LazyChart from '../components/LazyChart';
import MessageUnreadBadge from '../components/MessageUnreadBadge';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';
import StaffHeaderAvatar from '../components/StaffHeaderAvatar';
import { useAuth } from '../auth/AuthContext';
import createRecepDashboardStyles from '../styles/RecepDashboard';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

export default function RecepDashboard() {
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileMenuRef = useRef(null);

  const [stockSummary, setStockSummary] = useState({
    totalProduct: 0,
    inStock: 0,
    lowStock: 0,
    outStock: 0,
  });

  const today = new Date();
  const firstDashboardYear = 2026;
  const currentYear = today.getFullYear();

  const [visitMonth, setVisitMonth] = useState(today.getMonth());
  const [visitYear, setVisitYear] = useState(currentYear);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isStackedHero = screenWidth <= 1000;

  const styles = createRecepDashboardStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isStackedHero,
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    rescheduledAppointments: 0,
    pendingAppointments: 0,
    activeDentists: 0,
    cancelledAppointments: 0,
  });

  const [patientVisits, setPatientVisits] = useState({
    newPatients: [],
    returningPatients: [],
  });

  const scopedBranchId =
    Number(user?.home_branch_id || user?.branches?.[0] || 0) || undefined;

  const totalStock =
    stockSummary.inStock + stockSummary.lowStock + stockSummary.outStock;

  const inStockPercent =
    totalStock > 0 ? (stockSummary.inStock / totalStock) * 100 : 0;

  const lowStockPercent =
    totalStock > 0 ? (stockSummary.lowStock / totalStock) * 100 : 0;

  const outStockPercent =
    totalStock > 0 ? (stockSummary.outStock / totalStock) * 100 : 0;

  const receptionistName = user?.name || user?.email || 'Receptionist';

  const dashboardYears = useMemo(() => {
    const lastYear = Math.max(firstDashboardYear, currentYear + 4);

    return Array.from(
      { length: lastYear - firstDashboardYear + 1 },
      (_, index) => firstDashboardYear + index
    );
  }, [currentYear]);

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
            Number(patientVisits.newPatients?.[index] || 0)
          ),
          backgroundColor: '#2563eb',
          borderRadius: 6,
        },
        {
          label: 'Returning Patients',
          data: visitLabels.map((_, index) =>
            Number(patientVisits.returningPatients?.[index] || 0)
          ),
          backgroundColor: '#93c5fd',
          borderRadius: 6,
        },
      ],
    };
  }, [patientVisits, visitLabels]);

  const visitChartOptions = {
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
    let cancelled = false;

    async function loadStockSummary() {
      try {
        const [medicines, equipment, supplies] = await Promise.all([
          listMedicines(scopedBranchId),
          listEquipment(scopedBranchId),
          listSupplies(scopedBranchId),
        ]);

        if (!cancelled) {
          setStockSummary(
            summarizeStockAvailability([
              ...(Array.isArray(medicines) ? medicines : []),
              ...(Array.isArray(equipment) ? equipment : []),
              ...(Array.isArray(supplies) ? supplies : []),
            ])
          );
        }
      } catch {
        if (!cancelled) {
          setStockSummary({
            totalProduct: 0,
            inStock: 0,
            lowStock: 0,
            outStock: 0,
          });
        }
      }
    }

    loadStockSummary();

    return () => {
      cancelled = true;
    };
  }, [scopedBranchId]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!user) return;

      try {
        const data = await fetchRecepDashboard({
          visitMonth: Number(visitMonth) + 1,
          visitYear: Number(visitYear),
        });

        if (!cancelled) {
          setDashboardStats(data.stats);
          setPatientVisits(data.patientVisits);
        }
      } catch {
        // keep zeros on error
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user, visitMonth, visitYear]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeProfileMenu();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function openLogoutModal() {
    setShowLogoutModal(true);
    setShowProfileMenu(false);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function toggleProfileMenu() {
    setShowProfileMenu((prev) => !prev);
  }

  function closeProfileMenu() {
    setShowProfileMenu(false);
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link
            to="/receptionist"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
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

          <Link to="/receptionistReceipts" style={styles.menuItem}>
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
                onClick={toggleProfileMenu}
              >
                <StaffHeaderAvatar styles={styles} />

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
                    onClick={closeProfileMenu}
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.dashboardHero}>
            <div>
              <span style={styles.heroBadge}>Dashboard</span>

              <h2 style={styles.heroTitle}>
                Monitor appointments, patients, dentists, and clinic operations.
              </h2>

              <p style={styles.heroText}>
                View daily clinic activity, patient records, appointment status,
                and inventory.
              </p>
            </div>

            {!isMobile && (
              <div style={styles.heroIcon}>
                <i
                  className="fi fi-rr-chart-histogram"
                  style={styles.heroIconText}
                ></i>
              </div>
            )}
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              styles={styles}
              icon="fi fi-rr-users"
              colorStyle={styles.summaryIconBlue}
              label="Total Patients"
              value={dashboardStats.totalPatients}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-calendar-check"
              colorStyle={styles.summaryIconGreen}
              label="Total Appointments"
              value={dashboardStats.totalAppointments}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-calendar-lines-pen"
              colorStyle={styles.summaryIconPurple}
              label="Rescheduled Appointments"
              value={dashboardStats.rescheduledAppointments}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-time-quarter-past"
              colorStyle={styles.summaryIconOrange}
              label="Pending Appointments"
              value={dashboardStats.pendingAppointments}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-doctor"
              colorStyle={styles.summaryIconBlue}
              label="Active Dentists"
              value={dashboardStats.activeDentists}
            />

            <SummaryCard
              styles={styles}
              icon="fi fi-rr-calendar-xmark"
              colorStyle={styles.summaryIconOrange}
              label="Cancelled Appointments"
              value={dashboardStats.cancelledAppointments}
            />
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
                <LazyChart data={visitChartData} options={visitChartOptions} />
              </div>
            </div>

            <div style={{ ...styles.dashboardCard, ...styles.stockCard }}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Stock Availability</h3>
                  <p style={styles.cardSubtitle}>
                    Branch inventory stock summary.
                  </p>
                </div>

                <Link to="/receptionistInventory" style={styles.viewAllLink}>
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
    </div>
  );
}

function SummaryCard({ styles, icon, colorStyle, label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, ...colorStyle }}>
        <i className={icon} style={styles.summaryIconText}></i>
      </div>

      <div>
        <p style={styles.summaryLabel}>{label}</p>
        <h2 style={styles.summaryValue}>{value}</h2>
      </div>
    </div>
  );
}

function summarizeStockAvailability(rows) {
  return (Array.isArray(rows) ? rows : []).reduce(
    (summary, row) => {
      const quantity = Number(row.quantity || 0);
      const threshold = Number(row.low_stock_threshold || row.threshold || 0);

      summary.totalProduct += 1;

      if (quantity <= 0) {
        summary.outStock += 1;
      } else if (threshold > 0 && quantity <= threshold) {
        summary.lowStock += 1;
      } else {
        summary.inStock += 1;
      }

      return summary;
    },
    {
      totalProduct: 0,
      inStock: 0,
      lowStock: 0,
      outStock: 0,
    }
  );
}
