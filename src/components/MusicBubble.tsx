import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
    withSequence,
    withDelay,
    interpolateColor,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

type CircleProps = {
    recommendation: {
        preview_url: string;
        album: {
            images: { url: string; }[];
            name: string;
        };
    };
    // size: number;
    // color: string;
    // duration: number;
    playPreview: (previewUrl: string) => void;
};

const { width, height } = Dimensions.get('window');


const colors = ["#d5523c", "#e68a02", "#fdb800", "#8A2BE2", "#8ea471"];


const Circle: React.FC<CircleProps> = ({ recommendation, playPreview }) => {
    // const animatedValues = useSharedValue(-200);
    const circleY = useSharedValue(-10);
    const circleX = useSharedValue(3); // 
    const [circles, setCircles] = useState<{ id: number; size: number; color: string; duration: number; }[]>([]);
    const ourColors = ['#FF0000', '#876E59', '#3046B6'];
    const sizes = useSharedValue([50, 100, 150]);
    const [isPaused, setIsPaused] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        // backgroundColor: ourColors[Math.floor(Math.random() * ourColors.length)],
        width: sizes.value[0],
        height: sizes.value[0],
        borderRadius: 20,
        position: "absolute",
        left: circleX.value,
        top: circleY.value,
    }));


    const [animationStarted, setAnimationStarted] = useState(false);


    const fallAnimation = () => {
        if (!animationStarted) {
            setAnimationStarted(true);
            setTimeout(() => {
                circleY.value = withSequence(
                    withDelay(
                        Math.random() * 2000,
                        withTiming(height, { duration: 20000 })
                    ), // Slow fall animation
                );
            }, Math.random() * 2000); // Add a random delay before starting the animation
        }
    };

    fallAnimation();

    return (
        <Animated.View style={[styles.bubble, animatedStyle]}>
            <TouchableOpacity
                style={styles.bubbleContent}
                onPress={() => playPreview(recommendation.preview_url)}>
                <Image source={{ uri: recommendation.album.images[0].url }} style={styles.albumArt} />
                <Text style={styles.albumName}>{recommendation.album.name}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        width: 200,
        height: 200,
        borderRadius: 100,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'white',
    },
    bubbleContent: {
        padding: 8,
        alignItems: 'center',
    },
    albumArt: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
    },
    albumName: {
        marginTop: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 150,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default Circle;
