import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  FlatList,
  Animated,
  Alert,
  Dimensions,
  Pressable,
  PanResponder,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { listThreads, listMessageBranches } from '../api/messages';
import { getBranchCity } from '../utils/branch';
import styles from '../styles/MessagesListScreen';

function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MessagesListScreen({ navigation }) {
  const { logout, user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = screenWidth * 0.9;

  const sidebarTranslateX = useRef(new Animated.Value(-sidebarWidth)).current;

  useFocusEffect(
    useCallback(() => {
      fetchMessagesData();
    }, [])
  );

  async function fetchMessagesData() {
    setLoading(true);
    await Promise.all([fetchThreads(), fetchContacts()]);
    setLoading(false);
    setRefreshing(false);
  }

  async function fetchThreads() {
    try {
      const data = await listThreads();
      setThreads(data);
    } catch (err) {
      // silent
    }
  }

  async function fetchContacts() {
    try {
      const list = await listMessageBranches();
      setContacts(list);
    } catch (err) {
      setContacts([]);
    }
  }

  async function openContactPicker() {
    try {
      const list = await listMessageBranches();
      setContacts(list);
      setContactsOpen(true);
    } catch (err) {
      // silent
    }
  }

  function pickContact(c) {
    if (!c.can_message || !c.receptionist_id) return;
    setContactsOpen(false);
    navigation.navigate('MessageThread', {
      otherUserId: c.receptionist_id,
      otherUserName: getBranchTitle(c),
      otherUserRole: 'receptionist',
    });
  }

  function previewTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  function getBranchLocation(item) {
    return getBranchCity({
      name: item?.branch_name,
      address: item?.branch_address,
    });
  }

  function getBranchTitle(item) {
    const branchLocation = getBranchLocation(item);
    return /\bbranch\b/i.test(branchLocation)
      ? branchLocation
      : `${branchLocation} Branch`;
  }

  function getBranchDisplay(item) {
    return getBranchTitle(item);
  }

  function branchInitials(item) {
    const branchLocation = getBranchLocation(item);
    const parts = branchLocation.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
    Alert.alert(
      'Logout?',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            closeSidebar();
            await logout();
          },
        },
      ]
    );
  }

  const visibleThreads = threads.filter(t => {
    const searchText = searchQuery.trim().toLowerCase();
    const branchLocation = getBranchLocation(t).toLowerCase();
    const branchTitle = getBranchTitle(t).toLowerCase();
    const receptionistName = String(t.other_user_name || '').toLowerCase();

    const matchesSearch =
      !searchText ||
      branchLocation.includes(searchText) ||
      branchTitle.includes(searchText) ||
      receptionistName.includes(searchText) ||
      t.last_message_body?.toLowerCase().includes(searchText);

    const matchesFilter = filterMode === 'all' || t.unread_count > 0;

    return matchesSearch && matchesFilter;
  });

  const unreadMessageCount = threads.reduce(
    (total, thread) => total + Number(thread?.unread_count || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.dashboardArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Messages</Text>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Image
                source={require('../../assets/images/notification-bell.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.page}>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.branchCirclesScroll}
              contentContainerStyle={styles.branchCircles}
            >
              {contacts.map(c => {
                const disabled = !c.can_message || !c.receptionist_id;
                return (
                  <TouchableOpacity
                    key={`top-${c.id}`}
                    style={styles.branchItem}
                    onPress={() => pickContact(c)}
                    disabled={disabled}
                  >
                    <View style={[styles.branchCircle, disabled && styles.branchCircleDisabled]}>
                      <Text style={[styles.branchCircleText, disabled && styles.branchCircleTextDisabled]}>
                        {branchInitials(c)}
                      </Text>
                    </View>
                    <Text style={[styles.branchLabel, disabled && styles.branchLabelDisabled]} numberOfLines={1}>
                      {getBranchTitle(c)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor="#9a9a9a"
              />
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterMode === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterMode('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterMode === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterMode === 'unread' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterMode('unread')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterMode === 'unread' && styles.filterButtonTextActive,
                  ]}
                >
                  Unread
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <Text style={styles.loading}>Loading...</Text>
            ) : threads.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  No conversations yet.{'\n'}Start one to talk with the clinic.
                </Text>

                <TouchableOpacity onPress={openContactPicker} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Start a conversation</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.body}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      fetchMessagesData();
                    }}
                  />
                }
              >
                {visibleThreads.length === 0 ? (
                  <Text style={styles.noResults}>No messages found.</Text>
                ) : (
                  visibleThreads.map(t => (
                    <TouchableOpacity
                      key={t.other_user_id}
                      style={styles.threadRow}
                      onPress={() =>
                        navigation.navigate('MessageThread', {
                          otherUserId: t.other_user_id,
                          otherUserName: getBranchTitle(t),
                          otherUserRole: t.other_user_role,
                        })
                      }
                    >
                      <View style={styles.threadInitial}>
                        <Text style={styles.threadInitialText}>{branchInitials(t)}</Text>
                      </View>

                      <View style={styles.threadInfo}>
                        <View style={styles.threadTopRow}>
                          <Text style={styles.threadName} numberOfLines={1}>
                            {getBranchTitle(t)}
                          </Text>

                          <Text style={styles.threadTime}>
                            {previewTime(t.last_message_at)}
                          </Text>
                        </View>

                        <View style={styles.threadBottomRow}>
                          <Text style={styles.threadPreview} numberOfLines={1}>
                            {getBranchTitle(t)} · {t.other_user_name}
                          </Text>

                          {t.unread_count > 0 && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadBadgeText}>{t.unread_count}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
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
                  <Text style={styles.avatarText}>{getUserInitials(user?.name)}</Text>
                </View>

                <View style={styles.profileTextArea}>
                  <Text style={styles.profileName}>{user?.name ?? 'My Account'}</Text>
                  <Text style={styles.profileBranch}>{user?.home_branch_city ?? 'My Branch'}</Text>
                </View>
              </View>

              <View style={styles.sidebarLine} />

              <View style={styles.menuList}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate('Home'), 240);
                  }}
                >
                  <Image
                    source={require('../../assets/images/home.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate('Profile'), 240);
                  }}
                >
                  <Image
                    source={require('../../assets/images/profile.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.activeMenuItem]}
                  onPress={closeSidebar}
                >
                  <Image
                    source={require('../../assets/images/message.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.menuText, styles.activeMenuText]}>Message</Text>
                  {unreadMessageCount > 0 && (
                    <View style={styles.menuUnreadBadge}>
                      <Text style={styles.menuUnreadBadgeText}>
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => navigation.navigate('Appointments'), 240);
                  }}
                >
                  <Image
                    source={require('../../assets/images/appointment.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Appointments</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Records"), 240); }}
                >
                  <Image
                    source={require('../../assets/images/records.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("DentalTreatmentPlan"), 240); }}
                >
                  <Image
                    source={require('../../assets/images/records.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Treatment Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Notifications"), 240); }}
                >
                  <Image
                    source={require('../../assets/images/notification-bell.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>Notifications</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.signOutSection}>
                <View style={styles.sidebarLine} />

                <TouchableOpacity style={styles.signOutButton} onPress={confirmLogout}>
                  <Image
                    source={require('../../assets/images/logout.png')}
                    style={styles.sidebarIcon}
                    resizeMode="contain"
                  />

                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        ) : null}

        {contactsOpen && (
          <View style={styles.contactPickerOverlay}>
            <View style={styles.contactPicker}>
              <Text style={styles.contactPickerTitle}>Start a conversation</Text>
              <Text style={styles.contactPickerSubtitle}>Pick who you want to message.</Text>

              <FlatList
                data={contacts}
                keyExtractor={c => `branch-${c.id}`}
                renderItem={({ item }) => {
                  const disabled = !item.can_message || !item.receptionist_id;
                  return (
                    <TouchableOpacity
                      onPress={() => pickContact(item)}
                      style={[styles.contactRow, disabled && styles.contactRowDisabled]}
                      disabled={disabled}
                    >
                      <Text style={[styles.contactName, disabled && styles.contactNameDisabled]}>
                        {getBranchTitle(item)}
                      </Text>
                      <Text style={[styles.contactMeta, disabled && styles.contactMetaUnavailable]}>
                        {disabled ? 'Available after first appointment.' : item.receptionist_name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                onPress={() => setContactsOpen(false)}
                style={styles.contactCloseBtn}
              >
                <Text style={styles.contactCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
