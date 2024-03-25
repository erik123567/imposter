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
    <>
    <View style={styles.container}>
      <Text style={styles.word}>{playerData.word}</Text>
      {isHost && <Button title="Start Voting" onPress={startVoting} />}
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex to ensure it fills the container but can be centered
    justifyContent: 'center', // Center children vertically
    alignItems: 'center', // Center children horizontally
    alignSelf: 'center', // Center itself in its parent container
    width: '90%', // Take up a majority of screen width
    height: '70%', // Take up a majority of screen height, adjust as per your design
    backgroundColor: 'lightblue', // Background color of the card
    margin: 20, // Margin from the edges of the screen
    padding: 20, // Padding inside the card
    borderRadius: 20, // Rounded corners for the card-like appearance

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Elevation for Android (shadow effect)
    elevation: 5,
  },
  word: {
    fontSize: 32,
    color: '#333', // Ensuring text color is visible on lightblue background
    margin: 10,
    textAlign: 'center', // Center-align the text
  },
});


export default InGame;
