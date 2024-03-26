import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, Button } from 'react-native';
import Circle from '../components/MusicBubble';
import { useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
    const [circles, setCircles] = useState<{ id: number; size: number; color: string; duration: number; }[]>([]);
    const ourColors = ['#FF0000', '#876E59', '#3046B6'];
    const sizes = useSharedValue([50, 100, 150]);
    const [isPaused, setIsPaused] = useState(false);
    // set jwt state
    const [userJWT, setUserJWT] = useState<string | null>();

    useEffect(() => {
        // Fetch song data from the API and create circles
        const newCircles = [
            { id: 1, size: sizes.value[0], color: ourColors[0], duration: 2000 },
            { id: 2, size: sizes.value[1], color: ourColors[1], duration: 3000 },
            { id: 3, size: sizes.value[2], color: ourColors[2], duration: 4000 },
        ];
        setCircles(newCircles);
    }, []);

    const handlePress = async () => {
        setIsPaused((prevPaused) => !prevPaused);
    };

    const { isSignedIn, signOut, signIn } = useAuth();
    const showJWT = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem("@jwt");
            setUserJWT(jwtToken);
        } catch (error) {
            console.error("Error retrieving JWT:", error);
        }
    };

    return (
        <LinearGradient colors={["#401E83", "#0B1129"]} style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <View>
                    <Text
                        style={{
                            textAlign: "center",
                            color: "white",
                            fontSize: 40,
                            fontWeight: "bold",
                            marginTop: 40,
                        }}
                    >
                        TuneDrop {`CURRENTLY SIGNED IN? ${isSignedIn}`}

                    </Text>

                    <Button title='Sign out' onPress={signOut}></Button>
                    <Button title='Sign in' onPress={signIn}></Button>

                    <Button title='Show JWT' onPress={showJWT}></Button>
                    {userJWT && (
                        <Text style={{ color: "white", fontSize: 16, marginTop: 20 }}>
                            JWT: {userJWT}
                        </Text>
                    )}
                </View>
                {circles.map((circle) => (
                    <Circle
                        key={circle.id}
                        size={circle.size}
                        color={circle.color}
                        duration={isPaused ? 0 : circle.duration}
                        onPress={handlePress}
                    />
                ))}
            </View>
        </LinearGradient>
    );
};

export default HomeScreen;