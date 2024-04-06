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
    //console.log(playerId);
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, snapshot => {
      if (snapshot.exists()) {
        setLobbyData(snapshot.val());
      } else {
        Alert.alert("Error", "Lobby doesn't exist.");
        navigation.goBack();
      }
    });
    console.log(lobbyData.players)
    Object.entries(lobbyData.players || {}).forEach(([key, player]) => {
      console.log(player);
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
      let word = words[Math.floor(Math.random() * words.length)];
      playerEntries.forEach(([id, player], index) => {
        
        updatedPlayers[id] = {
          ...player,
          word: index === imposterIndex ? "imposter" : word,
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
    <>
    <View style={styles.container}>
  <Text style={styles.header}>Lobby: {lobbyCode}</Text>
  {Object.entries(lobbyData?.players || {}).map(([key, player]) => (
  <View style={player.id === playerId ? styles.selectedtile : styles.tile} key={key}> 
    <Text style={{fontSize: 24, fontWeight: player.id === playerId ? 'bold' : 'normal'}}>{player.name}</Text>
  </View>
))}
  {isHost && <Button title="Start Game" onPress={startGame} />}
  {!isHost && <Text>Waiting for the host to start the game...</Text>}
  </View>
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex to ensure it fills the container but can be centered
    justifyContent: 'center', // Center children vertically
    alignItems: 'center', // Center children horizontally
    alignSelf: 'center', // Center itself in its parent container
    width: '90%', // Take up a majority of screen width
    height: '70%', // Take up a majority of screen height, adjust as per your design
    backgroundColor: 'lightblue', // Background color of the card
    margin: 20, // Margin from the edges of the screen
    padding: 20, // Padding inside the card
    borderRadius: 20, // Rounded corners for the card-like appearance
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
  selectedtile: {
    width: '48%', // Adjust based on your needs
    height: 100, // Fixed height, can be adjusted
    backgroundColor: '#4D9DE9', // Background color for selected tile
    margin: '10px', // Margin to create gaps between tiles
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    borderRadius: 10, // Rounded corners
    borderWidth: 4, // Thickness of the border
    borderColor: 'black', // Color of the border, choose what stands out
    shadowColor: "#000", // Shadow color
  shadowOffset: {
    width: 0, // Horizontal shadow offset
    height: 2, // Vertical shadow offset
  },
  shadowOpacity: 0.25, // Shadow opacity
  shadowRadius: 3.84, // Shadow blur radius

  elevation: 5
  },
});

export default LobbyScreen;
