import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet, SafeAreaView, Text, Pressable } from 'react-native';
import { ResponseType, makeRedirectUri, useAuthRequest, AuthRequestConfig, AuthSessionResult } from "expo-auth-session";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Entypo, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';
import "core-js/stable/atob";
WebBrowser.maybeCompleteAuthSession();

function SignInScreen() {
    const [userAuthObj, setUserAuthObj] = useState<any | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const discovery = {
        authorizationEndpoint: 'http://localhost:3000/auth/spotify',
        tokenEndpoint: 'http://localhost:3000/auth/spotify/callback',
    };

    // const redirectUri = makeRedirectUri({
    //     preferLocalhost: true,
    //     // native: "com.example.tunedrop://redirect",
    //     scheme: "tunedrop",
    //     // useProxy: true
    //     // path: "/auth/spotify/callback",
    //     // native: "http://localhost:3000/auth/spotify/callback",
    //     // useProxy: true,
    // });

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: 'f330ce3d36274e8b92c59b4429ead10c',
            clientSecret: "5ec83f824a6b477cb8c0370d597f0571",
            // scopes: ['user-read-email', 'playlist-modify-public'],
            // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
            // this must be set to false
            usePKCE: false,
            redirectUri: "exp://172.20.10.3:8081/",
        },
        discovery
    );

    useEffect(() => {
        console.log("request ", request);
        WebBrowser.dismissBrowser();
        WebBrowser.dismissAuthSession();
        console.log("RESPONSE BEFORE", response);
        console.log("RESPONSE TYPE: ", response?.type);

        if (response?.type === "success" || response?.type === "error") {
            setUserAuthObj(response);
        }
    }, [response]);

    useEffect(() => {
        if (userAuthObj !== null) {
            console.log(`[USER AUTH OBJ]: `, userAuthObj);
            const jwt = userAuthObj.params.jwt;
            storeAuthInfo(userAuthObj);
        }
    }, [userAuthObj]);


    const storeAuthInfo = async (userAuthStuff: any) => {

        try {
            // Decode JWT to get user info
            const jwt = jwtDecode(userAuthStuff.params.jwt);

            // Store tokens and user info
            await AsyncStorage.setItem(
                "@accessToken",
                userAuthStuff.params.access_token
            );
            // clg async storage to check
            // console.log(await AsyncStorage.getItem("@refreshToken"));
            const storedAccessToken = await AsyncStorage.getItem(
                "@accessToken"
            );
            await AsyncStorage.setItem(
                "@refreshToken",
                userAuthStuff.params.refresh_token
            );
            // await AsyncStorage.setItem('@userInfo', JSON.stringify(userInfo));
            console.log("STORED ACCESS TOKEN: ", storedAccessToken);
            navigation.navigate('HomeScreen');

            console.log("Authentication info stored successfully");
        } catch (e) {
            console.error("Error storing auth info", e);
        }
    };

    //     const token = extractTokenFromUrl(result.url);
    //     if (token) {
    //         await AsyncStorage.setItem("@authToken", token);
    //         navigation.navigate('HomeScreen'); // Navigate to the home screen
    //     } else {
    //         // Handle error or absence of token
    //         console.error("Authentication failed");
    //     }
    // }
    // };

    // Function to extract the token from the redirect URL
    const extractTokenFromUrl = (url: any) => {
        // Implement based on how your backend sends the token
        // Example: yourapp://redirect#token=YOUR_TOKEN
        const match = url.match(/token=([^#]+)/);
        return match ? match[1] : null;
    };


    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <Entypo
                    name="air"
                    size={80}
                    color="white"
                    style={{ textAlign: "center" }}
                />
                <Text
                    style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: 40,
                        fontWeight: "bold",
                        marginTop: 40,
                    }}
                >
                    TuneDrop
                </Text>
                <View style={{ height: 80 }} />
                <Pressable
                    onPress={() => {
                        promptAsync();
                    }}
                    style={{
                        backgroundColor: "#30FF8A",
                        padding: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: 300,
                        borderRadius: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                    }}
                >
                    <Text className="">Sign in with Spotify</Text>
                </Pressable>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SignInScreen;
