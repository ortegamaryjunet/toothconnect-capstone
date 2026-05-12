import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import BookSuggestionsScreen from '../screens/BookSuggestionsScreen';
import BookConfirmScreen from '../screens/BookConfirmScreen';
import RiskAssessmentScreen from '../screens/RiskAssessmentScreen';
import RiskResultScreen from '../screens/RiskResultScreen';
import TreatmentProgressScreen from '../screens/TreatmentProgressScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <Text style={{ color: '#718096' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={PatientHomeScreen} />
            <Stack.Screen name="BookService" component={BookServiceScreen} />
            <Stack.Screen name="BookSuggestions" component={BookSuggestionsScreen} />
            <Stack.Screen name="BookConfirm" component={BookConfirmScreen} />
            <Stack.Screen name="RiskAssessment" component={RiskAssessmentScreen} />
            <Stack.Screen name="RiskResult" component={RiskResultScreen} />
            <Stack.Screen name="TreatmentProgress" component={TreatmentProgressScreen} />
            <Stack.Screen name="MessagesList" component={MessagesListScreen} />
            <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}