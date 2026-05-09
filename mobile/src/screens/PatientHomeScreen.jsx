import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import styles from '../styles/PatientHomeScreen';

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