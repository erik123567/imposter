import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig'; // Adjust this import as necessary

const InGame = ({ route }) => {
  const { lobbyCode, playerName, playerId, hostId } = route.params; // Assuming playerId is passed
  const [playerData, setPlayerData] = useState(null);
  const database = getDatabase(app);
  const navigation = useNavigation();
  const isHost = playerId === route.params.hostId;



  

  useEffect(() => {
    // Use playerId to reference the player's data
    const playerRef = ref(database, `lobbies/${lobbyCode}/gameState/players/${playerId}`); // Adjusted to use playerId
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);

    const playerUnsub = onValue(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        setPlayerData(snapshot.val());
      } else {
        console.error('Player data not found');
      }
    });

    const gameStateUnsub = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState.phase === 'voting') {
        navigation.navigate('VotingScreen', { lobbyCode, playerName, hostId:hostId, playerId:playerId });
      }
    });

    return () => {
      playerUnsub();
      gameStateUnsub();
    };
  }, [lobbyCode, playerName, playerId, navigation]); // Include playerId in the dependency array

  const startVoting = () => {
    if (isHost) {
      update(ref(database, `lobbies/${lobbyCode}/gameState`), {
        phase: 'voting'
      }).catch(error => console.error('Failed to transition to voting:', error));
    } else {
      Alert.alert('Error', 'Only the host can initiate the voting phase.');
    }
  };

  if (!playerData) {
    return <View style={styles.container}><Text>Loading player data...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text>Your Word: {playerData.word}</Text>
      {isHost && <Button title="Start Voting" onPress={startVoting} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InGame;
