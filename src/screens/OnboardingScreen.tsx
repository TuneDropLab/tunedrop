import React from "react";
import Onboarding from "react-native-onboarding-swiper";
import LottieView from "lottie-react-native";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OnboardingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const onDone = () => {
    AsyncStorage.setItem("@alreadyLaunched", "true");
    navigation.navigate("SignInScreen");
  };

  const onSkip = () => {
    AsyncStorage.setItem("@alreadyLaunched", "true");
    navigation.replace("SignInScreen"); // Use replace to avoid going back to onboarding
  };

  return (
    <Onboarding
      onSkip={onSkip}
      onDone={onDone}
      pages={[
        {
          backgroundColor: "#131624",
          image: (
            <LottieView
              source={require("../../assets/animation1.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: "Discover in Every Tap",
          subtitle:
            "Welcome to a world where every bubble brings you closer to your next favorite track.",
        },
        {
          backgroundColor: "#333399",
          image: (
            <LottieView
              source={require("../../assets/animation2.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: "Interactive Listening",
          subtitle:
            "Interact with music like never before. Press the bubbles to play sounds and explore the melodies that move you.",
        },
        {
          backgroundColor: "#444655",
          image: (
            <LottieView
              source={require("../../assets/animation3.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          ),
          title: "Swipe to Save",
          subtitle:
            "Found a beat that caught your ear? Swipe up on the bubble to add it to your library and keep the vibes flowing.",
        },
      ]}
    />
  );
};

export default OnboardingScreen;
