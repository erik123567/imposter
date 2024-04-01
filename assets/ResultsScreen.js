import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import { app } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';

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
      <ScrollView style={styles.scrollView}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.pointsHeader]}>Total Points</Text>
            <Text style={[styles.tableHeaderCell, styles.nameHeader]}>Name</Text>
            <Text style={[styles.tableHeaderCell, styles.votesHeader]}>Votes For</Text>
          </View>
          {Object.entries(allPlayers).map(([id, player]) => (
            <View key={id} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.pointsCell]}>
                <Text style={styles.cellText}>{player.points || 0}{player.roundPoints > 0 && ` | (+${player.roundPoints})`}</Text>
              </View>
              <View style={[styles.tableCell, styles.nameCell]}>
                <Text style={styles.cellText}>
                  {player.name}
                  {player.role === 'imposter' && <Text style={styles.imposterText}> --- IMPOSTER</Text>}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.votesCell]}>
                <Text style={styles.cellText}>
                  {player.votesFor || 0}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollView: {
    width: '100%',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // for Android shadow
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E6E6E6', // A slightly different color for header
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderCell: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 5,
    marginTop: 5, // Only add margin to the top for the header
    marginBottom: 0, // Remove the bottom margin so the header connects to rows
  },
  pointsHeader: {
    flex: 1,
  },
  nameHeader: {
    flex: 2,
  },
  votesHeader: {
    flex: 1,
  },
  roundPointsHeader: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCell: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cellText: {
    fontSize: 16,
  },
  pointsCell: {
    flex: 1,
  },
  nameCell: {
    flex: 2,
  },
  votesCell: {
    flex: 1,
  },
  roundPointsCell: {
    flex: 1,
  },
  imposterText: {
    fontWeight: 'bold',
    color: 'red',
  },
});

export default ResultsScreen;
