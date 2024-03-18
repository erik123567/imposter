import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';

const LobbyScreen = ({ route }) => {
  const [lobbyData, setLobbyData] = useState({ name: '', players: [] });
  const { lobbyCode } = route.params; // Assuming you pass the lobbyCode when navigating to this screen

  useEffect(() => {
    const database = getDatabase();
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);

    // Listen for updates to the lobby data
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLobbyData({
          name: data.name, // Assuming your lobby has a 'name' field
          players: data.players ? Object.values(data.players) : [] // Convert players object to array
        });
      } else {
        console.log("Lobby doesn't exist");
        // Handle lobby not existing, e.g., navigate back
      }
    });

    // Clean up listener
    return () => unsubscribe();
  }, [lobbyCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.lobbyName}>Lobby: {lobbyData.name}</Text>
      <FlatList
        data={lobbyData.players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.player}>{item.name}</Text> // Adjust based on how you store player data
        )}
      />
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
  lobbyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  player: {
    fontSize: 18,
    marginVertical: 4,
  },
});

export default LobbyScreen;
