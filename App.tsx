import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SignInScreen from './src/screens/SignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import 'react-native-gesture-handler';
import LandingScreen from './src/screens/LandingScreen';
import { useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  // const isSignedIn = false; // Add your logic to check if the user is signed in
  const { isSignedIn, } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isSignedIn ? "HomeScreen" : Platform.OS === 'web' ? "LandingScreen" : "OnboardingScreen"}>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{
            title: 'Onboarding',
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={{ title: 'Sign In' }}
        />
        {Platform.OS === 'web' && (
          <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ title: 'Landing' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


