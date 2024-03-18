import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebaseConfig'; // Ensure this points to your actual firebaseConfig file

const LobbyScreen = ({ route, navigation }) => {
  const { lobbyCode, isHost } = route.params; // isHost is passed as true when the host creates the lobby
  const [lobbyData, setLobbyData] = useState({ host: {}, players: [] });
  const database = getDatabase(app);

  useEffect(() => {
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLobbyData({
          host: data.host,
          players: Object.values(data.players || {}),
        });
      } else {
        console.log("Lobby doesn't exist");
        // Optional: Navigate back or show a message
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [lobbyCode]);

  // Example function to start the game (to be implemented)
  const startGame = () => {
    console.log('Game starting...');
    // Here you could update the lobby status to "in game",
    // navigate to a new game screen, etc.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lobby: {lobbyCode}</Text>
      <Text>Players in lobby:</Text>
      {lobbyData.players.map((player, index) => (
        <Text key={index} style={styles.player}>
          {player.name}
        </Text>
      ))}
      {isHost ? (
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
