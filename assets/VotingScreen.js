import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebaseConfig';

const VotingScreen = ({ route, navigation }) => {
  const { lobbyCode, playerName } = route.params;
  const [players, setPlayers] = useState([]);
  const database = getDatabase(app);

  useEffect(() => {
    // Fetch players from the lobby
    const playersRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const filteredPlayers = Object.values(playersData)
          .filter(player => player.name !== playerName) // Exclude the current player from the list
          .map(player => ({ id: player.id, name: player.name }));
        setPlayers(filteredPlayers);
      }
    });

    return () => unsubscribe();
  }, [lobbyCode, playerName]);

  const handleVote = (votedPlayerName) => {
    console.log(`${playerName} voted for ${votedPlayerName}`);
    // Here you would handle the vote logic, such as updating the lobby's gameState with the vote
    // For now, let's navigate back to the lobby or to a results screen
    // navigation.navigate('ResultsScreen', { lobbyCode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vote for the Imposter</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleVote(item.name)} style={styles.playerButton}>
            <Text style={styles.playerName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  playerButton: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  playerName: {
    fontSize: 18,
  },
});

export default VotingScreen;
