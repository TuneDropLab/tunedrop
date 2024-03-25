import React, { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Circle from '../components/MusicBubble';


const HomeScreen = () => {
    const [circles, setCircles] = useState<any>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newCircle = {
                id: Math.random(),
                size: Math.random() * 50,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                duration: Math.random() * 2000 + 2000,
                left: Math.random() * Dimensions.get('window').width,
            };
            setCircles((prevCircles: any) => [...prevCircles, newCircle]);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {circles.map((circle: any) => (
                <Circle
                    key={circle.id}
                    size={circle.size}
                    color={circle.color}
                    duration={circle.duration}
                    left={circle.left}
                />
            ))}
        </View>
    );
};

export default HomeScreen;