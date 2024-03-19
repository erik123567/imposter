import React from 'react';
import HomeScreen from './assets/HomeScreen'; // Make sure the path is correct
import LobbyScreen from './assets/LobbyScreen';
import PayWall from './assets/Paywall';
import InGame from './assets/InGame';
import LobbyJoinScreen from './assets/LobbyJoinScreen';
import VotingScreen from './assets/VotingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="JoinLobby">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="PayWall" component={PayWall} />
        <Stack.Screen name="InGame" component={InGame} />
        <Stack.Screen name="JoinLobby" component={LobbyJoinScreen} />
        <Stack.Screen name="VotingScreen" component={VotingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}