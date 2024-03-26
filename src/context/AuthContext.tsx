// src/store/auth.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
    isSignedIn: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
    isSignedIn: false,
    signIn: async () => {
        // Your sign-in logic here...
        const jwt = await AsyncStorage.getItem('@jwt');
        if (jwt !== null && jwt !== "") {
            await AsyncStorage.setItem('isSignedIn', 'true');
            set({ isSignedIn: true });
        }
    },
    signOut: async () => {
        try {
            await AsyncStorage.removeItem('@jwt');
            await AsyncStorage.setItem('isSignedIn', 'false');
            set({ isSignedIn: false });
            return true;
        } catch (error) {
            return false;
        }
    },
}));

// Load persisted state from AsyncStorage when the store is initialized
(async () => {
    const isSignedIn = await AsyncStorage.getItem('isSignedIn');
    if (isSignedIn === 'true') {
        useAuthStore.setState({ isSignedIn: true });
    }
})();