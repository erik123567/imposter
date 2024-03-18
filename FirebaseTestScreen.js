// FirebaseTestScreen.js
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database'; // Ensure 'get' is imported


const firebaseConfig = {
    apiKey: "AIzaSyBMJlsG1yZruHcpBR4814NQSE968NgTeXw",
    authDomain: "imposter-57927.firebaseapp.com",
    databaseURL: "https://imposter-57927-default-rtdb.firebaseio.com",
    projectId: "imposter-57927",
    storageBucket: "imposter-57927.appspot.com",
    messagingSenderId: "438163133710",
    appId: "1:438163133710:web:5355943ed5d1a9e337f35f",
    measurementId: "G-SV3XXY8SKT"
  };
  const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
  // Function to generate a unique 5-digit code
const generateLobbyCode = () => {
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += Math.floor(Math.random() * 10); // Generates a number between 0 and 9
    }
    return code;
  };
  

  const createLobby = async () => {
    let isUnique = false;
    let code;
  
    while (!isUnique) {
      code = generateLobbyCode();
      const lobbyRef = ref(database, 'lobbies/' + code);
  
      // Check if the code already exists
      const snapshot = await get(lobbyRef);
      if (!snapshot.exists()) {
        isUnique = true;
        // Code is unique, so create the lobby
        set(lobbyRef, {
          // Lobby details here, e.g., host information, players, etc.
          createdAt: Date.now(),
        }).then(() => console.log('Lobby created with code:', code))
          .catch((error) => console.error('Failed to create lobby: ', error));
      }
    }
  };

// Initialize Firebase

// Function to add a test entry
const addTestEntry = () => {
  const now = Date.now();
  set(ref(database, 'test/' + now), {
    timestamp: now,
    message: 'Hello, Firebase!'
  }).then(() => console.log('Data written successfully!'))
    .catch((error) => console.error('Failed to write data: ', error));
};

// Function to listen for test entries
const listenForTestEntries = () => {
  const testRef = ref(database, 'test/');
  onValue(testRef, (snapshot) => {
    if (snapshot.exists()) {
      console.log('Received data: ', snapshot.val());
    } else {
      console.log('No data available');
    }
  }, {
    onlyOnce: true // Remove this option if you want to keep listening for changes
  });
};

// The React component
export default function FirebaseTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Firebase Test</Text>
      <Button title="Add Test Entry" onPress={addTestEntry} />
      <Button title="Listen For Test Entries" onPress={listenForTestEntries} />
      <Button title="Create lobby" onPress={createLobby} />
    </View>
  );
}

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
  },
});
