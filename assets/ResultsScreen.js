import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const { lobbyCode, playerName } = route.params;
  const [voteResults, setVoteResults] = useState({});
  const [players, setPlayers] = useState({});
  const [isHost, setIsHost] = useState(false);
  const database = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    const hostRef = ref(database, `lobbies/${lobbyCode}/host/name`);
    onValue(hostRef, (snapshot) => {
      const hostName = snapshot.val();
      console.log("hostname" + hostName);
      setIsHost(playerName === hostName);
      console.log(playerName + " " + hostName);
    });
  }, [lobbyCode, playerName]);

  useEffect(() => {
    const playersRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);
    onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.val());
      }
    });
  }, [lobbyCode]);

  useEffect(() => {
    const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
    onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        const votes = snapshot.val();
        const tally = {};
        for (const vote of Object.values(votes)) {
          const votedPlayerName = players[vote]?.name || 'Unknown';
          tally[votedPlayerName] = (tally[votedPlayerName] || 0) + 1;
        }
        setVoteResults(tally);
      }
    });
  }, [lobbyCode, players]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voting Results</Text>
      {Object.entries(voteResults).map(([playerName, votes], index) => (
        <Text key={index} style={styles.resultText}>
          {playerName}: {votes} vote(s)
        </Text>
      ))}
      {isHost && (
        <Button
          title="Start Next Round"
          onPress={() => navigation.navigate('LobbyScreen', { lobbyCode })}
        />
      )}
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
