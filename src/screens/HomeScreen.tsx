import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withSequence,
  withDelay,
  interpolateColor,
} from "react-native-reanimated";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

type Recommendation = {
  preview_url: string;
  album: {
    images: { url: string }[];
    name: string;
  };
};

const { width, height } = Dimensions.get("window");
const bubbleSize = 200;
const animationDuration = 2000;
const bubbleDelay = 500;
const colors = ["#d5523c", "#e68a02", "#fdb800", "#8A2BE2", "#8ea471"];

const HomeScreen = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [playedSongs, setPlayedSongs] = useState<string[]>([]);
  const animatedValues = useSharedValue(-bubbleSize);

  const fetchRecommendations = useCallback(async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("@jwt");
      console.log("JWT", jwtToken);
      if (!jwtToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        "http://localhost:3000/spotify/recommendations",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Recommendations:", data);
        const newRecommendations = data.filter(
          (recommendation: any) =>
            !playedSongs.includes(recommendation.preview_url)
        );
        setRecommendations((prevRecommendations) => [
          ...prevRecommendations,
          ...newRecommendations,
        ]);
      } else {
        console.error("Failed to fetch recommendations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [playedSongs]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (recommendations.length < 4) {
      fetchRecommendations();
    }
  }, [recommendations, fetchRecommendations]);

  const playPreview = async (previewUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: previewUrl });
      await sound.playAsync();
      setPlayedSongs((prevPlayedSongs) => [...prevPlayedSongs, previewUrl]);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomColorStart = colors[Math.floor(Math.random() * colors.length)];
    const randomColorEnd = colors[Math.floor(Math.random() * colors.length)];
    const bubbleColor = interpolateColor(
      animatedValues.value,
      [-bubbleSize, height + bubbleSize],
      [randomColorStart, randomColorEnd]
    );
    return {
      backgroundColor: bubbleColor,
      transform: [
        {
          translateY: withSequence(
            withDelay(
              bubbleDelay * animatedValues.value,
              withTiming(height + bubbleSize, {
                duration: animationDuration,
                easing: Easing.linear,
              })
            ),
            withTiming(-bubbleSize, { duration: 0 })
          ),
        },
      ],
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#ff00cc", "#333399", "#ff00cc"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {recommendations.map((recommendation, index) => (
        <Animated.View
          key={index}
          style={[styles.bubble, animatedStyle]}
          onLayout={() => {
            animatedValues.value = animatedValues.value + 1;
          }}
        >
          <TouchableOpacity
            style={styles.bubbleContent}
            onPress={() => playPreview(recommendation.preview_url)}
          >
            <Image
              source={{ uri: recommendation.album.images[0].url }}
              style={styles.albumArt}
            />
            <Text style={styles.albumName}>{recommendation.album.name}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  bubble: {
    width: bubbleSize,
    height: bubbleSize,
    borderRadius: bubbleSize / 2,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  bubbleContent: {
    padding: 8,
    alignItems: "center",
  },
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  albumName: {
    marginTop: 8,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 150,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
