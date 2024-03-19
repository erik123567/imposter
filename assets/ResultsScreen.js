import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const { lobbyCode } = route.params;
  const [voteResults, setVoteResults] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [isHost, setIsHost] = useState(false);
  const database = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    const gameRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    onValue(gameRef, (snapshot) => {
      const gameState = snapshot.val();
      const hostName = gameState?.host?.name;
      const players = gameState?.players;
      setIsHost(route.params.playerName === hostName);

      const votes = gameState?.votes;
      const tally = {};
      let imposterVotes = 0;

      // Count votes for each player
      Object.values(votes || {}).forEach(vote => {
        tally[vote] = (tally[vote] || 0) + 1;
      });

      // Calculate points for imposter(s) and players
      const newPlayerPoints = {};
      Object.keys(players).forEach((playerId) => {
        const player = players[playerId];
        const playerVoteCount = tally[playerId] || 0;
        let points = playerPoints[playerId] || 0;

        if (player.role === 'imposter') {
          imposterVotes += playerVoteCount;
          if (playerVoteCount === 0) {
            points += 10; // Imposter got no votes
          } else if (playerVoteCount < Object.keys(players).length / 2) {
            points += 5; // Imposter got less than majority votes
          }
        } else if (playerVoteCount > 0 && votes[playerName] === playerId) {
          points += 3; // Player correctly guessed the imposter
        }
        newPlayerPoints[playerId] = points;
      });

      setVoteResults(tally);
      setPlayerPoints(newPlayerPoints);

      // Update points in database
      Object.keys(newPlayerPoints).forEach((playerId) => {
        update(ref(database, `lobbies/${lobbyCode}/gameState/players/${playerId}`), {
          points: newPlayerPoints[playerId]
        });
      });
    });

    return () => gameRef.off('value');
  }, [lobbyCode, navigation]);

  const navigateToLobby = () => {
    navigation.navigate('LobbyScreen', { lobbyCode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voting Results</Text>
      {Object.keys(playerPoints).map((playerId, index) => (
        <Text key={index} style={styles.resultText}>
          {playerId}: {playerPoints[playerId]} point(s)
        </Text>
      ))}
      {isHost && (
        <Button title="Start Next Round" onPress={navigateToLobby} />
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
    marginVertical: 5,
  },
});

export default ResultsScreen;
