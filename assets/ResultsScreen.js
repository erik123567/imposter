import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const { lobbyCode, playerName, hostId, playerId } = route.params;
  const [voteResults, setVoteResults] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const database = getDatabase(app);
  const navigation = useNavigation();
  const [allplayers, setPlayers] = useState();

  const isHost = hostId === playerId;


  useEffect(() => {
    const gameRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsub = onValue(gameRef, (snapshot) => {
      const gameState = snapshot.val();
     const players = gameState?.players;
     setPlayers(gameState?.players);

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

    return () => 
    {
      unsub();
    }
  }, [lobbyCode, navigation]);

  const startNextRound = async () => {
    if (!isHost) {
      Alert.alert("Permission Denied", "Only the host can start the next round.");
      return;
    }
    console.log("in here");
    console.log(allplayers);

    const words = ["apple", "banana", "cherry", "date", "elderberry"];
    const playerEntries = Object.entries(allplayers);
    const imposterIndex = Math.floor(Math.random() * playerEntries.length);

    const updatedPlayers = {};
    playerEntries.forEach(([playerId, player], index) => {
      updatedPlayers[playerId] = {
        ...player,
        word: index === imposterIndex ? "imposter" : words[Math.floor(Math.random() * words.length)],
        role: index === imposterIndex ? "imposter" : "crew",
        votesReceived: 0, // Resetting votes received
      };
    });


    try {
      await update(ref(database, `lobbies/${lobbyCode}`), {
          votes: {},
    });
    } catch (error) {
      Alert.alert("Error", "Failed to start the next round. Please try again.");
      console.error(error);
    }

    try {
      await update(ref(database, `lobbies/${lobbyCode}/gameState`), {
        allplayers: updatedPlayers,
        phase: 'inGame',
      });
      navigation.navigate('InGame', { lobbyCode, playerName, hostId, playerId });
    } catch (error) {
      Alert.alert("Error", "Failed to start the next round. Please try again.");
      console.error(error);
    }

  };

  const navigateToLobby = () => {
    navigation.navigate('LobbyScreen', { lobbyCode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voting Results</Text>
      {Object.keys(playerPoints).map((playerId, index) => (
        <Text key={index} style={styles.resultText}>
          {playerId}: {playerPoints[playerId]} point(s)
          {isHost}
        </Text>
      ))}
      {isHost && (
        <Button title="Start Next Round" onPress={startNextRound} />
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
