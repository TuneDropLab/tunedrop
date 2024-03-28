import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '../context/AuthContext';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

function ProfileScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const { signOut } = useAuthStore();
    const handleSignOut = () => {
        Alert.alert(
            'Confirm ',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: () => {
                        // Logic to sign out the user
                        // This can include clearing user session, redirecting, etc.
                        signOut();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'SignInScreen' }],
                        });
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile Page</Text>
            <Button title="Sign Out" onPress={handleSignOut} />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'yellow'
    },
    text: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20
    },
    button: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5
    }
});

export default ProfileScreen;