import React, { useEffect, useState } from "react";
import {
    Button,
    View,
    StyleSheet,
    SafeAreaView,
    Text,
    Pressable,
} from "react-native";
import {
    ResponseType,
    makeRedirectUri,
    useAuthRequest,
    AuthRequestConfig,
    AuthSessionResult,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Entypo, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import { useAuthStore } from "../context/AuthContext";
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

function SignInScreen() {
    const [userAuthObj, setUserAuthObj] = useState<any | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const discovery = {
        authorizationEndpoint: "https://tunedrop-nest-production.up.railway.app/auth/spotify",
        tokenEndpoint: "https://tunedrop-nest-production.up.railway.app/auth/spotify/callback",
    };

    // const redirectUri = makeRedirectUri({
    //     preferLocalhost: true,
    //     // native: "com.example.tunedrop://redirect",
    //     scheme: "tunedrop",
    //     // useProxy: true
    //     // path: "/auth/spotify/callback",
    //     // native: "https://tunedrop-nest-production.up.railway.app/auth/spotify/callback",
    //     // useProxy: true,
    // });

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            // scopes: ['user-read-email', 'playlist-modify-public'],
            // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
            // this must be set to false
            usePKCE: false,
            redirectUri: "exp://192.168.8.125:8081/",
        },
        discovery
    );

    useEffect(() => {
        console.log("request ", request);
        // WebBrowser.dismissBrowser();
        // WebBrowser.dismissAuthSession();
        // AuthSession.dismiss();
        // console.log("RESPONSE BEFORE", response);
        console.log("RESPONSE TYPE: ", response?.type);

        if (response?.type === "success" || response?.type === "error") {
            console.log("RESPONSE ", response);
            setUserAuthObj(response);
            signIn();
        }
    }, [response]);

    useEffect(() => {
        if (userAuthObj !== null) {
            console.log(`[USER AUTH OBJ]: `, userAuthObj);
            const jwt = userAuthObj.params.jwt;
            storeAuthInfo(userAuthObj);
            getTopArtists();
        }
    }, [userAuthObj]);

    const storeAuthInfo = async (userAuthStuff: any) => {
        try {
            // Decode JWT to get user info
            // const jwt = jwtDecode(userAuthStuff.params.jwt);

            // Store tokens and user info
            await AsyncStorage.setItem(
                "@accessToken",
                userAuthStuff.params.access_token
            );
            // clg async storage to check
            // console.log(await AsyncStorage.getItem("@refreshToken"));
            await AsyncStorage.setItem(
                "@refreshToken",
                userAuthStuff.params.refresh_token
            );
            // await AsyncStorage.setItem('@userInfo', JSON.stringify(userInfo));
            await AsyncStorage.setItem("@jwt", userAuthStuff.params.jwt);
            // const jwt = await AsyncStorage.getItem(
            //     "@jwt"
            // );
            // console.log("STORED JWT TOKEN: ", jwt);

            signIn();
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: "HomeScreen",
                    },
                ],
            });

            console.log("Authentication info stored successfully");
        } catch (e) {
            console.error("Error storing auth info", e);
        }
    };

    const getTopArtists = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem("@jwt");
            console.log("JWT", jwtToken);
            if (!jwtToken) {
                throw new Error("Access token not found");
            }

            const response = await fetch(
                "https://tunedrop-nest-production.up.railway.app/spotify/top-artists",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            // console.log('response', response);
            if (response.ok) {
                const data = await response.json();
                console.log("User's top artists:", data);
                // Handle the received data as needed
            } else {
                console.error("Failed to fetch top artists:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching top artists:", error);
        }
    };

    const { isSignedIn, signIn, signOut } = useAuthStore();

    return (
        <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Logo and App Name */}
                <View style={styles.logoContainer}>
                    <MaterialIcons name="music-note" size={60} color="white" />
                    <Text style={styles.appName}>TuneDrop</Text>
                    <Text style={styles.tagline}>Discover Your Sound</Text>
                </View>

                {/* Spacer to push the button to the bottom */}
                <View style={styles.spacer} />

                {/* Sign in with Spotify Button */}
                <Pressable onPress={() => promptAsync()} style={styles.spotifyButton}>
                    <Text style={styles.buttonText}>Sign in with Spotify</Text>
                </Pressable>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    safeArea: {
        flex: 1,
        justifyContent: "space-between",
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    appName: {
        color: "white",
        fontSize: 40,
        fontWeight: "bold",
        marginTop: 20,
    },
    tagline: {
        color: "white",
        fontSize: 18,
        fontStyle: "italic",
        marginTop: 10,
    },
    spacer: {
        flex: 1,
    },
    spotifyButton: {
        backgroundColor: "#1DB954",
        padding: 15,
        paddingHorizontal: 30,
        margin: 20,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 60,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default SignInScreen;
