// AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';




const AuthContext = createContext({
    isSignedIn: false,
    signIn: () => { },
    signOut: () => { },

});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const [isSignedIn, setIsSignedIn] = useState(false); // Initialize with false

    const signIn = async () => {

        const jwt = await AsyncStorage.getItem('@jwt');
        if (jwt !== null && jwt !== "") {
            console.log("Retrieved JWT: ", jwt);
            setIsSignedIn(true);
            console.log("ISSIGNEDIN FROM SIGNIN FUNCTION: ", isSignedIn);
            navigation.navigate('HomeScreen');
        }
        console.log("SIGN IN JWT FROM CONTEXT IS ", jwt);
    };

    useEffect(() => {
        const checkSignInStatus = async () => {
            const jwtToken = await AsyncStorage.getItem('@jwt');
            console.log("JWT TOKEN FROM STORAGE", jwtToken);
            console.log("IS SIGNED IN", isSignedIn);
            if (jwtToken && jwtToken !== "") {
                setIsSignedIn(true);
                // navigation.navigate('HomeScreen');
            }
            console.log("IS SIGNED IN", isSignedIn);
        };

        checkSignInStatus();
    }, []);
    

    const signOut = async () => {
        // Logic to set isSignedIn to false
        // check if jwt is in async storage and remove it
        await AsyncStorage.removeItem('@jwt');
        const jwt = await AsyncStorage.getItem('@jwt');
        // navigate to sign in page
        navigation.navigate('SignInScreen');
        console.log("SIGN OUT JWT FROM CONTEXT IS ", jwt);
        setIsSignedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};