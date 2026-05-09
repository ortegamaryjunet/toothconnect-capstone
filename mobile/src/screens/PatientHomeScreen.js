import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';

export default function PatientHomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ToothConnect</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Hi, {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Day 2: book appointment</Text>
          <Text style={styles.placeholderText}>AI suggested slots will appear here</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Day 3: dental risk + treatment progress</Text>
          <Text style={styles.placeholderText}>CAMBRA risk assessment and your active treatments</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Day 4: chat with reception + payment receipts</Text>
          <Text style={styles.placeholderText}>Messaging and Cloudinary receipt uploads</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: {
    backgroundColor: '#1a365d', padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  logout: { color: '#fff', fontSize: 14 },
  body: { flex: 1, padding: 20 },
  welcome: { fontSize: 22, fontWeight: '600', color: '#1a365d' },
  email: { fontSize: 14, color: '#718096', marginBottom: 20 },
  placeholder: {
    backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  placeholderTitle: { fontSize: 14, fontWeight: '500', color: '#2d3748' },
  placeholderText: { fontSize: 12, color: '#718096', marginTop: 4 },
});