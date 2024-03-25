import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

// Firebase configuration and initialization
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

let hostId;

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

  const joinLobby = async (code, playerName) => {
    const lobbyRef = ref(database, `lobbies/${code}`);
    const snapshot = await get(lobbyRef);
    if (snapshot.exists()) {
      const newPlayerId = `player_${new Date().getTime()}`;
      const playerData = { id: newPlayerId, name: playerName, points: 0 };
      await set(ref(database, `lobbies/${code}/players/${newPlayerId}`), playerData);
      return newPlayerId; // Return the playerId to use for navigation
    } else {
      return null; // Lobby does not exist
    }
  };

  const handleJoinLobby = async () => {
    if (!code.trim() || !playerName.trim()) {
      Alert.alert("Error", "Both player name and lobby code are required.");
      return;
    }

    const playerId = await joinLobby(code, playerName);
    if (playerId) {
      navigation.navigate('LobbyScreen', { lobbyCode: code, playerName, playerId, isHost: false, hostId:hostId });
    } else {
      Alert.alert("Error", "Lobby does not exist.");
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

     hostId = `host_${new Date().getTime()}`;
    const lobbyData = {
      host: { id: hostId, name: playerName, points: 0 },
      players: {
        [hostId]: {id: hostId, name: playerName, points: 0 },
      },
      gameState: {
        currentPhase: "lobby",
        votingComplete: false,
        inGame: false,
      },
      createdAt: Date.now(),
    };

    await set(lobbyRef, lobbyData);
    navigation.navigate('LobbyScreen', { lobbyCode: code, playerName, playerId: hostId, hostId:hostId, isHost: true });
  };

  return (
    <>
    <View>
      <Text style={styles.title}>Imposter Syndrome</Text>
    </View>
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
      <Button title="Join Lobby" onPress={handleJoinLobby} disabled={!playerName.trim() || !code.trim()} />
      <Text style={styles.orText}>OR</Text>
      <Button title="Create Lobby" onPress={createLobby} disabled={!playerName.trim()} />
    </View>
    </>
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
  title:{
    fontSize:60,
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  }
});

export default LobbyJoinScreen;
