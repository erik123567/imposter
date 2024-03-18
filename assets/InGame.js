import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebaseConfig';

const InGame = ({ route }) => {
  const { lobbyCode, playerName } = route.params;
  const [playerData, setPlayerData] = useState(null);
  const database = getDatabase(app);

  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val();
        console.log("Game State:", gameState); // Debugging line

        if (gameState.isStarted) {
          const allPlayersData = gameState.players;
          console.log("All Players Data:", allPlayersData); // Debugging line

          // Debugging: Confirming the playerName received matches expected
          console.log("Looking for player:", playerName);

          const currentPlayerData = Object.values(allPlayersData).find(player => player.name === playerName);
          console.log("Current Player Data:", currentPlayerData); // Debugging line

          if (currentPlayerData) {
            setPlayerData(currentPlayerData);
          } else {
            Alert.alert("Error", "Player data not found.");
          }
        }
      } else {
        console.log("No game state found.");
      }
    });

    return () => unsubscribe();
  }, [lobbyCode, playerName]);

  if (!playerData) {
    return <View style={styles.container}><Text>Loading player data...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Role: {playerData.role}</Text>
      <Text>Your Word: {playerData.word}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default InGame;
