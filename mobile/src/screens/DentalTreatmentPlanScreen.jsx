import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { getTreatmentPlansByPatient } from '../api/treatmentPlans';
import { getUnreadCount } from '../api/notifications';
import AppSidebar from '../components/AppSidebar';
import s from '../styles/PatientRecordsScreen';

const UPPER_Q1 = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_Q2 = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_Q4 = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_Q3 = [31, 32, 33, 34, 35, 36, 37, 38];

function formatDateOnly(dateStr) {
  if (!dateStr) return '';

  const value = String(dateStr).trim();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return '';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }

  return date.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function toothColor(status) {
  if (status === 'planned') return { bg: '#bfdbfe', border: '#3b82f6' };
  if (status === 'in_progress') return { bg: '#fef9c3', border: '#ca8a04' };
  if (status === 'completed') return { bg: '#dcfce7', border: '#16a34a' };
  return { bg: '#f8fafc', border: '#cbd5e0' };
}

function StatusBadge({ status }) {
  const map = {
    completed: { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
    cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    canceled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    no_show: { bg: '#fef3c7', color: '#d97706', label: 'No show' },
    planned: { bg: '#dbeafe', color: '#2563eb', label: 'Planned' },
    in_progress: { bg: '#fef9c3', color: '#a16207', label: 'In progress' },
  };

  const style = map[status] || {
    bg: '#f1f5f9',
    color: '#64748b',
    label: status,
  };

  return (
    <View style={[s.badge, { backgroundColor: style.bg }]}>
      <Text style={[s.badgeText, { color: style.color }]}>
        {style.label}
      </Text>
    </View>
  );
}

function ToothBox({ tooth, plan, onPress }) {
  const { bg, border } = toothColor(plan ? plan.status : null);

  return (
    <TouchableOpacity
      style={s.toothWrap}
      onPress={() => onPress(tooth)}
      activeOpacity={0.7}
    >
      <Text style={s.toothNum}>{tooth}</Text>
      <View
        style={[
          s.toothBox,
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      />
    </TouchableOpacity>
  );
}

function LegendItem({ bg, border, label }) {
  return (
    <View style={s.legendItem}>
      <View
        style={[
          s.legendDot,
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}

function DentalChart({ planMap, onToothPress }) {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chartScroll}
      >
        <View style={s.chartInner}>
          <View style={s.arch}>
            <Text style={s.archLabel}>U</Text>

            {UPPER_Q1.map(t => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}

            <View style={s.midline} />

            {UPPER_Q2.map(t => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}
          </View>

          <View style={s.archGap} />

          <View style={s.arch}>
            <Text style={s.archLabel}>L</Text>

            {LOWER_Q4.map(t => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}

            <View style={s.midline} />

            {LOWER_Q3.map(t => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={s.legend}>
        <LegendItem
          bg="#bfdbfe"
          border="#3b82f6"
          label="Planned"
        />
        <LegendItem
          bg="#fef9c3"
          border="#ca8a04"
          label="In progress"
        />
        <LegendItem
          bg="#dcfce7"
          border="#16a34a"
          label="Completed"
        />
      </View>
    </>
  );
}

export default function DentalTreatmentPlanScreen({ navigation }) {
  const { user } = useAuth();
  const sidebarRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [toothModal, setToothModal] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }, [user?.id])
  );

  async function fetchPlans() {
    if (!user?.id) return;

    setLoadingPlans(true);

    try {
      const data = await getTreatmentPlansByPatient(user.id);
      setPlans(data.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  function openToothModal(tooth) {
    setSelectedTooth(tooth);
    setToothModal(true);
  }

  const planMap = {};
  const planListMap = {};

  for (const plan of plans) {
    if (!planMap[plan.tooth_number]) {
      planMap[plan.tooth_number] = plan;
    }

    if (!planListMap[plan.tooth_number]) {
      planListMap[plan.tooth_number] = [];
    }

    planListMap[plan.tooth_number].push(plan);
  }

  const selectedPlans =
    selectedTooth != null
      ? planListMap[selectedTooth] || []
      : [];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.mainWrapper}>
        <View style={s.dashboardArea}>
          <View style={s.header}>
            <TouchableOpacity
              style={s.menuButton}
              onPress={() =>
                sidebarRef.current?.open()
              }
            >
              <Text style={s.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <Text style={s.headerTitle}>
              Dental Treatment Plan
            </Text>

            <TouchableOpacity
              style={s.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={{ position: 'relative' }}>
                <Image
                  source={require('../../assets/images/notification-bell.png')}
                  style={s.headerIcon}
                  resizeMode="contain"
                />

                {unreadCount > 0 && (
                  <View style={s.notifBadge}>
                    <Text style={s.notifBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>
                  Dental Treatment Plan
                </Text>
              </View>

              <View style={s.sectionBody}>
                {loadingPlans ? (
                  <Text style={s.loadingText}>
                    Loading chart...
                  </Text>
                ) : plans.length === 0 ? (
                  <Text style={s.emptyText}>
                    No treatment plan recorded by dentist yet.
                  </Text>
                ) : (
                  <>
                    <DentalChart
                      planMap={planMap}
                      onToothPress={openToothModal}
                    />

                    {toothModal && selectedTooth !== null && (
                      <View style={s.toothDetailCard}>
                        <View style={s.toothDetailHeader}>
                          <Text style={s.toothDetailTitle}>
                            Tooth #{selectedTooth}
                          </Text>

                          <TouchableOpacity
                            style={s.toothDetailClose}
                            onPress={() => setToothModal(false)}
                          >
                            <Text style={s.toothDetailCloseText}>
                              x
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={s.toothDetailBody}>
                          {selectedPlans.length > 0 ? (
                            selectedPlans.map((plan, idx) => (
                              <View key={plan.id}>
                                {idx > 0 && (
                                  <View style={s.planDivider} />
                                )}

                                {selectedPlans.length > 1 && (
                                  <Text style={s.planIndexLabel}>
                                    Plan {idx + 1} of {selectedPlans.length}
                                  </Text>
                                )}

                                <View style={s.modalRow}>
                                  <Text style={s.modalLabel}>
                                    Treatment
                                  </Text>

                                  <Text style={s.modalValue}>
                                    {plan.planned_treatment || '-'}
                                  </Text>
                                </View>

                                <View style={s.modalRow}>
                                  <Text style={s.modalLabel}>
                                    Status
                                  </Text>

                                  <StatusBadge status={plan.status} />
                                </View>

                                <View style={s.modalRow}>
                                  <Text style={s.modalLabel}>
                                    Dentist
                                  </Text>

                                  <Text style={s.modalValue}>
                                    {plan.dentist_name || '-'}
                                  </Text>
                                </View>

                                {plan.notes ? (
                                  <View style={s.modalRow}>
                                    <Text style={s.modalLabel}>
                                      Notes
                                    </Text>

                                    <Text style={s.modalValue}>
                                      {plan.notes}
                                    </Text>
                                  </View>
                                ) : null}

                                <View style={s.modalRow}>
                                  <Text style={s.modalLabel}>
                                    Completed
                                  </Text>

                                  <Text style={s.modalValue}>
                                    {formatDateOnly(plan.date_completed) || '-'}
                                  </Text>
                                </View>

                                <View style={[s.modalRow, s.modalRowLast]}>
                                  <Text style={s.modalLabel}>
                                    Date added
                                  </Text>

                                  <Text style={s.modalValue}>
                                    {formatDateOnly(
                                      plan.created_at?.slice(0, 10)
                                    ) || '-'}
                                  </Text>
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={s.modalEmpty}>
                              No treatment plan has been set{'\n'}
                              for this tooth by your dentist.
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        <AppSidebar
          ref={sidebarRef}
          navigation={navigation}
          activeScreen="TreatmentPlan"
        />
      </View>
    </SafeAreaView>
  );
}