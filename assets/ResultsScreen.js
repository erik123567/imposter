import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebaseConfig';

const ResultsScreen = ({ route, navigation }) => {
  const { lobbyCode } = route.params;
  const [voteResults, setVoteResults] = useState({});
  const database = getDatabase(app);

  useEffect(() => {
    const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
    onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        const votes = snapshot.val();
        // Tally votes
        const tally = Object.values(votes).reduce((acc, votedPlayerId) => {
          acc[votedPlayerId] = (acc[votedPlayerId] || 0) + 1;
          return acc;
        }, {});

        setVoteResults(tally);
      }
    });
  }, [lobbyCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voting Results</Text>
      {Object.entries(voteResults).map(([playerId, votes], index) => (
        <Text key={index} style={styles.resultText}>
          Player ID: {playerId} - Votes: {votes}
        </Text>
      ))}
      <Button title="Start Next Round" onPress={() => navigation.navigate('LobbyScreen', { lobbyCode })} />
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
  resultText: {
    fontSize: 18,
    margin: 5,
  },
});

export default ResultsScreen;
