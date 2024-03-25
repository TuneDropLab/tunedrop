import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();


  return (
    <Onboarding

      onDone={() => navigation.navigate('SignInScreen')}
      onSkip={() => navigation.navigate('SignInScreen')}
      pages={[
        {
          backgroundColor: '#fff',
          image: <Image source={require('../../assets/airplanemode.jpg')} style={{ width: 100, height: 100 }} />,
          title: 'Welcome to Our App',
          subtitle: 'This is a cool music app',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('../../assets/airplanemode.jpg')} style={{ width: 100, height: 100 }} />,
          title: 'Discover New Music',
          subtitle: 'Find your next favorite song',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('../../assets/airplanemode.jpg')} style={{ width: 100, height: 100 }} />,
          title: 'Build Your Library',
          subtitle: 'Swipe up to add songs to your library',
          titleStyles: {
            fontSize: 20,
            color: '#E01C1C',
            alignContent: "flex-start"
          }
        },
      ]}
    />
  );
}

