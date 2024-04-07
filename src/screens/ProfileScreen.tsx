import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../context/AuthContext";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";



const { width, height } = Dimensions.get("window");

type SavedTrack = {
  id: string;
  title: string;
  release_year: string;
  artistName: string[];
  albumArt: string;
};

function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { signOut } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);

  type User = {
    name: string;
    email: string;
    profilePictureUrl: string;
  };

  const fetchSavedTracks = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("@jwt");
      if (!jwtToken) throw new Error("JWT token not found");

      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/user/saved-tracks`, {
        method: "GET",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch saved tracks");

      const data = await response.json();
      setSavedTracks(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const jwtToken = await AsyncStorage.getItem("@jwt");
        if (!jwtToken) throw new Error("JWT token not found");

        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/user/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const data = await response.json();
        setUser(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    fetchSavedTracks();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Confirm Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          // Logic to sign out the user
          // This can include clearing user session, redirecting, etc.
          signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: "SignInScreen" }],
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#131624", "#333399", "#444655"]}
        style={styles.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: user?.profilePictureUrl || "" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || "User Name"}</Text>
        <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.savedTracksSection}>
        <Text style={styles.savedTracksHeading}>Saved Tracks</Text>

        {savedTracks.length > 0 ? (
          savedTracks.map((track, index) => (
            <React.Fragment key={track.id}>
              <View style={styles.trackItem}>
                <Image
                  source={{ uri: track.albumArt }}
                  style={styles.trackImage}
                />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackName}>{track.title}</Text>
                  <Text style={styles.trackDetails}>
                    {`${track.artistName.join(", ")} · ${track.release_year}`}
                  </Text>
                </View>
              </View>
              {index < savedTracks.length - 1 && (
                <View style={styles.trackDivider} />
              )}
            </React.Fragment>
          ))
        ) : (
          <Text style={styles.noTracksText}>No saved tracks</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Add styles for profileCard, error, and any updates for visual feedback
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: height + 150,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width - 40,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#ff4757",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  savedTracksSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    width: width - 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  savedTracksHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#131624",
    paddingVertical: 15,
    textAlign: "center",
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  trackInfo: {
    marginLeft: 15,
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#131624",
  },
  trackDetails: {
    fontSize: 14,
    color: "#666",
  },
  trackDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
  },
  noTracksText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
  header: {
    position: 'relative',
    alignSelf: 'flex-start',
    paddingHorizontal: 20, // Side padding
    paddingTop: 40, // Top padding for spacing
    // zIndex: 100, // Make sure this is above other content
  },
  backButton: {
    width: 44, // Set a specific size for hit-slop
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
