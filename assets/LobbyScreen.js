import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig';

const LobbyScreen = ({ route }) => {
  const { lobbyCode, playerName, isHost, playerId, hostId } = route.params;
  const [lobbyData, setLobbyData] = useState({ host: {}, players: {} });
  const navigation = useNavigation();
  const database = getDatabase(app);

  useEffect(() => {
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, snapshot => {
      if (snapshot.exists()) {
        setLobbyData(snapshot.val());
      } else {
        Alert.alert("Error", "Lobby doesn't exist.");
        navigation.goBack();
      }
    });
    return unsubscribe;
  }, [lobbyCode, navigation]);

  // Monitor changes to gameState
  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState && gameState.phase === "inGame") {
        navigation.navigate('InGame', { lobbyCode :lobbyCode, playerName: playerName, isHost: isHost, playerId:playerId, hostId:hostId });
      }
    });
    return () => unsubscribeGameState();
  }, [lobbyCode, playerName, navigation, isHost]);

  const startGame = async () => {
    if (isHost) {
      // Logic to assign words and roles to players
      const words = ["apple", "banana", "cherry", "date", "elderberry"];
      const playerEntries = Object.entries(lobbyData.players);
      const imposterIndex = Math.floor(Math.random() * playerEntries.length);
      let updatedPlayers = {};

      playerEntries.forEach(([id, player], index) => {
        updatedPlayers[id] = {
          ...player,
          word: index === imposterIndex ? "imposter" : words[Math.floor(Math.random() * words.length)],
          role: index === imposterIndex ? "imposter" : "crew"
        };
      });

      // Update gameState to inGame and assign words and roles
      await update(ref(database, `lobbies/${lobbyCode}`), {
        gameState: {
          phase: "inGame",
          players: updatedPlayers
        }
      }).catch(error => {
        Alert.alert("Error", "Failed to start the game.");
        console.error('Failed to start the game:', error);
      });
    } else {
      Alert.alert("Error", "Only the host can start the game.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lobby: {lobbyCode}</Text>
      <Text>Players:</Text>
      {Object.entries(lobbyData.players || {}).map(([key, player], index) => (
        <View style={styles.tile}>
        <Text style={{fontSize:24}} key={index}>{player.name}</Text>
        </View>
      ))}
      {isHost && <Button title="Start Game" onPress={startGame} />}
      {!isHost && <Text>Waiting for the host to start the game...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  tile: {
    width: '48%', // Almost half the container width - adjust based on your spacing needs
    height: 100, // Fixed height, but can be adjusted or made responsive
    backgroundColor: '#4D9DE0', // Tile background color
    margin: '10px', // Small margin to create gaps between tiles
    justifyContent: 'center', // Center content vertically within the tile
    alignItems: 'center', // Center content horizontally within the tile
    borderRadius: 10,
  },
});

export default LobbyScreen;
