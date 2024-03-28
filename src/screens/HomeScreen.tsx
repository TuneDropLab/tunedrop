import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Circle from '../components/MusicBubble';


type Recommendation = {
  preview_url: string;
  album: {
    images: { url: string; }[];
    name: string;
  };
};

const { height } = Dimensions.get('window');
const colors = ['#d5523c', '#e68a02', '#fdb800', '#8A2BE2', '#8ea471'];

const HomeScreen = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [playedSongs, setPlayedSongs] = useState<string[]>([]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('@jwt');
      console.log('JWT', jwtToken);
      if (!jwtToken) {
        throw new Error('Access token not found');
      }

      const response = await fetch('http://localhost:3000/spotify/recommendations', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Recommendations:', data);
        const newRecommendations = data.filter(
          (recommendation: any) => !playedSongs.includes(recommendation.preview_url)
        );
        setRecommendations((prevRecommendations) => [...prevRecommendations, ...newRecommendations]);
      } else {
        console.error('Failed to fetch recommendations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [playedSongs]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (recommendations.length < 4) {
      fetchRecommendations();
    }
  }, [recommendations, fetchRecommendations]);

  const playPreview = async (previewUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: previewUrl });
      await sound.playAsync();
      setPlayedSongs((prevPlayedSongs) => [...prevPlayedSongs, previewUrl]);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };


  

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ff00cc', '#333399', '#ff00cc']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {recommendations.map((recommendation, index) => (
        <Circle
          key={index}
          recommendation={recommendation}
          playPreview={playPreview}
        />
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
});

export default HomeScreen;
