import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig';

const InGame = ({ route }) => {
  const { lobbyCode, playerName, hostName} = route.params;
  const [playerData, setPlayerData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const database = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val();
        
        // Debugging logs
        console.log("Game State Host Name:", gameState.hostName);
        console.log("Player Name:", playerName);
  
        setIsHost(playerName === hostName); // Adjust according to your data structure
        console.log("Is host:", playerName === hostName); // Debugging log
        console.log(hostName);
  
        const currentPlayerData = Object.values(gameState.players).find(player => player.name === playerName);
        if (currentPlayerData) {
          setPlayerData(currentPlayerData);
        } else {
          Alert.alert("Error", "Player data not found.");
        }
      }
    });
  
    return () => unsubscribe();
  }, [lobbyCode, playerName]);
  

  const endRoundAndStartVoting = async () => {
    if (isHost) {
      await update(ref(database, `lobbies/${lobbyCode}/gameState`), {
        voting: true,
      }).then(() => {
        console.log('Voting started.');
      }).catch((error) => {
        console.error('Failed to start voting:', error);
      });
    } else {
      console.log("Only the host can end the round.");
    }
  };

  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState?.voting) {
        // Navigate to the VotingScreen with lobbyCode and playerName
        navigation.navigate('VotingScreen', { lobbyCode, playerName });
      }
    });

    return () => unsubscribeGameState();
  }, [lobbyCode, playerName, navigation]);

  if (!playerData) {
    return <View style={styles.container}><Text>Loading player data...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text>Your Word: {playerData?.word}</Text>
      {isHost && (
        <Button title="End Round and Start Voting" onPress={endRoundAndStartVoting} />
      )}
      {isHost && <Text>Host</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add any other styles you need here
});

export default InGame;

   
