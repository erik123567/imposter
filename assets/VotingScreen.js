import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig';

const VotingScreen = ({ route }) => {
  const { lobbyCode, playerName, hostId, playerId } = route.params;
  const navigation = useNavigation();
  const database = getDatabase(app);
  const [players, setPlayers] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedPlayer, setVotedPlayerId] = useState();


  useEffect(() => {
    const playersRef = ref(database, `lobbies/${lobbyCode}/gameState/players`);
   const listener =  onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const formattedPlayers = Object.keys(playersData).filter((key) => playersData[key].name !== playerName)
          .map((key) => ({ id: key, name: playersData[key].name }));
        setPlayers(formattedPlayers);
      }
    });

    return () => {
      listener();
    };
  }, [lobbyCode, playerName, database]);

  useEffect(() => {
    if (voted) {
      const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
      const checkVotes = onValue(votesRef, (snapshot) => {
        if (snapshot.exists()) {
          const votes = snapshot.val();
          if (Object.keys(votes).length === players.length + 1) { // All players have voted
            // Update game phase to 'results' and navigate
            update(ref(database, `lobbies/${lobbyCode}/gameState`), { phase: 'results' })
              .then(() => navigation.navigate('ResultsScreen', { lobbyCode, playerName,hostId:hostId, playerId:playerId  }))
              .catch(error => console.error("Error updating game phase:", error));
          }
        }
      });

      // Clean up function to detach the listener
      return () => checkVotes();
    }
  }, [voted, players.length, lobbyCode, navigation]); 

  const handleVote = (votedPlayerId) => {
    if (!votedPlayerId) {
      console.error('Voted player ID is undefined');
      return;
    }
    
    if (!hasVoted) {
      const votesRef = ref(database, `lobbies/${lobbyCode}/votes/${playerName}`);
      set(votesRef, votedPlayerId).then(() => {
        // console.log(`${playerName} voted for player ID: ${votedPlayerId}`);
        setHasVoted(true);
        checkAllVotesIn();
        setVoted(true);
        setVotedPlayerId(votedPlayerId);
      }).catch(error => console.error("Error saving vote:", error));

    }
  };

  const checkAllVotesIn = () => {
    if (hasVoted) {
      const votesRef = ref(database, `lobbies/${lobbyCode}/votes`);
      onValue(votesRef, (snapshot) => {
        if (snapshot.exists()) {
          const votes = snapshot.val();
          if (Object.keys(votes).length === Object.keys(players).length + 1) {
            update(ref(database, `lobbies/${lobbyCode}/gameState`), { phase: 'results' })
              .then(() => navigation.navigate('ResultsScreen', { lobbyCode, hostId:hostId, playerName:playerName, playerId:playerId, votedPlayer }))
              .catch(error => console.error("Error updating game phase:", error));
          }
        }
      }, { onlyOnce: true });
    }
  };

  const renderPlayer = ({ item }) => {
    const isSelected = item.id === votedPlayer;
    return (
      <TouchableOpacity
        onPress={() => handleVote(item.id)}
        style={[
          styles.playerButton,
          isSelected ? styles.selectedPlayerButton : styles.unselectedPlayerButton
        ]}
        disabled={hasVoted} // Disable additional votes after the first
      >
        <Text style={styles.playerName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vote for the Imposter</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer} // Use the renderPlayer method
      />
      {hasVoted && <Text>VOTE SENT</Text>}
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
    borderRadius: 5,
  },
  selectedPlayerButton: {
    backgroundColor: '#4CAF50', // Or any color to highlight the selected player
  },
  unselectedPlayerButton: {
    backgroundColor: '#ddd', // Gray out unselected players
  },
  playerName: {
    fontSize: 18,
  },
});

export default VotingScreen;
