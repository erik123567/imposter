import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation


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

// Initialize Firebase and get a reference to the database
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

// Function to create a lobby with host details

// Function to add a test entry to the database
const addTestEntry = () => {
  const now = Date.now();
  set(ref(database, 'test/' + now), {
    timestamp: now,
    message: 'Hello, Firebase!'
  }).then(() => console.log('Data written successfully!'))
    .catch((error) => console.error('Failed to write data: ', error));
};

// Function to listen for test entries in the database
const listenForTestEntries = () => {
  const testRef = ref(database, 'test/');
  onValue(testRef, (snapshot) => {
    if (snapshot.exists()) {
      console.log('Received data: ', snapshot.val());
    } else {
      console.log('No data available');
    }
  }, {
    onlyOnce: true
  });
};

// The React component for the Firebase Test Screen
export default function FirebaseTestScreen() {
  const [lobbyCode, setLobbyCode] = useState('');
  const navigation = useNavigation(); // Use the useNavigation hook
  const createLobby = async () => {
    let isUnique = false;
    let code;

    while (!isUnique) {
      code = generateLobbyCode();
      const lobbyRef = ref(database, `lobbies/${code}`);

      const snapshot = await get(lobbyRef);
      if (!snapshot.exists()) {
        isUnique = true;
        const hostDetails = {
          id: "host_" + Math.random().toString(36).substr(2, 9),
          name: "Host Name",
        };

        await set(lobbyRef, {
          host: hostDetails,
          players: {
            [hostDetails.id]: hostDetails,
          },
          createdAt: Date.now(),
        });

        console.log('Lobby created with code:', code);
        navigation.navigate('Lobby', { lobbyCode: code, isHost: true }); // Navigate to the LobbyScreen as host
        return; // Stop the function execution after successful navigation
      }
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Firebase Test</Text>
      <Button title="Add Test Entry" onPress={addTestEntry} />
      <Button title="Listen For Test Entries" onPress={listenForTestEntries} />
      <TextInput
        style={styles.input}
        placeholder="Enter Lobby Code"
        value={lobbyCode}
        onChangeText={setLobbyCode}
      />
      <Button title="Create Lobby" onPress={createLobby} />
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});
