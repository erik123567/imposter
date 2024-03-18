import React from 'react';
import HomeScreen from './assets/HomeScreen'; // Make sure the path is correct
import LobbyScreen from './assets/LobbyScreen';
import PayWall from './assets/Paywall';
import FirebaseTestScreen from './FirebaseTestScreen';
import GameScreen from './assets/GameScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TestScreen">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="PayWall" component={PayWall} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="TestScreen" component={FirebaseTestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}