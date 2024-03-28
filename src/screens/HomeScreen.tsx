import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const bubbleSize = 230;
const animationDuration = 5000;
const colors = ["#d5523c", "#e68a02", "#fdb800", "#8A2BE2", "#8ea471"];

type Recommendation = {
  name: string;
  preview_url: string;
  album: {
    images: { url: string }[];
    name: string;
  };
};

const HomeScreen = () => {
  const [recommendationsQueue, setRecommendationsQueue] = useState<
    Recommendation[]
  >([]);
  const [currentRecommendation, setCurrentRecommendation] =
    useState<Recommendation | null>(null);
  const [bubbleColor, setBubbleColor] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false); // New state to track fetching status
  const [isPaused, setIsPaused] = useState(false);
  const animationValue = useSharedValue(-bubbleSize);

  const fetchRecommendations = useCallback(async () => {
    if (isFetching) return; // Prevent multiple fetches
    setIsFetching(true);
    try {
      const jwtToken = await AsyncStorage.getItem("@jwt");
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
        setRecommendationsQueue((prevQueue) => [...prevQueue, ...data]);
      } else {
        console.error("Failed to fetch recommendations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsFetching(false); // Reset fetching status
    }
  }, [isFetching]); // Add isFetching to the dependency array

  const checkAndFetchRecommendations = useCallback(() => {
    if (recommendationsQueue.length < 4 && !isFetching) {
      fetchRecommendations();
    }
  }, [recommendationsQueue.length, isFetching, fetchRecommendations]);

  useEffect(() => {
    checkAndFetchRecommendations();
  }, [checkAndFetchRecommendations]);

  const playPreview = async (previewUrl: string) => {
    try {
      // isPaused.current = true;
      const { sound } = await Audio.Sound.createAsync({ uri: previewUrl });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: bubbleColor, // Use the stable color
      transform: [{ translateY: animationValue.value }],
    };
  }, [bubbleColor]); // Depend on bubbleColor

  const processNextRecommendation = useCallback(() => {
    setRecommendationsQueue((currentQueue) => {
      const nextQueue = [...currentQueue];
      const nextRecommendation = nextQueue.shift();
      setCurrentRecommendation(nextRecommendation || null);
      return nextQueue;
    });
  }, []);

  const startNextAnimation = useCallback(() => {
    if (recommendationsQueue.length > 0 && !isPaused) {
      // Process next recommendation and restart animation
      processNextRecommendation();
      setBubbleColor(colors[Math.floor(Math.random() * colors.length)]);
      animationValue.value = -bubbleSize; // Reset animation start position
      animateBubble();
    }
  }, [recommendationsQueue, processNextRecommendation, isPaused]);

  const animateBubble = useCallback(() => {
    // Calculate remaining distance and adjust duration based on current position if paused
    const startValue =
      animationValue.value < 0 ? -bubbleSize : animationValue.value;
    const remainingDistance = height - startValue;
    const adjustedDuration = isPaused
      ? (remainingDistance / height) * animationDuration
      : animationDuration;

    animationValue.value = withTiming(
      height,
      {
        duration: adjustedDuration,
        easing: Easing.linear,
      },
      (isFinished) => {
        if (isFinished && !isPaused) {
          runOnJS(startNextAnimation)();
        }
      }
    );
  }, [isPaused, startNextAnimation]);

  useEffect(() => {
    // Start animation only if there's a current recommendation, and it's not paused.
    if (currentRecommendation !== null && !isPaused) {
      animateBubble();
    }
  }, [currentRecommendation, animateBubble, isPaused]);

  useEffect(() => {
    if (
      currentRecommendation === null &&
      recommendationsQueue.length > 0 &&
      !isPaused
    ) {
      startNextAnimation();
    }
  }, [
    currentRecommendation,
    recommendationsQueue,
    startNextAnimation,
    isPaused,
  ]);

  let animation: any;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#ff00cc", "#333399", "#ff00cc"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => {
            navigation.navigate("ProfileScreen");
          }}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
      {/* Default bubbles at the top */}
      <View style={styles.defaultBubblesContainer}>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[styles.defaultBubble, { backgroundColor: color }]}
          />
        ))}
      </View>

      <View style={styles.defaultBubblesContainer2}>
        {colors.reverse().map((color, index) => (
          <View
            key={index}
            style={[styles.defaultBubble, { backgroundColor: color }]}
          />
        ))}
      </View>
      <View style={styles.bubbleContainer}>
        {currentRecommendation && (
          <TouchableOpacity
            onPressIn={() => {
              console.log("Bubble long-pressed!");
              cancelAnimation(animationValue);
              setIsPaused(true);
            }}
            onPressOut={() => {
              console.log("Long press released!");
              setIsPaused(false);
              // Need a slight delay before resuming to ensure `isPaused` state is updated
              setTimeout(() => {
                if (!isPaused) {
                  animateBubble();
                }
              }, 100);
            }}
          >
            <Animated.View style={[styles.bubble, animatedStyle]}>
              <View style={styles.bubbleContent}>
                <Image
                  source={{ uri: currentRecommendation.album.images[0].url }}
                  style={styles.albumArt}
                />
                <Text style={styles.albumName} numberOfLines={2}>
                  {currentRecommendation.name}
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
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
  defaultBubblesContainer: {
    flexDirection: "row", // Arrange bubbles in a row
    justifyContent: "space-around", // Space them evenly
    width: "100%", // Take full width to spread bubbles across
    position: "absolute", // Positioning relative to the parent
    top: 10, // Slightly lower from the top edge
  },
  defaultBubblesContainer2: {
    flexDirection: "row", // Arrange bubbles in a row
    justifyContent: "space-around", // Space them evenly
    width: "100%", // Take full width to spread bubbles across
    position: "absolute", // Positioning relative to the parent
    top: -20, // Slightly lower from the top edge
  },
  defaultBubble: {
    width: bubbleSize / 2, // Smaller size for default bubbles
    height: bubbleSize / 2,
    borderRadius: bubbleSize, // Ensure they're rounded
    borderWidth: 2,
    borderColor: "white",
  },
  bubbleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    width: bubbleSize,
    height: bubbleSize,
    borderRadius: bubbleSize / 2,
    // position: "absolute",
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
  profileButtonContainer: {
    position: "absolute",
    zIndex: 30,
    top: 55,
    right: 30,
  },
  profileButton: {
    backgroundColor: "#888",
    padding: 10,
    borderRadius: 5,
  },
  profileButtonText: {
    color: "#fff",
  },
});

export default HomeScreen;
