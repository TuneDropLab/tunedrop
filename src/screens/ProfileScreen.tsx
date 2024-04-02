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
} from "react-native";
import { useAuthStore } from "../context/AuthContext";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { signOut } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  type User = {
    name: string;
    email: string;
    profilePictureUrl: string;
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const jwtToken = await AsyncStorage.getItem("@jwt");
        if (!jwtToken) throw new Error("JWT token not found");

        const response = await fetch("http://localhost:3000/user/profile", {
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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: height,
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
});

export default ProfileScreen;
