import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image} from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';


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
const titleImage = require("./titleImage.png")
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
  const [errors, setErrors] = useState(null);

  const joinLobby = async (code, playerName) => {
    setErrors(null); // Clear previous errors
    const lobbyRef = ref(database, `lobbies/${code}`);
    const snapshot = await get(lobbyRef);
    if (snapshot.exists()) {
      const lobbyData = snapshot.val();
  
      // Check if the playerName already exists in the lobby
      const playerNames = lobbyData.players ? Object.values(lobbyData.players).map(player => player.name) : [];
      if (playerNames.includes(playerName)) {
        setErrors("Name is taken");
        console.log('Name is already taken'); // Log error or you can choose to throw an error
        return null; // Indicates the playerName is already taken
      }
  
      const newPlayerId = `player_${new Date().getTime()}`;
      const playerData = { id: newPlayerId, name: playerName, points: 0 };
      await set(ref(database, `lobbies/${code}/players/${newPlayerId}`), playerData);
      return newPlayerId; // Return the playerId to use for navigation
    } else {
      setErrors("Lobby does not exist"); // Set error for non-existing lobby
      console.log('Lobby does not exist'); // Log error or you can choose to throw an error
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
      expiresAt: Date.now() + (24 * 60 * 60 * 1000),  
    };

    await set(lobbyRef, lobbyData);
    navigation.navigate('LobbyScreen', { lobbyCode: code, playerName, playerId: hostId, hostId:hostId, isHost: true });
  };

  return (
    <LinearGradient
      colors={['#14678B', '#4C1C4A']}
      style={styles.container}
    >
      <Image 
      source={titleImage}
      style={styles.titleImage}></Image>
      <View style={styles.overlayContainer}>
        {errors && <Text style={styles.errors}>{errors}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor="gray"
          placeholder="Player Name"
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="gray"
          placeholder="Lobby Code (to join)"
          value={code}
          onChangeText={setCode}
        />
        <Button title="Join Lobby" onPress={handleJoinLobby} disabled={!playerName.trim() || !code.trim()} />
        <View style={{height: 1, backgroundColor: 'black', width: '80%', margin: 10, height: '3px'}} />
        <Button title="Create Lobby" onPress={createLobby} disabled={!playerName.trim()} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Aligns children to the top of the container
    marginTop: 0, // Make sure there's no top margin pushing everything down
    paddingTop: 0, // Ensure there's no padding adding space at the top
    width: '100%', // Ensure container takes full width
  },
  titleImage: {
    width: '100%', // Ensures the image stretches across the full width of the screen
    height: '30%', // Adjust this height to fit the size of your image accordingly
    resizeMode: 'contain',
    marginTop: 0,
    marginBottom: 0, // Set this to '0' to remove space below the image
  },
  overlayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    flex: 1, // Do not allow the container to grow
    marginTop: 10, // Adjust this as needed to move the container up towards the title image
    justifyContent:'center'
    // Other styles as needed
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
    textAlign: 'center',
  },
  orText: {
    marginVertical: 20,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  errors: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LobbyJoinScreen;