import React from 'react';
import { Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

export default function Landingscreen() {
    return (
        <Onboarding
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
                },
            ]}
        />
    );
}

