import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchTopArtists = async () => {
  const jwtToken = await AsyncStorage.getItem("@jwt");
  if (!jwtToken) {
    throw new Error('Access token not found');
  }

  const response = await fetch('process.env.BASE_URLspotify/top-artists', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch top artists');
  }

  return response.json();
};
  
  export const postData = async (data: any) => {
    // API call to post data
  };
  
  // Add more API functions as needed