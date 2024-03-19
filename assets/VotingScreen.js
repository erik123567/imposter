import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const VotingScreen = ({ route }) => {
  const { lobbyCode, playerName } = route.params;
  const [players, setPlayers] = useState([]); // Filtered players
  const [totalPlayers, setTotalPlayers] = useState(0); // Total players
  const navigation = useNavigation();
  const database = getDatabase(app);

  useEffect(() => {
    // Fetch all players to determine the total count
    const playersRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);
    onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const allPlayers = Object.values(playersData);
        setTotalPlayers(allPlayers.length); // Set total number of players
        const filteredPlayers = allPlayers
          .filter(player => player.name !== playerName) 
          .map(player => ({ id: player.id, name: player.name }));
        setPlayers(filteredPlayers); // Set filtered players
      }
    });
  }, [lobbyCode, playerName, database]);

  useEffect(() => {
    // Listen for changes in the votes
    const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
    onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        const votes = snapshot.val();
        const voteCount = Object.keys(votes).length;
        
        // Check if all players have voted, including the current player
        if (voteCount === totalPlayers) {
          console.log("All votes are in, navigating to ResultsScreen");
          navigation.navigate('ResultsScreen', { lobbyCode });
        }
      }
    });
  }, [totalPlayers, lobbyCode, navigation, database]);

  const handleVote = (votedPlayerId) => {
    const voteRef = ref(database, `lobbies/${lobbyCode}/votes/${playerName}`);
    set(voteRef, votedPlayerId)
      .then(() => console.log(`${playerName} voted for ${votedPlayerId}`))
      .catch((error) => console.error("Error saving vote:", error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vote for the Imposter</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleVote(item.id)} style={styles.playerButton}>
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
