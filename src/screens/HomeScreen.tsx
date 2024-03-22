import { Button } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    return (
        <Button
            title="Sign In with Spotify"
            onPress={() => {
                navigation.navigate('OnboardingScreen');

                // Add your sign in with Spotify logic here
            }}
        />
    );
}