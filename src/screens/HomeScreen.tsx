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
  withRepeat,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const bubbleSize = 200;
const animationDuration = 5000;
const colors = ["#8ac5f4", "#b1d8f6", "#d2eaf9", "#f6f5ee", "#fafafa"];

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
  const [sound, setSound] = useState<Audio.Sound | null>(null); // Sound state
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState("http://www.gravatar.com/avatar/?d=retro&s=32");
  const scaleValue = useSharedValue(1);
  

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
        // Preload album images
        const imagePreloadPromises = data.map((rec: Recommendation) =>
          Image.prefetch(rec.album.images[0].url)
        );
        await Promise.all(imagePreloadPromises);
        console.log("Fetched recommendations:", data);
        setRecommendationsQueue((prevQueue) => [...prevQueue, ...data]);
      } else {
        console.error("Failed to fetch recommendations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsFetching(false); // Reset fetching status
    }
  }, [isFetching]);
  // Add isFetching to the dependency array

  const fetchUserProfile = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("@jwt");
      if (!jwtToken) {
        console.error("JWT token not found");
        return;
      }

      const response = await fetch("http://localhost:3000/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user profile in home");
        return;
      }

      const data = await response.json();
      console.log("Fetched user profile:", data);
      const profilePhotoUrl = data.profilePictureUrl
        ? data.profilePictureUrl
        : "http://www.gravatar.com/avatar/?d=retro&s=32";
      setProfilePhoto(profilePhotoUrl); // Use default URL if not provided
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const checkAndFetchRecommendations = useCallback(() => {
    if (recommendationsQueue.length < 4 && !isFetching) {
      fetchRecommendations();
    }
  }, [recommendationsQueue.length, isFetching, fetchRecommendations]);

  useEffect(() => {
    checkAndFetchRecommendations();
  }, [checkAndFetchRecommendations]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const preloadSound = async (previewUrl: string) => {
    if (sound) {
      await sound.unloadAsync(); // Ensure any previous sound is unloaded
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: previewUrl },
      { shouldPlay: false } // Load without playing immediately
    );

    // Set the current recommendation and sound only if successful
    // setCurrentRecommendation(nextRecommendation);
    setSound(newSound);
  };

  const playCurrentSound = async () => {
    if (sound) {
      await sound.playAsync(); // Play the preloaded sound
    }
  };

  const pressInAnimation = () => {
    // Start the song wave animation
    scaleValue.value = withRepeat(
      withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      -1, // Repeat indefinitely
      true // Reverse the animation on every iteration
    );
  };

  const pressOutAnimation = () => {
    // Stop the song wave animation and reset scale
    scaleValue.value = withTiming(1, { duration: 200 });
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });
  }, []);

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: bubbleColor, // Use the stable color
      transform: [
        { translateY: animationValue.value },
        { scale: scaleValue.value },
      ],
    };
  }, [bubbleColor]); // Depend on bubbleColor

  const processNextRecommendation = useCallback(() => {
    setRecommendationsQueue((currentQueue) => {
      const nextRecommendation = currentQueue.shift();
      const nextQueue = [...currentQueue];
      if (!nextRecommendation) {
        return nextQueue;
      }
      setCurrentRecommendation(nextRecommendation || null);
      setIsImageLoading(true); // Indicate that a new image is loading

      if (nextQueue.length > 0) {
        preloadSound(nextRecommendation.preview_url); // Preload the sound for the next recommendation
      }

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
    if (currentRecommendation !== null && !isPaused && !isImageLoading) {
      animateBubble();
    }
  }, [currentRecommendation, animateBubble, isPaused, isImageLoading]);

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

  function getContrastYIQ(hexcolor: string) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  }

  let animation: any;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#131624", "#333399", "#444655"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
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
          <Animated.View style={[styles.bubble, animatedStyle]}>
            <TouchableOpacity
              onPressIn={() => {
                console.log("Bubble long-pressed!");
                cancelAnimation(animationValue);
                setIsPaused(true);
                pressInAnimation();
                console.log(currentRecommendation.preview_url);
                playCurrentSound(); // Play the sound on press
              }}
              onPressOut={() => {
                console.log("Long press released!");
                setIsPaused(false);
                // Need a slight delay before resuming to ensure `isPaused` state is updated
                pressOutAnimation();
                setTimeout(() => {
                  if (!isPaused) {
                    animateBubble();
                  }
                }, 100);
                stopSound(); // Stop the sound on release
              }}
              style={styles.bubble}
            >
              <View style={styles.bubbleContent}>
                <Image
                  source={{ uri: currentRecommendation.album.images[0].url }}
                  style={styles.albumArt}
                  onLoad={() => setIsImageLoading(false)} // Image has loaded
                />

                <Text
                  style={[
                    styles.albumName,
                    { color: getContrastYIQ(bubbleColor) },
                  ]}
                  numberOfLines={2}
                >
                  {currentRecommendation.name}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
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
  },
  profileButtonContainer: {
    position: "absolute",
    zIndex: 30,
    top: 40,
    right: 20,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it round
    borderWidth: 2,
    borderColor: "black",
    shadowColor: "#000",
  },
});

export default HomeScreen;
