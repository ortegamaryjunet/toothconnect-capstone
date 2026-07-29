import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import AppSidebar from '../components/AppSidebar';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import { getUnreadCount } from "../api/notifications";
import styles from "../styles/DashboardScreen";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getInitials(name) {
  return (
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "Dr"
  );
}

function formatWeekdays(weekdays) {
  if (!weekdays) return "";
  return weekdays
    .split(",")
    .map((d) => DAY_NAMES[parseInt(d, 10)])
    .filter(Boolean)
    .join(", ");
}

function formatApptDate(start_time) {
  const d = new Date(start_time);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatApptTime(start_time) {
  const d = new Date(start_time);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getBranchCity(address, fallback = "Dental Clinic") {
  const addressParts = String(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return addressParts[addressParts.length - 1] || fallback;
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const sidebarRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);

  const [branches, setBranches] = useState([]);
  const [clinicBranchId, setClinicBranchId] = useState(null);

  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [apptLoading, setApptLoading] = useState(true);

  const [dentists, setDentists] = useState([]);
  const [dentistsLoading, setDentistsLoading] = useState(true);

  const [servicesData, setServicesData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBranches() {
      try {
        const res = await api.get("/auth/branches");
        const nextBranches = res.data.branches || [];

        if (!isMounted) return;

        setBranches(nextBranches);

        setClinicBranchId((currentId) => {
          if (
            currentId &&
            nextBranches.some((branch) => String(branch.id) === String(currentId))
          ) {
            return currentId;
          }

          return nextBranches[0]?.id ?? null;
        });
      } catch (err) {
        if (!isMounted) return;
        setBranches([]);
        setClinicBranchId(null);
      }
    }

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUpcomingAppt() {
      setApptLoading(true);

      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await api.get(`/appointments?status=scheduled&from=${today}`);
        const appts = res.data.appointments || [];

        if (isMounted) {
          setUpcomingAppt(appts.length > 0 ? appts[0] : null);
        }
      } catch (err) {
        if (isMounted) setUpcomingAppt(null);
      } finally {
        if (isMounted) setApptLoading(false);
      }
    }

    loadUpcomingAppt();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDentists() {
      setDentistsLoading(true);

      try {
        const res = await api.get("/patients/dentists");

        if (isMounted) {
          setDentists(res.data.dentists || []);
        }
      } catch (err) {
        if (isMounted) setDentists([]);
      } finally {
        if (isMounted) setDentistsLoading(false);
      }
    }

    loadDentists();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      setServicesLoading(true);

      try {
        const res = await api.get("/patients/services");

        if (isMounted) {
          setServicesData(res.data.services || []);
        }
      } catch (err) {
        if (isMounted) setServicesData([]);
      } finally {
        if (isMounted) setServicesLoading(false);
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function fetchUnreadCount() {
        try {
          const count = await getUnreadCount();
          setUnreadCount(count);
        } catch {}
      }

      fetchUnreadCount();
    }, [])
  );

  // Logged-in patient's home branch.
  // This is used for the header badge and sidebar profile branch only.
  const patientBranch = useMemo(() => {
    return (
      branches.find((branch) => String(branch.id) === String(user?.home_branch_id)) ||
      null
    );
  }, [branches, user?.home_branch_id]);

  // Selected branch inside About the Clinic card only.
  const clinicBranch = useMemo(() => {
    return (
      branches.find((branch) => String(branch.id) === String(clinicBranchId)) ||
      branches[0] ||
      null
    );
  }, [branches, clinicBranchId]);

  const clinicBranchInitials = useMemo(() => {
    if (!clinicBranch?.name) return "SE";

    return clinicBranch.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }, [clinicBranch]);

  const displayedDentists = useMemo(() => {
    if (!clinicBranch?.id) return dentists;
    return dentists.filter((dentist) => {
      const branchIds = Array.isArray(dentist.branch_ids)
        ? dentist.branch_ids
        : String(dentist.branch_ids || dentist.home_branch_id || '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
      return branchIds.some((branchId) => String(branchId) === String(clinicBranch.id));
    });
  }, [dentists, clinicBranch?.id]);

  const greetingName = user?.name ? user.name.split(" ")[0] : "there";

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function getBranchTabLabel(branch) {
    return getBranchCity(branch.address, branch.name || "Branch");
  }

  function toggleService(id) {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  }

  const profileBranchText =
    user?.home_branch_city ||
    (patientBranch
      ? getBranchCity(patientBranch.address, patientBranch.name || "Dental Clinic")
      : "Home branch not assigned");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.dashboardArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={() => sidebarRef.current?.open()}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Dashboard</Text>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={require("../../assets/images/notification-bell.png")}
                  style={styles.headerIcon}
                  resizeMode="contain"
                />

                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      backgroundColor: "#e53e3e",
                      borderRadius: 999,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      minWidth: 18,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>{getGreeting()}, {greetingName}</Text>

              <View style={styles.branchBadge}>
                <Text style={styles.branchBadgeLabel}>Home Branch</Text>
                <Text style={styles.branchBadgeText}>
                  {profileBranchText}
                </Text>
              </View>
            </View>

            <View style={styles.appointmentCard}>
              <Text style={styles.cardSmallTitle}>UPCOMING APPOINTMENT</Text>

              {apptLoading ? (
                <Text style={styles.appointmentTitle}>Loading...</Text>
              ) : upcomingAppt ? (
                <>
                  <Text style={styles.appointmentTitle}>
                    {upcomingAppt.service_name}
                  </Text>

                  <View style={styles.appointmentInfoRow}>
                    <Text style={styles.appointmentInfo}>
                      {formatApptDate(upcomingAppt.start_time)}
                    </Text>
                    <Text style={styles.appointmentDot}>•</Text>
                    <Text style={styles.appointmentInfo}>
                      {" "}
                      {formatApptTime(upcomingAppt.start_time)}
                    </Text>
                    <Text style={styles.appointmentDot}>•</Text>
                    <Text style={styles.appointmentInfo}>
                      {upcomingAppt.dentist_name}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.noApptText}>No upcoming appointments</Text>
              )}
            </View>

            <View style={styles.sectionHeaderOnly}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionTitle}>About the Clinic</Text>
            </View>

            <View style={styles.clinicCard}>
              <Text style={styles.clinicCardTitle}>Branches</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.branchTabs}
              >
                {branches.length > 0 ? (
                  branches.map((branch) => {
                    const isActive = String(branch.id) === String(clinicBranch?.id);

                    return (
                      <TouchableOpacity
                        key={branch.id}
                        style={[
                          styles.branchTab,
                          styles.dynamicBranchTab,
                          isActive ? styles.activeBranchTab : null,
                        ]}
                        onPress={() => setClinicBranchId(branch.id)}
                      >
                        <Text
                          style={[
                            styles.branchTabText,
                            isActive ? styles.activeBranchTabText : null,
                          ]}
                        >
                          {getBranchTabLabel(branch)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.branchTab,
                      styles.dynamicBranchTab,
                      styles.activeBranchTab,
                    ]}
                  >
                    <Text
                      style={[styles.branchTabText, styles.activeBranchTabText]}
                    >
                      No branches
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <View style={styles.clinicInfo}>
                <View style={styles.clinicLogoCircle}>
                  <Text style={styles.clinicLogoText}>{clinicBranchInitials}</Text>
                </View>

                <View style={styles.clinicDetails}>
                  <Text style={styles.clinicName}>
                    {clinicBranch?.name || "Smile Empress Dental Hub"}
                  </Text>

                  <Text style={styles.clinicAddress}>
                    {clinicBranch?.address || "Clinic branch details will appear here."}
                  </Text>

                  <Text style={styles.clinicTime}>
                    {clinicBranch?.operating_hours || "Operating hours unavailable"}
                  </Text>
                </View>
              </View>

              <View style={styles.clinicStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {clinicBranch?.dentist_count ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Dentists</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {clinicBranch?.service_count ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Services</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {clinicBranch?.years_active || "-"}
                  </Text>
                  <Text style={styles.statLabel}>Years Active</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeaderOnly}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionTitle}>Our Dentists</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dentistScroll}
            >
              {dentistsLoading ? (
                <View style={styles.dentistCard}>
                  <Text style={styles.dentistName}>Loading...</Text>
                </View>
              ) : displayedDentists.length === 0 ? (
                <View style={styles.dentistCard}>
                  <Text style={styles.dentistName}>No dentists found.</Text>
                </View>
              ) : (
                displayedDentists.map((dentist) => (
                  <View key={dentist.id} style={styles.dentistCard}>
                    <View style={styles.dentistInitialBox}>
                      <Text style={styles.dentistInitial}>
                        {getInitials(dentist.name)}
                      </Text>
                    </View>

                    <Text style={styles.dentistName}>{dentist.name}</Text>

                    <Text style={styles.dentistSpecialty}>
                      {dentist.services || "General Dentistry"}
                    </Text>

                    {dentist.home_branch_id ? (
                      <Text style={styles.dentistBranch}>
                        📍 {getBranchCity(dentist.branch_address, dentist.branch_name || 'Dental Clinic')}
                      </Text>
                    ) : null}

                    {dentist.schedule_weekdays ? (
                      <Text style={styles.dentistSchedule}>
                        ● {formatWeekdays(dentist.schedule_weekdays)}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.sectionHeaderOnly}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionTitle}>Our Services</Text>
            </View>

            <View style={styles.servicesCard}>
              {servicesLoading ? (
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>Loading...</Text>
                </View>
              ) : servicesData.length === 0 ? (
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>No services found.</Text>
                </View>
              ) : (
                servicesData.map((service) => {
                  const isExpanded = expandedServiceId === service.id;

                  if (expandedServiceId !== null && !isExpanded) return null;

                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceItem,
                        isExpanded ? styles.serviceItemExpanded : null,
                      ]}
                      onPress={() => toggleService(service.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.serviceItemHeader}>
                        <Text style={styles.serviceName}>{service.name}</Text>

                        {!isExpanded && (
                          <Text style={styles.serviceTime}>
                            {service.duration_min} mins
                          </Text>
                        )}

                        <Text style={styles.serviceChevron}>
                          {isExpanded ? "▲" : "▼"}
                        </Text>
                      </View>

                      {isExpanded && (
                        <View style={styles.serviceExpandedContent}>
                          <View style={styles.serviceDetailRow}>
                            <Text style={styles.serviceDetailLabel}>
                              Estimated Amount
                            </Text>
                            <Text style={styles.serviceDetailValue}>
                              ₱{Number(service.price || 0).toLocaleString()}
                            </Text>
                          </View>

                          <View style={styles.serviceDetailRow}>
                            <Text style={styles.serviceDetailLabel}>Duration</Text>
                            <Text style={styles.serviceDetailValue}>
                              {service.duration_min} mins
                            </Text>
                          </View>

                          {service.description ? (
                            <View style={styles.serviceDetailRow}>
                              <Text style={styles.serviceDetailLabel}>About</Text>
                              <Text
                                style={[
                                  styles.serviceDetailValue,
                                  styles.serviceDescText,
                                ]}
                              >
                                {service.description}
                              </Text>
                            </View>
                          ) : null}

                          <View style={styles.serviceDetailRow}>
                            <Text style={styles.serviceDetailLabel}>Category</Text>
                            <Text style={styles.serviceDetailValue}>
                              {service.category}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.serviceCollapseBtn}
                            onPress={() => setExpandedServiceId(null)}
                          >
                            <Text style={styles.serviceCollapseBtnText}>
                              Show all services
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>

        <AppSidebar ref={sidebarRef} navigation={navigation} activeScreen="Home" />
      </View>
    </SafeAreaView>
  );
}
