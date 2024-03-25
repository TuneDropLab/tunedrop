import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const Circle = ({ duration, size, color, left }: any) => {
    const position = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        Animated.timing(position, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.circle,
                {
                    backgroundColor: color,
                    width: size,
                    height: size,
                    left,
                    transform: [
                        {
                            translateY: position.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-size, 1000],
                            }),
                        },
                    ],
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    circle: {
        position: 'absolute',
        borderRadius: 50,
    },
});

export default Circle;