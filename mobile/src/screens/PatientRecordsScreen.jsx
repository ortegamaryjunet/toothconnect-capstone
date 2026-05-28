import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listAppointments } from '../api/appointments';
import { getUnreadCount } from '../api/notifications';
import { formatDateTime } from '../utils/datetime';
import AppSidebar from '../components/AppSidebar';
import s from '../styles/PatientRecordsScreen';

// ── FDI arch layout (dentist-view: patient's right on the left) ──────────────
const UPPER_Q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // upper-right quadrant, near→far
const UPPER_Q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // upper-left quadrant, near→far
const LOWER_Q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // lower-right quadrant, near→far
const LOWER_Q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // lower-left quadrant, near→far

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPeso(value) {
  const n = Number(value || 0);
  return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatMethod(method) {
  if (method === 'ewallet') return 'E-wallet';
  if (method === 'bank_transfer') return 'Bank transfer';
  if (method === 'cash') return 'Cash';
  return method || '';
}

function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getTxStatus(appt) {
  if (appt.payment_status === 'verified') return 'verified';
  if (appt.payment_status === 'rejected') return 'rejected';
  if (appt.receipt_url) return 'pending_validation';
  return 'recorded';
}

function toothColor(status) {
  if (status === 'planned')     return { bg: '#bfdbfe', border: '#3b82f6' };
  if (status === 'in_progress') return { bg: '#fef9c3', border: '#ca8a04' };
  if (status === 'completed')   return { bg: '#dcfce7', border: '#16a34a' };
  return { bg: '#f8fafc', border: '#cbd5e0' };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <View style={s.sectionCard}>
      <TouchableOpacity style={s.sectionHeader} onPress={onToggle} activeOpacity={0.75}>
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={s.sectionChevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen ? <View style={s.sectionBody}>{children}</View> : null}
    </View>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed:   { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
    cancelled:   { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    canceled:    { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    no_show:     { bg: '#fef3c7', color: '#d97706', label: 'No show' },
    planned:     { bg: '#dbeafe', color: '#2563eb', label: 'Planned' },
    in_progress: { bg: '#fef9c3', color: '#a16207', label: 'In progress' },
  };
  const style = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <View style={[s.badge, { backgroundColor: style.bg }]}>
      <Text style={[s.badgeText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

function PaymentBadge({ status }) {
  const map = {
    verified:           { bg: '#dcfce7', color: '#15803d', label: 'Verified' },
    rejected:           { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
    pending_validation: { bg: '#fef9c3', color: '#a16207', label: 'Pending acknowledgement' },
    recorded:           { bg: '#dbeafe', color: '#2563eb', label: 'Recorded' },
  };
  const style = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <View style={[s.badge, { backgroundColor: style.bg }]}>
      <Text style={[s.badgeText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

function HistoryItem({ appt, isLast }) {
  return (
    <View style={[s.historyItem, isLast && s.historyItemLast]}>
      <Text style={s.historyDate}>{formatDateTime(appt.start_time)}</Text>
      <Text style={s.historyService}>{appt.service_name}</Text>
      <Text style={s.historyMeta}>{appt.dentist_name} · {appt.branch_name}</Text>
      <StatusBadge status={appt.status} />
    </View>
  );
}

function TxItem({ appt, isLast }) {
  const amount = formatPeso(appt.payment_amount ?? appt.service_price);
  const method = formatMethod(appt.payment_method);
  const txStatus = getTxStatus(appt);
  return (
    <View style={[s.txItem, isLast && s.txItemLast]}>
      <View style={s.txTopRow}>
        <Text style={s.txDate}>{formatDateTime(appt.start_time)}</Text>
        <Text style={s.txAmount}>{amount}</Text>
      </View>
      <Text style={s.txService}>{appt.service_name}</Text>
      <View style={s.txMethodRow}>
        {method ? <Text style={s.txMethod}>{method}</Text> : null}
        <PaymentBadge status={txStatus} />
      </View>
    </View>
  );
}

function ToothBox({ tooth, plan, onPress }) {
  const { bg, border } = toothColor(plan ? plan.status : null);
  return (
    <TouchableOpacity style={s.toothWrap} onPress={() => onPress(tooth)} activeOpacity={0.7}>
      <Text style={s.toothNum}>{tooth}</Text>
      <View style={[s.toothBox, { backgroundColor: bg, borderColor: border }]} />
    </TouchableOpacity>
  );
}

function LegendItem({ bg, border, label }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: bg, borderColor: border }]} />
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
              <ToothBox key={t} tooth={t} plan={planMap[t]} onPress={onToothPress} />
            ))}
            <View style={s.midline} />
            {UPPER_Q2.map(t => (
              <ToothBox key={t} tooth={t} plan={planMap[t]} onPress={onToothPress} />
            ))}
          </View>
          <View style={s.archGap} />
          <View style={s.arch}>
            <Text style={s.archLabel}>L</Text>
            {LOWER_Q4.map(t => (
              <ToothBox key={t} tooth={t} plan={planMap[t]} onPress={onToothPress} />
            ))}
            <View style={s.midline} />
            {LOWER_Q3.map(t => (
              <ToothBox key={t} tooth={t} plan={planMap[t]} onPress={onToothPress} />
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={s.legend}>
        <LegendItem bg="#bfdbfe" border="#3b82f6" label="Planned" />
        <LegendItem bg="#fef9c3" border="#ca8a04" label="In progress" />
        <LegendItem bg="#dcfce7" border="#16a34a" label="Completed" />
      </View>
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PatientRecordsScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const [expanded, setExpanded]         = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [unreadCount, setUnreadCount]   = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }, [])
  );

  async function fetchAppointments() {
    setLoading(true);
    try {
      const data = await listAppointments();
      const past = (data || [])
        .filter(a =>
          a.status === 'completed' ||
          a.status === 'cancelled' ||
          a.status === 'canceled'  ||
          a.status === 'no_show'
        )
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      setAppointments(past);
    } catch {
      // silent — patient may have no history yet
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(key) {
    const next = expanded === key ? null : key;
    setExpanded(next);
  }

  const txAppts = appointments.filter(a => a.payment_id != null);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.mainWrapper}>
        <View style={s.dashboardArea}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.menuButton} onPress={() => sidebarRef.current?.open()}>
              <Text style={s.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <Text style={s.headerTitle}>Records</Text>

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
        {/* ── Appointment History ─────────────────────────── */}
        <SectionCard
          title="Appointment History"
          isOpen={expanded === 'history'}
          onToggle={() => toggleSection('history')}
        >
          {loading ? (
            <Text style={s.loadingText}>Loading...</Text>
          ) : appointments.length === 0 ? (
            <Text style={s.emptyText}>No appointment history yet.</Text>
          ) : (
            appointments.map((a, i) => (
              <HistoryItem key={a.id} appt={a} isLast={i === appointments.length - 1} />
            ))
          )}
        </SectionCard>

        {/* ── Transactions & Receipts ─────────────────────── */}
        <SectionCard
          title="Transactions & Receipts"
          isOpen={expanded === 'transactions'}
          onToggle={() => toggleSection('transactions')}
        >
          {loading ? (
            <Text style={s.loadingText}>Loading...</Text>
          ) : txAppts.length === 0 ? (
            <Text style={s.emptyText}>No payment records yet.</Text>
          ) : (
            txAppts.map((a, i) => (
              <TxItem key={a.id} appt={a} isLast={i === txAppts.length - 1} />
            ))
          )}
        </SectionCard>

          </ScrollView>

        </View>

        <AppSidebar ref={sidebarRef} navigation={navigation} activeScreen="Records" />
      </View>
    </SafeAreaView>
  );
}
