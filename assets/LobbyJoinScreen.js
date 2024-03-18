import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { getDatabase, ref, set, get } from 'firebase/database'; // Import Firebase functions
import { app } from './firebaseConfig'; // Import the initialized app
import { useNavigation } from '@react-navigation/native'; // Import useNavigation


// Initialize the database
const database = getDatabase(app);

const LobbyJoinScreen = () => {
  const [code, setCode] = useState('');
  const navigation = useNavigation(); // Hook for navigation


  const playerDetails = {
    id: 'player123' + Math.floor(Math.random() * 10000), // Ensure this is unique
    name: 'Player Name' + Math.floor(Math.random() * 10000)
  };

  const handleJoinLobby = async () => {
    // Assume joinLobby is an async operation
    try {
      await joinLobby(code, playerDetails); // Your existing join logic
      // Navigate to LobbyScreen with lobbyCode
      navigation.navigate('Lobby', { lobbyCode: code });
    } catch (error) {
      console.error('Error joining lobby:', error);
    }
  };

  // Function to join a lobby with a given code
  const joinLobby = async (code, playerDetails) => {
    const lobbyRef = ref(database, `lobbies/${code}`);
  
    try {
      const snapshot = await get(lobbyRef);
      if (snapshot.exists()) {
        // Lobby exists, add or update the player in the lobby
        const playersRef = ref(database, `lobbies/${code}/players/${playerDetails.id}`);
        
        await set(playersRef, playerDetails); // Directly set the player's details
        console.log(`Player ${playerDetails.id} joined lobby ${code}`);
      } else {
        console.log('Lobby does not exist.');
      }
    } catch (error) {
      console.error('Failed to join lobby:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Lobby Code"
        value={code}
        onChangeText={setCode}
      />
      <Button title="Join Lobby" onPress={handleJoinLobby} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});

export default LobbyJoinScreen;
