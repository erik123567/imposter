import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const { lobbyCode, playerName, hostId, playerId } = route.params;
  const [allPlayers, setAllPlayers] = useState({});
  const database = getDatabase(app);
  const navigation = useNavigation();
  const [votesProcessed, setVotesProcessed] = useState(false);

  useEffect(() => {
    const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
    const gameRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);

    const voteListener = onValue(votesRef, (snapshot) => {
      const votes = snapshot.val() || {};
      if (!votesProcessed) {
        updatePlayerPoints(votes);
        setVotesProcessed(true); // To prevent re-processing
      }
    });

    const gameListener = onValue(gameRef, (snapshot) => {
      const players = snapshot.val() || {};
      setAllPlayers(players);
    });

    // Cleanup function to unsubscribe
    return () => {
      voteListener();
      gameListener();
    };
  }, [database, lobbyCode, votesProcessed, updatePlayerPoints]);

  const updatePlayerPoints = useCallback((votes) => {
    if (votesProcessed || !votes) return;

    const tally = {};
    // Tallying votes
    Object.values(votes).forEach((vote) => {
      tally[vote] = (tally[vote] || 0) + 1;
    });

    const playersRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);
    get(playersRef).then((snapshot) => {
      if (snapshot.exists()) {
        const players = snapshot.val();
        let imposterId;
        let updatesNeeded = false;
        const updatedPlayers = { ...players };

        // Find the imposter's ID
        Object.values(players).forEach((player) => {
          if (player.role === 'imposter') {
            imposterId = player.id;
          }
        });

        // Update player points based on votes
        Object.keys(updatedPlayers).forEach((playerId) => {
          const player = updatedPlayers[playerId];
          player.votesFor = tally[playerId] || 0;

          if (player.role === 'imposter') {
            if (player.votesFor === 0) {
              player.points = (player.points || 0) + 10;
              updatesNeeded = true;
              player.roundPoints = 10;
            } else if (player.votesFor < Object.keys(players).length / 2) {
              player.points = (player.points || 0) + 5;
              updatesNeeded = true;
              player.roundPoints = 5;
            }
          } else if (votes[player.name] === imposterId) {
            player.points = (player.points || 0) + 3;
            updatesNeeded = true;
            player.roundPoints = 3;
          }
        });

        if (updatesNeeded) {
          update(playersRef, updatedPlayers).then(() => {
            setAllPlayers(updatedPlayers);
          }).catch((error) => {
            console.error("Error updating player points: ", error);
          });
        }
      }
    }).catch((error) => {
      console.error("Error fetching player data: ", error);
    });
  }, [database, lobbyCode, votesProcessed]);

  const startNextRound = async () => {
    // Ensure only the host can start the next round
    if (hostId !== playerId) {
      Alert.alert("Permission Denied", "Only the host can start the next round.");
      return;
    }
  
    // Reset the flag indicating whether votes have been processed
    setVotesProcessed(false);
  
    // Generate new game states, such as words and roles for each player

    const words = ["apple", "banana", "cherry", "date", "elderberry"];
    const randWord = words[Math.floor(Math.random() * words.length)]
    const newPlayerStates = Object.entries(allPlayers).reduce((acc, [id, player], index, array) => {
      const newRole = index === 0 ? "imposter" : "crew"; // Simple role assignment logic
      const newWord = newRole === "imposter" ? "imposter" : randWord;
      
      acc[id] = {
        ...player,
        word: newWord,
        role: newRole,
        votesReceived: 0, // Reset votes received
        roundPoints: 0,   // Reset points for the round
        votesFor: 0       // Reset votes for this player
      };
      return acc;
    }, {});
  
    try {
      // Update the game state in the database for the new round
      await update(ref(database, `lobbies/${lobbyCode}`), {
        votes: {}, // Reset the votes
        gameState: {
          players: newPlayerStates,
          phase: 'inGame', // Set the game phase to in-game
        }
      });
  
      // Navigate to the InGame screen with updated lobby and player information
      navigation.navigate('InGame', { lobbyCode, playerName, hostId, playerId });
  
    } catch (error) {
      Alert.alert("Error", "Failed to start the next round. Please try again.");
      console.error(error);
    }
  };
  

  // Component render UI
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scores Results</Text>
      <View style={styles.tilesContainer}>
        {Object.entries(allPlayers).map(([id, player]) => (
          <View key={id} style={styles.tile}>
            <Text style={styles.tileText}>
              {player.name}: {player.points || 0} points - Votes For{player.roundPoints}: {player.votesFor || 0}
              {player.role === 'imposter' && <Text style={styles.imposterText}>IMPOSTER</Text>}
            </Text>
          </View>
        ))}
      </View>
      {hostId === playerId && (
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tilesContainer: {
    alignSelf: 'center',
  },
  tile: {
    backgroundColor: '#E0E0E0', // Light grey background for each tile
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 18,
  },
  resultText: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default ResultsScreen;
