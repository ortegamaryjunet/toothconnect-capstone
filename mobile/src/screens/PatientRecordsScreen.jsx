import { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listAppointments } from '../api/appointments';
import { getUnreadCount } from '../api/notifications';
import { formatDateTime } from '../utils/datetime';
import AppSidebar from '../components/AppSidebar';
import s from '../styles/PatientRecordsScreen';

// ── FDI arch layout
const UPPER_Q1 = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_Q2 = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_Q4 = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_Q3 = [31, 32, 33, 34, 35, 36, 37, 38];

// ── Helpers 
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

function getTotalAmount(appt) {
  return Number(
    appt.total_amount ??
    appt.totalAmount ??
    appt.service_price ??
    appt.price ??
    0
  );
}

function getPaidAmount(appt) {
  return Number(
    appt.paid_amount ??
    appt.paidAmount ??
    appt.amount_paid ??
    appt.amountPaid ??
    appt.payment_amount ??
    0
  );
}

function getOutstandingBalance(appt) {
  const totalAmount = getTotalAmount(appt);
  const paidAmount = getPaidAmount(appt);

  return Math.max(totalAmount - paidAmount, 0);
}

function isPaymentAcknowledged(appt) {
  return (
    appt.payment_status === 'verified' ||
    appt.payment_status === 'acknowledged'
  );
}

function isPaymentRejected(appt) {
  return appt.payment_status === 'rejected';
}

function hasPaymentRecord(appt) {
  return (
    appt.payment_id != null ||
    appt.payment_amount != null ||
    appt.paid_amount != null ||
    appt.paidAmount != null ||
    appt.amount_paid != null ||
    appt.amountPaid != null ||
    appt.receipt_url != null
  );
}

function getTxStatus(appt) {
  if (isPaymentAcknowledged(appt)) return 'verified';

  if (isPaymentRejected(appt)) return 'rejected';

  if (appt.receipt_url) return 'pending_validation';

  if (hasPaymentRecord(appt)) return 'pending_validation';

  return 'recorded';
}

function toothColor(status) {
  if (status === 'planned') {
    return {
      bg: '#bfdbfe',
      border: '#3b82f6',
    };
  }

  if (status === 'in_progress') {
    return {
      bg: '#fef9c3',
      border: '#ca8a04',
    };
  }

  if (status === 'completed') {
    return {
      bg: '#dcfce7',
      border: '#16a34a',
    };
  }

  return {
    bg: '#f8fafc',
    border: '#cbd5e0',
  };
}

// ── Sub-components 
function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <View style={s.sectionCard}>
      <TouchableOpacity
        style={s.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={s.sectionChevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen ? (
        <View style={s.sectionBody}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: {
      bg: '#dcfce7',
      color: '#15803d',
      label: 'Completed',
    },
    no_show: {
      bg: '#fef3c7',
      color: '#d97706',
      label: 'No show',
    },
    planned: {
      bg: '#dbeafe',
      color: '#2563eb',
      label: 'Planned',
    },
    in_progress: {
      bg: '#fef9c3',
      color: '#a16207',
      label: 'In progress',
    },
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

function PaymentBadge({ status }) {
  const map = {
    verified: {
      bg: '#dcfce7',
      color: '#15803d',
      label: 'Acknowledged',
    },
    rejected: {
      bg: '#fee2e2',
      color: '#dc2626',
      label: 'Rejected',
    },
    pending_validation: {
      bg: '#fef9c3',
      color: '#a16207',
      label: 'Pending acknowledgement',
    },
    recorded: {
      bg: '#dbeafe',
      color: '#2563eb',
      label: 'Recorded',
    },
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

// ── Appointment History 
function HistoryItem({ appt, isLast }) {
  return (
    <View style={[s.historyItem, isLast && s.historyItemLast]}>
      <Text style={s.historyDate}>
        {formatDateTime(appt.start_time)}
      </Text>

      <Text style={s.historyService}>
        {appt.service_name}
      </Text>

      <Text style={s.historyMeta}>
        {appt.dentist_name} · {appt.branch_name}
      </Text>

      <StatusBadge status={appt.status} />
    </View>
  );
}

// ── Billing History 
function BillingItem({ appt, isLast }) {
  const amount = Number(
    appt.payment_amount ??
    appt.paid_amount ??
    appt.paidAmount ??
    appt.amount_paid ??
    appt.amountPaid ??
    appt.service_price ??
    appt.price ??
    0
  );

  const method = formatMethod(appt.payment_method);
  const txStatus = getTxStatus(appt);

  return (
    <View style={[s.txItem, isLast && s.txItemLast]}>
      <View style={s.txTopRow}>
        <Text style={s.txDate}>
          {formatDateTime(appt.start_time)}
        </Text>

        <Text style={s.txAmount}>
          {formatPeso(amount)}
        </Text>
      </View>

      <Text style={s.txService}>
        {appt.service_name}
      </Text>

      {appt.reference_number ? (
        <Text style={s.txMethod}>
          Reference: {appt.reference_number}
        </Text>
      ) : null}

      {method ? (
        <Text style={s.txMethod}>
          {method}
        </Text>
      ) : null}

      <View style={s.txMethodRow}>
        <Text style={s.txMethod}>
          Payment status
        </Text>

        <PaymentBadge status={txStatus} />
      </View>
    </View>
  );
}

// ── Transaction History 
function OutstandingItem({ appt, isLast }) {
  const totalAmount = getTotalAmount(appt);
  const paidAmount = getPaidAmount(appt);
  const outstandingBalance = getOutstandingBalance(appt);
  const txStatus = getTxStatus(appt);

  return (
    <View style={[s.txItem, isLast && s.txItemLast]}>
      <View style={s.txTopRow}>
        <Text style={s.txDate}>
          {formatDateTime(appt.start_time)}
        </Text>

        <Text style={s.txAmount}>
          {formatPeso(outstandingBalance)}
        </Text>
      </View>

      <Text style={s.txService}>
        {appt.service_name}
      </Text>

      <Text style={s.txMethod}>
        Total bill: {formatPeso(totalAmount)}
      </Text>

      <Text style={s.txMethod}>
        Amount paid: {formatPeso(paidAmount)}
      </Text>

      <View style={s.txMethodRow}>
        <Text style={s.txMethod}>
          Outstanding balance
        </Text>

        <View
          style={[
            s.badge,
            {
              backgroundColor:
                txStatus === 'pending_validation'
                  ? '#fef9c3'
                  : txStatus === 'rejected'
                    ? '#fee2e2'
                    : '#fee2e2',
            },
          ]}
        >
          <Text
            style={[
              s.badgeText,
              {
                color:
                  txStatus === 'pending_validation'
                    ? '#a16207'
                    : txStatus === 'rejected'
                      ? '#dc2626'
                      : '#dc2626',
              },
            ]}
          >
            {txStatus === 'pending_validation'
              ? 'Pending acknowledgement'
              : txStatus === 'rejected'
                ? 'Payment rejected'
                : 'Unpaid'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Dental Chart 
function ToothBox({ tooth, plan, onPress }) {
  const { bg, border } = toothColor(
    plan ? plan.status : null
  );

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

      <Text style={s.legendText}>
        {label}
      </Text>
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

            {UPPER_Q1.map((t) => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}

            <View style={s.midline} />

            {UPPER_Q2.map((t) => (
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

            {LOWER_Q4.map((t) => (
              <ToothBox
                key={t}
                tooth={t}
                plan={planMap[t]}
                onPress={onToothPress}
              />
            ))}

            <View style={s.midline} />

            {LOWER_Q3.map((t) => (
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

// ── Main Screen 
export default function PatientRecordsScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const [expanded, setExpanded] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();

      getUnreadCount()
        .then(setUnreadCount)
        .catch(() => {});
    }, [])
  );

  async function fetchAppointments() {
    setLoading(true);

    try {
      const data = await listAppointments();

      const past = (data || [])
        .filter((a) => a.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.start_time) -
            new Date(a.start_time)
        );

      setAppointments(past);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(key) {
    const next =
      expanded === key
        ? null
        : key;

    setExpanded(next);
  }

  // ── Billing History
  // Completed appointments with an acknowledged/verified payment.
  //
  // Example:
  // Total bill = ₱45,000
  // Payment = ₱45,000
  // payment_status = verified
  //
  // Result:
  // Billing History       → YES
  // Transaction History   → NO
  const billingHistory = appointments.filter(
    (a) =>
      a.status === 'completed' &&
      isPaymentAcknowledged(a) &&
      hasPaymentRecord(a)
  );

  // ── Transaction History 
  // Completed appointments that are NOT yet acknowledged.
  //
  // This includes:
  // - unpaid records
  // - partially paid records
  // - payments waiting for acknowledgement
  // - rejected payments
  //
  // IMPORTANT:
  // Once payment_status becomes "verified" or "acknowledged",
  // the record is automatically removed from this list.
  const transactionHistory = appointments.filter(
    (a) => {
      if (a.status !== 'completed') {
        return false;
      }

      if (isPaymentAcknowledged(a)) {
        return false;
      }

      const outstandingBalance = getOutstandingBalance(a);
      const paymentExists = hasPaymentRecord(a);

      return (
        outstandingBalance > 0 ||
        paymentExists
      );
    }
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.mainWrapper}>
        <View style={s.dashboardArea}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity
              style={s.menuButton}
              onPress={() =>
                sidebarRef.current?.open()
              }
            >
              <Text style={s.menuButtonText}>
                ☰
              </Text>
            </TouchableOpacity>

            <Text style={s.headerTitle}>
              Records
            </Text>

            <TouchableOpacity
              style={s.notificationButton}
              onPress={() =>
                navigation.navigate('Notifications')
              }
            >
              <View
                style={{
                  position: 'relative',
                }}
              >
                <Image
                  source={require('../../assets/images/notification-bell.png')}
                  style={s.headerIcon}
                  resizeMode="contain"
                />

                {unreadCount > 0 && (
                  <View style={s.notifBadge}>
                    <Text style={s.notifBadgeText}>
                      {unreadCount > 9
                        ? '9+'
                        : unreadCount}
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

            {/* Appointment Records */}
            <SectionCard
              title="Appointment Records"
              isOpen={expanded === 'history'}
              onToggle={() =>
                toggleSection('history')
              }
            >
              {loading ? (
                <Text style={s.loadingText}>
                  Loading...
                </Text>
              ) : appointments.length === 0 ? (
                <Text style={s.emptyText}>
                  No appointment history yet.
                </Text>
              ) : (
                appointments.map((a, i) => (
                  <HistoryItem
                    key={a.id}
                    appt={a}
                    isLast={
                      i === appointments.length - 1
                    }
                  />
                ))
              )}
            </SectionCard>

            {/* Billing History Records */}
            <SectionCard
              title="Billing History Records"
              isOpen={expanded === 'billing'}
              onToggle={() =>
                toggleSection('billing')
              }
            >
              {loading ? (
                <Text style={s.loadingText}>
                  Loading...
                </Text>
              ) : billingHistory.length === 0 ? (
                <Text style={s.emptyText}>
                  No billing records yet.
                </Text>
              ) : (
                billingHistory.map((a, i) => (
                  <BillingItem
                    key={a.id}
                    appt={a}
                    isLast={
                      i === billingHistory.length - 1
                    }
                  />
                ))
              )}
            </SectionCard>

            {/* Transaction History Records */}
            <SectionCard title="Transaction History Records" isOpen={expanded === 'transactions'} onToggle={() => toggleSection('transactions')}>
              {loading ? (
                <Text style={s.loadingText}>
                  Loading...
                </Text>
              ) : transactionHistory.length === 0 ? (
                <Text style={s.emptyText}>
                  No outstanding transaction records.
                </Text>
              ) : (
                transactionHistory.map((a, i) => (
                  <OutstandingItem
                    key={a.id}
                    appt={a}
                    isLast={
                      i === transactionHistory.length - 1
                    }
                  />
                ))
              )}
            </SectionCard>

          </ScrollView>
        </View>

        <AppSidebar
          ref={sidebarRef}
          navigation={navigation}
          activeScreen="Records"
        />
      </View>
    </SafeAreaView>
  );
}