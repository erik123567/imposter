import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue, update,set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig';

const InGame = ({ route }) => {
  const { lobbyCode, playerName, hostName} = route.params;
  const [playerData, setPlayerData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [voting, setVoting] = useState(false);
  const database = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    setIsHost(playerName === hostName); // Adjust hostName retrieval as necessary
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);

    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val();
        if (gameState.players) {
          const currentPlayerData = Object.values(gameState.players).find(player => player.name === playerName);
          if (currentPlayerData) {
            setPlayerData(currentPlayerData);
          }
        }
        if (gameState.voting) {
          console.log(`${playerName} navigating to VotingScreen`);
          setTimeout(() => navigation.navigate('VotingScreen', { lobbyCode, playerName }), 100); // Delay navigation
        }
      }
    });

    return () => unsubscribe();
  }, [lobbyCode, playerName, navigation]);
  

  const endRoundAndStartVoting = async () => {
    if (isHost) {
      console.log('Host attempting to start voting...');
      await set(ref(database, `lobbies/${lobbyCode}/gameState/voting`), true)
        .then(() => console.log('Voting started.'))
        .catch((error) => console.error('Failed to start voting:', error));
    }
  };

//   useEffect(() => {
//     const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
//     console.log(`Setting up voting listener for ${playerName}`); // Debugging line
//     const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
//       const gameState = snapshot.val();
//       console.log(`${playerName} received gameState update:`, gameState); // Debugging line
//       if (gameState?.voting) {
//         console.log(`${playerName} navigating to VotingScreen`); // Debugging line
//         navigation.navigate('VotingScreen', { lobbyCode, playerName });
//       }
//     });

//     return () => {
//         console.log(`${playerName} unsubscribing from gameState updates`); // Debugging line
//         unsubscribeGameState();
//     };
// }, [lobbyCode, playerName, navigation]);


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

   
