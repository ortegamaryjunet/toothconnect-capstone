import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
  Pressable,
  PanResponder,
  Image,
} from "react-native";
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
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [branches, setBranches] = useState([]);

  // This is only for the About the Clinic card branch tabs.
  const [clinicBranchId, setClinicBranchId] = useState(null);

  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [apptLoading, setApptLoading] = useState(true);

  const [dentists, setDentists] = useState([]);
  const [dentistsLoading, setDentistsLoading] = useState(true);

  const [servicesData, setServicesData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  const screenWidth = Dimensions.get("window").width;
  const sidebarWidth = screenWidth * 0.9;

  const sidebarTranslateX = useRef(new Animated.Value(-sidebarWidth)).current;

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

  const greetingName = user?.name ? user.name.split(" ")[0] : "there";

  function getBranchTabLabel(branch) {
    return getBranchCity(branch.address, branch.name || "Branch");
  }

  function openSidebar() {
    setSidebarOpen(true);
    sidebarTranslateX.setValue(-sidebarWidth);

    Animated.timing(sidebarTranslateX, {
      toValue: 0,
      duration: 230,
      useNativeDriver: true,
    }).start();
  }

  function closeSidebar() {
    Animated.timing(sidebarTranslateX, {
      toValue: -sidebarWidth,
      duration: 230,
      useNativeDriver: true,
    }).start(() => {
      setSidebarOpen(false);
    });
  }

  const sidebarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dx < -10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          sidebarTranslateX.setValue(Math.max(-sidebarWidth, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          closeSidebar();
        } else {
          Animated.timing(sidebarTranslateX, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  function confirmLogout() {
    Alert.alert("Logout?", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          closeSidebar();
          await logout();
        },
      },
    ]);
  }

  function toggleService(id) {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  }

  const userInitials = useMemo(() => {
    if (!user?.name) return "JD";

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }, [user]);

  const profileBranchText =
    user?.home_branch_city ||
    getBranchCity(patientBranch?.address, patientBranch?.name || "Dental Clinic");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.dashboardArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
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
              <Text style={styles.greetingText}>Good morning, {greetingName}</Text>

              <View style={styles.branchBadge}>
                <Text style={styles.branchBadgeText}>
                  {patientBranch?.name || "Smile Empress Dental Hub"}
                  {patientBranch?.address
                    ? "  •  " + getBranchCity(patientBranch.address)
                    : ""}
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
              ) : dentists.length === 0 ? (
                <View style={styles.dentistCard}>
                  <Text style={styles.dentistName}>No dentists found.</Text>
                </View>
              ) : (
                dentists.map((dentist) => (
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

        {sidebarOpen ? (
          <View style={styles.sidebarOverlay}>
            <Pressable style={styles.darkBackdrop} onPress={closeSidebar} />

            <Animated.View
              style={[
                styles.sidebar,
                {
                  width: sidebarWidth,
                  transform: [{ translateX: sidebarTranslateX }],
                },
              ]}
              {...sidebarPanResponder.panHandlers}
            >
              <View style={styles.profileSection}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>

                <View style={styles.profileTextArea}>
                  <Text style={styles.profileName}>{user?.name || "Patient"}</Text>
                  <Text style={styles.profileBranch}>{profileBranchText}</Text>
                </View>
              </View>

              <View style={styles.sidebarLine} />

              <View style={styles.menuList}>
                <TouchableOpacity
                  style={[styles.menuItem, styles.activeMenuItem]}
                  onPress={closeSidebar}
                >
                  <Image
                    source={require("../../assets/images/home.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.menuText, styles.activeMenuText]}>
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate("Profile"), 240);
                  }}
                >
                  <Image
                    source={require("../../assets/images/profile.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate("MessagesList"), 240);
                  }}
                >
                  <Image
                    source={require("../../assets/images/message.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate("Appointments"), 240);
                  }}
                >
                  <Image
                    source={require("../../assets/images/appointment.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Appointments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate("Records"), 240);
                  }}
                >
                  <Image
                    source={require("../../assets/images/records.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate("Notifications"), 240);
                  }}
                >
                  <View style={{ position: 'relative', marginRight: 16 }}>
                    <Image
                      source={require("../../assets/images/notification-bell.png")}
                      style={[styles.sidebarIcon, { marginRight: 0 }]}
                      resizeMode="contain"
                    />
                    {unreadCount > 0 && (
                      <View style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        backgroundColor: '#e53e3e',
                        borderRadius: 999,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        minWidth: 16,
                        alignItems: 'center',
                      }}>
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuText}>Notifications</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.signOutSection}>
                <View style={styles.sidebarLine} />

                <TouchableOpacity style={styles.signOutButton} onPress={confirmLogout}>
                  <Image
                    source={require("../../assets/images/logout.png")}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}