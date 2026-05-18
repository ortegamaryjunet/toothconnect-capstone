import { forwardRef, useImperativeHandle, useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  PanResponder,
  Dimensions,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { getUnreadCount } from '../api/notifications';

function getBranchCity(address, fallback = 'Dental Clinic') {
  const parts = String(address || '').split(',').map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || fallback;
}

const MENU_ITEMS = [
  { key: 'Home',          label: 'Home',          screen: 'Home',          icon: require('../../assets/images/home.png') },
  { key: 'Profile',       label: 'Profile',       screen: 'Profile',       icon: require('../../assets/images/profile.png') },
  { key: 'MessagesList',  label: 'Message',       screen: 'MessagesList',  icon: require('../../assets/images/message.png') },
  { key: 'Appointments',  label: 'Appointments',  screen: 'Appointments',  icon: require('../../assets/images/appointment.png') },
  { key: 'Records',       label: 'History',       screen: 'Records',       icon: require('../../assets/images/records.png') },
  { key: 'Notifications', label: 'Notifications', screen: 'Notifications', icon: require('../../assets/images/notification-bell.png') },
];

const AppSidebar = forwardRef(function AppSidebar({ navigation, activeScreen }, ref) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = screenWidth * 0.9;
  const sidebarTranslateX = useRef(new Animated.Value(-sidebarWidth)).current;

  useEffect(() => {
    let mounted = true;
    api.get('/auth/branches').then(res => {
      if (mounted) setBranches(res.data.branches || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  function openSidebar() {
    setIsOpen(true);
    sidebarTranslateX.setValue(-sidebarWidth);
    Animated.timing(sidebarTranslateX, {
      toValue: 0,
      duration: 230,
      useNativeDriver: true,
    }).start();
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }

  function closeSidebar() {
    Animated.timing(sidebarTranslateX, {
      toValue: -sidebarWidth,
      duration: 230,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }

  useImperativeHandle(ref, () => ({ open: openSidebar, close: closeSidebar }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) sidebarTranslateX.setValue(Math.max(-sidebarWidth, g.dx));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -80) {
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
    Alert.alert('Logout?', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          closeSidebar();
          await logout();
        },
      },
    ]);
  }

  const userInitials = useMemo(() => {
    if (!user?.name) return 'JD';
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }, [user]);

  const patientBranch = useMemo(() => {
    return branches.find(b => String(b.id) === String(user?.home_branch_id)) || null;
  }, [branches, user?.home_branch_id]);

  const profileBranchText =
    user?.home_branch_city ||
    getBranchCity(patientBranch?.address, patientBranch?.name || 'Dental Clinic');

  if (!isOpen) return null;

  return (
    <View style={s.overlay}>
      <Pressable style={s.backdrop} onPress={closeSidebar} />

      <Animated.View
        style={[s.sidebar, { width: sidebarWidth, transform: [{ translateX: sidebarTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={s.profileSection}>
          <View style={s.avatarBox}>
            <Text style={s.avatarText}>{userInitials}</Text>
          </View>
          <View style={s.profileTextArea}>
            <Text style={s.profileName}>{user?.name || 'Patient'}</Text>
            <Text style={s.profileBranch}>{profileBranchText}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.menuList}>
          {MENU_ITEMS.map(item => {
            const isActive = activeScreen === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[s.menuItem, isActive && s.activeMenuItem]}
                onPress={() => {
                  closeSidebar();
                  if (!isActive) setTimeout(() => navigation.navigate(item.screen), 240);
                }}
              >
                {item.key === 'Notifications' ? (
                  <View style={{ position: 'relative', marginRight: 16 }}>
                    <Image source={item.icon} style={[s.icon, { marginRight: 0 }]} resizeMode="contain" />
                    {unreadCount > 0 && (
                      <View style={s.notifBadge}>
                        <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Image source={item.icon} style={s.icon} resizeMode="contain" />
                )}
                <Text style={[s.menuText, isActive && s.activeMenuText]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.signOutSection}>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuItem} onPress={confirmLogout}>
            <Image source={require('../../assets/images/logout.png')} style={s.icon} resizeMode="contain" />
            <Text style={s.menuText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
});

export default AppSidebar;

const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 50,
    elevation: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    zIndex: 60,
    elevation: 60,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  avatarText: {
    fontSize: 20,
    color: '#b47a00',
    fontWeight: '900',
    fontFamily: SERIF,
  },
  profileTextArea: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    color: '#b47a00',
    fontWeight: '900',
    fontFamily: SERIF,
  },
  profileBranch: {
    fontSize: 13,
    color: '#8a650e',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 14,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    minHeight: 42,
  },
  activeMenuItem: {
    backgroundColor: '#fff8e7',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#b47a00',
    fontWeight: '700',
    fontFamily: SERIF,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  activeMenuText: {
    color: '#b47a00',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e53e3e',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  signOutSection: {
    marginTop: 'auto',
  },
});
