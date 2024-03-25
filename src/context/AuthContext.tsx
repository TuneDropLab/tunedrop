import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface AuthContextType {
    isSignedIn: boolean;
    checkSignIn: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
    isSignedIn: false,
    checkSignIn: () => { },
});

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isSignedIn, setIsSignedIn] = useState(false);

    // Function to call the API and update the isSignedIn state
    const checkSignIn = async () => {
        try {
            // Replace 'yourApiEndpoint' with your actual API endpoint
            const response = await fetch('yourApiEndpoint');
            const data = await response.json();
            setIsSignedIn(data.isSignedIn); // Assuming the API returns an object with an isSignedIn boolean
        } catch (error) {
            console.error('Failed to fetch sign-in status:', error);
        }
    };

    // Call checkSignIn when the component mounts
    useEffect(() => {
        checkSignIn();
    }, []);

    return (
        <AuthContext.Provider value={{ isSignedIn, checkSignIn }}>
            {children}
        </AuthContext.Provider>
    );
};