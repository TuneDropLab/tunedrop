import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Circle = ({ size, color, duration, onPress }: any) => {
    const circleY = useSharedValue(-10);
    const circleX = useSharedValue(3); // Start at the center

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        position: "absolute",
        left: circleX.value,
        top: circleY.value,
    }));

    const [animationStarted, setAnimationStarted] = useState(false);

    const fallAnimation = () => {
        if (!animationStarted) {
            setAnimationStarted(true);
            circleY.value = withSequence(
                withDelay(
                    Math.random() * 2000,
                    withTiming(height, { duration: duration * 2 })
                ), // Slow fall animation
            );
        }
    };

    fallAnimation();

    return (
        <Animated.View
            style={animatedStyle}
            onStartShouldSetResponder={() => true}
            onResponderGrant={onPress}
        />
    );
};

export default Circle;