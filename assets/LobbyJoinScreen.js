import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

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
initializeApp(firebaseConfig);
const database = getDatabase();
const generateLobbyCode = () => {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += Math.floor(Math.random() * 10); // Generates a number between 0 and 9
  }
  return code;
};

const LobbyJoinScreen = () => {
  const [code, setCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const navigation = useNavigation();

  const handleJoinLobby = async () => {
    if (!code.trim() || !playerName.trim()) {
      Alert.alert("Error", "Both player name and lobby code are required.");
      return;
    }

    // Unique ID generation for each player could be improved, for example, by using Firebase Authentication UID
    const playerDetails = {
      id: `player_${new Date().getTime()}`,
      name: playerName,
    };

    try {
      const lobbyExists = await joinLobby(code, playerDetails);
      if (lobbyExists) {
        navigation.navigate('Lobby', { lobbyCode: code, playerName: playerName, isHost: false });
      } else {
        Alert.alert("Error", "Lobby does not exist.");
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
      Alert.alert("Error", "Failed to join the lobby.");
    }
  };

  const joinLobby = async (code, playerDetails) => {
    const lobbyRef = ref(database, `lobbies/${code}`);

    const snapshot = await get(lobbyRef);
    if (snapshot.exists()) {
      const playersRef = ref(database, `lobbies/${code}/players/${playerDetails.id}`);
      await set(playersRef, playerDetails);
      console.log(`Player ${playerDetails.name} joined lobby ${code}`);
      return true;
    } else {
      return false;
    }
  };

  const createLobby = async () => {
    let code = generateLobbyCode();
    let lobbyRef = ref(database, `lobbies/${code}`);
    let snapshot = await get(lobbyRef);

    while (snapshot.exists()) {
      code = generateLobbyCode();
      lobbyRef = ref(database, `lobbies/${code}`);
      snapshot = await get(lobbyRef);
    }

    const hostDetails = {
      id: `host_${new Date().getTime()}`,
      name: playerName,
    };

    await set(lobbyRef, {
      host: hostDetails,
      players: {
        [hostDetails.id]: hostDetails,
      },
      createdAt: Date.now(),
    });

    console.log('Lobby created with code:', code);
    navigation.navigate('Lobby', { lobbyCode: code, playerName: playerName, isHost: true });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Player Name"
        value={playerName}
        onChangeText={setPlayerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Lobby Code (to join)"
        value={code}
        onChangeText={setCode}
      />
      <Button title="Join Lobby" onPress={handleJoinLobby} disabled={!playerName.trim()} />
      <Text style={styles.orText}>OR</Text>
      <Button title="Create Lobby" onPress={createLobby} disabled={!playerName.trim()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  orText: {
    marginVertical: 20,
    fontSize: 16,
  },
});

export default LobbyJoinScreen;
