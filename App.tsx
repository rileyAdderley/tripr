import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TripsProvider } from './contexts/TripsContext';

import HomeScreen from './screens/HomeScreen';
import CreateTripScreen from './screens/CreateTripScreen';
import MyTripsScreen from './screens/MyTripsScreen';
import TripDetailScreen from './screens/TripDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <TripsProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
            <Stack.Screen name="MyTrips" component={MyTripsScreen} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TripsProvider>
    </SafeAreaProvider>
  );
}
