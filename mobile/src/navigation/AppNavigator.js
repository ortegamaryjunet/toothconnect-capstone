import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { navigationRef, flushPendingNotificationNavigation } from './rootNavigation';
import { useAuth } from '../auth/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import BookAIAssistantScreen from '../screens/BookAIAssistantScreen';
import AIAnalysisScreen from '../screens/AIAnalysisScreen';
import BookSuggestionsScreen from '../screens/BookSuggestionsScreen';
import BookConfirmScreen from '../screens/BookConfirmScreen';
import TreatmentProgressScreen from '../screens/TreatmentProgressScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SplashScreen from '../screens/SplashScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import PatientRecordsScreen from '../screens/PatientRecordsScreen';
import DentalTreatmentPlanScreen from '../screens/DentalTreatmentPlanScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      flushPendingNotificationNavigation();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <Text style={{ color: '#718096' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (user) {
          flushPendingNotificationNavigation();
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={DashboardScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
            <Stack.Screen name="BookAIAssistant" component={BookAIAssistantScreen} />
            <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
            <Stack.Screen name="BookService" component={BookServiceScreen} />
            <Stack.Screen name="BookSuggestions" component={BookSuggestionsScreen} />
            <Stack.Screen name="BookConfirm" component={BookConfirmScreen} />
            <Stack.Screen name="MessagesList" component={MessagesListScreen} />
            <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="TreatmentProgress" component={TreatmentProgressScreen} />
            <Stack.Screen name="Records" component={PatientRecordsScreen} />
            <Stack.Screen name="DentalTreatmentPlan" component={DentalTreatmentPlanScreen} />
            
          </>
        ) : (
          <>
            <Stack.Screen name='SplashScreen' component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
