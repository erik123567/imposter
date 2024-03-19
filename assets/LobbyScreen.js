import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { app } from './firebaseConfig'; // Ensure this points to your actual firebaseConfig file

const LobbyScreen = ({ route, navigation }) => {
  const { lobbyCode, playerName } = route.params;
  const [lobbyData, setLobbyData] = useState({ host: {}, players: {}, gameState: {} });
  const database = getDatabase(app);


  useEffect(() => {
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLobbyData(data);
      } else {
        console.log("Lobby doesn't exist");
        Alert.alert("Error", "Lobby doesn't exist.");
        navigation.goBack();
      }
    });
    return () => unsubscribe();
  }, [lobbyCode, navigation]);
  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      
      // Ensure navigation to InGame only if the game is started AND voting has not begun.
      // This assumes `gameState.voting` becomes true or exists when the voting phase starts.
      // Adjust the condition based on your actual gameState structure.
      if (gameState?.isStarted && !gameState.voting) {
        const currentPlayerId = determineCurrentPlayerId(playerName, lobbyData.players);
  
        if (currentPlayerId !== lobbyData.host.id) {
          console.log('navigating to ingamescreen')
          navigation.navigate('InGame', { lobbyCode: lobbyCode, playerName: playerName, hostName:lobbyData.host.name });
        }
      }
    });
  
    return () => unsubscribeGameState();
  }, [lobbyData, lobbyCode, navigation, playerName]);

  const determineCurrentPlayerId = (name, players) => {
    return Object.keys(players).find(key => players[key].name === name) || '';
  };

  const startGame = async () => {
    // Check if the current player is the host
    const currentPlayerId = determineCurrentPlayerId(playerName, lobbyData.players);
    const isCurrentPlayerHost = currentPlayerId === lobbyData.host.id;

    if (isCurrentPlayerHost) {
      const words = ["apple", "banana", "cherry"]; // Example words
      let updatedPlayers = { ...lobbyData.players };
      const playersKeys = Object.keys(updatedPlayers);

      playersKeys.forEach((key, index) => {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const role = (index === 0) ? "imposter" : "normal"; // Simplified logic for assigning roles
        updatedPlayers[key] = { ...updatedPlayers[key], word: role === "imposter" ? "imposter" : randomWord, role };
      });

      await set(ref(database, `lobbies/${lobbyCode}/gameState`), {
        isStarted: true,
        players: updatedPlayers,
      }).then(() => {
        navigation.navigate('InGame', { lobbyCode: lobbyCode, playerName: playerName, hostName:lobbyData.host.name  });
      }).catch((error) => {
        console.error('Failed to start the game:', error);
        Alert.alert("Error", "Failed to start the game.");
      });
    } else {
      Alert.alert("Not the Host", "Only the host can start the game.");
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.header}>Lobby: {lobbyCode}</Text>
    <Text>Players in lobby:</Text>
    {Object.values(lobbyData.players || {}).map((player, index) => (
    <Text key={index} style={styles.player}>
    {player.name}
    </Text>
    ))}
    {playerName === lobbyData.host.name ? (
    <Button title="Start Game" onPress={startGame} />
    ) : (
    <Text>Waiting for host to start the game...</Text>
    )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    },
    player: {
    fontSize: 18,
    marginVertical: 4,
    },
    });
    
    export default LobbyScreen;
