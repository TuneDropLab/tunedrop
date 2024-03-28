import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SignInScreen from './src/screens/SignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import 'react-native-gesture-handler';
import LandingScreen from './src/screens/LandingScreen';

import * as Sentry from "@sentry/react-native";
import TutorialScreen from './src/screens/TutorialScreen';
import { useEffect, useState } from 'react';
import { useAuthStore } from './src/context/AuthContext';
import ProfileScreen from './src/screens/ProfileScreen';


Sentry.init({
  dsn: "https://cd7bf1148cfa1fe20a662190408cab95@o4506932229636096.ingest.us.sentry.io/4506932245168128",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});



const Stack = createStackNavigator();

function App() {
  const istest = false; // Add your logic to check if the user is signed in
  const { isSignedIn, signIn, signOut } = useAuthStore();
  const initialRouteName = isSignedIn ? 'HomeScreen' : 'SignInScreen';


  return (

    // <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
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
        <Stack.Screen
          name="TutorialScreen"
          component={TutorialScreen}
          options={{ title: 'Tutorial' }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
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
    // </AuthProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});


export default Sentry.wrap(App);