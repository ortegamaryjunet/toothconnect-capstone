import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';

import createDentistDashboardStyles from '../styles/DentistDashboard';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import NotificationUnreadBadge from '../components/NotificationUnreadBadge';

import clinicLogo from '../assets/dentistImages/clinic-logo.png';
import patientsIcon from '../assets/dentistImages/patients.png';
import appointmentIcon from '../assets/dentistImages/appt.png';
import newPatientsIcon from '../assets/dentistImages/new.png';
import returningPatientsIcon from '../assets/dentistImages/returning.png';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DentistDashboard() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [serviceNames, setServiceNames] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createDentistDashboardStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });


  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    newPatients: 0,
    returningPatients: 0,
    childCount: 0,
    teenCount: 0,
    adultCount: 0,
    olderCount: 0,
    averageRating: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);

  const today = new Date();
  const firstDashboardYear = 2026;
  const currentYear = today.getFullYear();

  const [visitMonth, setVisitMonth] = useState(today.getMonth());
  const [visitYear, setVisitYear] = useState(currentYear);
  const [patientVisits, setPatientVisits] = useState({ newPatients: [], returningPatients: [] });

  useEffect(() => {
    api.get('/auth/staff-profile/me')
      .then(res => setServiceNames(res.data.profile?.serviceNames || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/dentist-dashboard')
      .then(res => {
        const d = res.data;
        setDashboardStats({
          totalPatients: d.totalPatients,
          totalAppointments: d.totalAppointments,
          newPatients: d.newPatients,
          returningPatients: d.returningPatients,
          childCount: d.childCount,
          teenCount: d.teenCount,
          adultCount: d.adultCount,
          olderCount: d.olderCount,
          averageRating: d.averageRating,
          rating5: d.rating5,
          rating4: d.rating4,
          rating3: d.rating3,
          rating2: d.rating2,
          rating1: d.rating1,
        });
        setUpcomingAppointments(d.upcomingAppointments || []);
        setFeedbackList(d.feedbackList || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/dentist-dashboard/patient-visits', {
      params: { month: Number(visitMonth) + 1, year: Number(visitYear) },
    })
      .then(res => {
        if (!cancelled) setPatientVisits(res.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [visitMonth, visitYear]);

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

  const patientOverviewData = useMemo(() => {
    return {
      labels: ['Child', 'Teen', 'Adult', 'Older'],
      datasets: [
        {
          data: [
            dashboardStats.childCount || 0,
            dashboardStats.teenCount || 0,
            dashboardStats.adultCount || 0,
            dashboardStats.olderCount || 0,
          ],
          backgroundColor: ['#facc15', '#38bdf8', '#22c55e', '#a78bfa'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [
    dashboardStats.childCount,
    dashboardStats.teenCount,
    dashboardStats.adultCount,
    dashboardStats.olderCount,
  ]);

  const dashboardYears = useMemo(() => {
    const lastYear = Math.max(firstDashboardYear, currentYear + 4);
    return Array.from(
      { length: lastYear - firstDashboardYear + 1 },
      (_, i) => firstDashboardYear + i
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

  const visitLabels = useMemo(
    () => getWeekLabels(Number(visitMonth), Number(visitYear)),
    [visitMonth, visitYear]
  );

  const visitChartData = useMemo(() => ({
    labels: visitLabels,
    datasets: [
      {
        label: 'New Patients',
        data: visitLabels.map((_, i) => Number(patientVisits.newPatients?.[i] || 0)),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
      {
        label: 'Returning Patients',
        data: visitLabels.map((_, i) => Number(patientVisits.returningPatients?.[i] || 0)),
        backgroundColor: '#93c5fd',
        borderRadius: 6,
      },
    ],
  }), [patientVisits, visitLabels]);

  const visitChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const patientOverviewOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (sum, item) => sum + item,
              0
            );
            const percent =
              total === 0 ? 0 : ((value / total) * 100).toFixed(1);

            return `${context.label}: ${value} patients (${percent}%)`;
          },
        },
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

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          <Link
            to="/dentist"
            style={{ ...styles.menuItem, ...styles.menuItemActive }}
          >
            <i className="fi fi-rr-chart-histogram" style={styles.menuItemIcon}></i>
            <span style={styles.menuItemText}>Dashboard</span>
          </Link>

          <Link to="/dentistAppointment" style={styles.menuItem}>
            <i
              className="fi fi-rr-calendar-clock"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Appointment</span>
          </Link>

          <Link to="/dentistRecords" style={styles.menuItem}>
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
            <div style={styles.doctorProfile}>
              <div style={styles.avatar}>
                <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
              </div>

              <div style={styles.doctorInfo}>
                <div style={styles.doctorName}>{user?.name || 'Dentist'}</div>
                <div style={styles.doctorSpecialization}>{serviceNames || 'Dentist'}</div>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroCard}>
            <div>
              <span style={styles.heroBadge}>Dashboard Overview</span>

              <h2 style={styles.heroTitle}>
                Review your patients, appointments, and clinic updates
              </h2>

              <p style={styles.heroText}>
                Track your daily schedule, patient records, feedback, and
                ratings.
              </p>
            </div>

            <div style={styles.heroIcon}>
              <i className="fi fi-rr-chart-histogram" style={styles.heroIconText}></i>
            </div>
          </section>

          <section style={styles.statsGrid}>
            <StatCard
              styles={styles}
              icon={patientsIcon}
              iconAlt="Patients"
              iconStyle={styles.statIconBlue}
              label="Total Patients"
              value={dashboardStats.totalPatients}
            />

            <StatCard
              styles={styles}
              icon={appointmentIcon}
              iconAlt="Appointments"
              iconStyle={styles.statIconPurple}
              label="Total Appointments"
              value={dashboardStats.totalAppointments}
            />

            <StatCard
              styles={styles}
              icon={newPatientsIcon}
              iconAlt="New Patients"
              iconStyle={styles.statIconGreen}
              label="New Patients"
              value={dashboardStats.newPatients}
            />

            <StatCard
              styles={styles}
              icon={returningPatientsIcon}
              iconAlt="Returning Patients"
              iconStyle={styles.statIconOrange}
              label="Returning Patients"
              value={dashboardStats.returningPatients}
            />
          </section>

          <section style={styles.dashboardGrid}>
            <div style={{ ...styles.panel, ...styles.chartPanel }}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Patient Visit Overview</h3>
                  <p style={styles.panelSubtitle}>Weekly visits by your patients</p>
                </div>

                <div style={styles.dateFilter}>
                  <select
                    value={visitMonth}
                    onChange={(e) => setVisitMonth(Number(e.target.value))}
                    style={styles.select}
                  >
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>

                  <select
                    value={visitYear}
                    onChange={(e) => setVisitYear(Number(e.target.value))}
                    style={styles.select}
                  >
                    {dashboardYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.visitChartBox}>
                <Bar data={visitChartData} options={visitChartOptions} />
              </div>
            </div>

            <div style={{ ...styles.panel, ...styles.schedulePanel }}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Overview of Upcoming Appointments</h3>
                  <p style={styles.panelSubtitle}>Review your appointment schedules.</p>
                </div>

                <Link to="/dentistAppointment" style={styles.panelLink}>
                  View All
                </Link>
              </div>

              <div style={styles.appointmentList}>
                {upcomingAppointments.length === 0 ? (
                  <div style={styles.emptyBox}>No appointments found.</div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} style={styles.appointmentItem}>
                      <div style={styles.time}>{appointment.time}</div>

                      <div>
                        <h4 style={styles.appointmentTitle}>
                          {appointment.patientName}
                        </h4>
                        <p style={styles.appointmentText}>
                          {appointment.service}
                        </p>
                      </div>

                      <span
                        style={{
                          ...styles.status,
                          ...getAppointmentStatusStyle(
                            styles,
                            appointment.status
                          ),
                        }}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...styles.panel, ...styles.feedbackPanel }}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Patient Feedback</h3>
                  <p style={styles.panelSubtitle}>Recent comments</p>
                </div>
              </div>

              <div style={styles.feedbackList}>
                {feedbackList.length === 0 ? (
                  <div style={styles.emptyBox}>No feedback found.</div>
                ) : (
                  feedbackList.map((feedback) => (
                    <div key={feedback.id} style={styles.feedbackItem}>
                      <p style={styles.feedbackText}>{feedback.message}</p>
                      <span style={styles.feedbackMeta}>
                        {feedback.patientName} • {feedback.date}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...styles.panel, ...styles.ratingPanel }}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Satisfaction Rating</h3>
                  <p style={styles.panelSubtitle}>Average patient rating</p>
                </div>
              </div>

              <div style={styles.ratingScore}>
                <h2 style={styles.ratingValue}>
                  {Number(dashboardStats.averageRating || 0).toFixed(1)}
                </h2>
                <p style={styles.ratingLabel}>Average Rating</p>
              </div>

              <div style={styles.ratingBars}>
                <RatingRow
                  styles={styles}
                  number="5"
                  width={`${dashboardStats.rating5 || 0}%`}
                />

                <RatingRow
                  styles={styles}
                  number="4"
                  width={`${dashboardStats.rating4 || 0}%`}
                />

                <RatingRow
                  styles={styles}
                  number="3"
                  width={`${dashboardStats.rating3 || 0}%`}
                />

                <RatingRow
                  styles={styles}
                  number="2"
                  width={`${dashboardStats.rating2 || 0}%`}
                />

                <RatingRow
                  styles={styles}
                  number="1"
                  width={`${dashboardStats.rating1 || 0}%`}
                />
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

function StatCard({ styles, icon, iconAlt, iconStyle, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, ...iconStyle }}>
        <img src={icon} alt={iconAlt} style={styles.statIconImg} />
      </div>

      <div>
        <p style={styles.statLabel}>{label}</p>
        <h3 style={styles.statValue}>{value}</h3>
      </div>
    </div>
  );
}

function LegendItem({ styles, dotStyle, children }) {
  return (
    <div style={styles.legendItem}>
      <span style={{ ...styles.dot, ...dotStyle }}></span>
      {children}
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

function getAppointmentStatusStyle(styles, status) {
  const statusValue = String(status || '').toLowerCase();

  if (statusValue === 'pending') {
    return styles.statusPending;
  }

  if (statusValue === 'confirmed') {
    return styles.statusConfirmed;
  }

  if (statusValue === 'completed') {
    return styles.statusCompleted;
  }

  return styles.statusPending;
}