import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { app } from './firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const LobbyScreen = ({ route }) => {
  const { lobbyCode, playerName, isHost, playerId, hostId } = route.params;
  const [lobbyData, setLobbyData] = useState({ host: {}, players: {} });
  const navigation = useNavigation();
  const database = getDatabase(app);

  useEffect(() => {
    const lobbyRef = ref(database, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, snapshot => {
      if (snapshot.exists()) {
        setLobbyData(snapshot.val());
      } else {
        Alert.alert("Error", "Lobby doesn't exist.");
        navigation.goBack();
      }
    });
    return unsubscribe;
  }, [lobbyCode, navigation]);

  useEffect(() => {
    const gameStateRef = ref(database, `lobbies/${lobbyCode}/gameState`);
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState && gameState.phase === "inGame") {
        navigation.navigate('InGame', { lobbyCode :lobbyCode, playerName: playerName, isHost: isHost, playerId:playerId, hostId:hostId });
      }
    });
    return () => unsubscribeGameState();
  }, [lobbyCode, playerName, navigation, isHost]);

  const startGame = async () => {
    if (isHost) {
      const words = ["apple", "banana", "cherry", "date", "elderberry"];
      const playerEntries = Object.entries(lobbyData.players);
      const imposterIndex = Math.floor(Math.random() * playerEntries.length);
      let updatedPlayers = {};
      let word = words[Math.floor(Math.random() * words.length)];
      playerEntries.forEach(([id, player], index) => {
        updatedPlayers[id] = {
          ...player,
          word: index === imposterIndex ? "imposter" : word,
          role: index === imposterIndex ? "imposter" : "crew"
        };
      });
      await update(ref(database, `lobbies/${lobbyCode}`), {
        gameState: {
          phase: "inGame",
          players: updatedPlayers
        }
      }).catch(error => {
        Alert.alert("Error", "Failed to start the game.");
        console.error('Failed to start the game:', error);
      });
    } else {
      Alert.alert("Error", "Only the host can start the game.");
    }
  };

  return (
    <LinearGradient
      colors={['#14678B', '#4C1C4A']}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Lobby: {lobbyCode}</Text>
        <View style={styles.playerContainer}>
          {Object.entries(lobbyData?.players || {}).map(([key, player]) => (
            <View style={styles.tileContainer} key={key}> 
              <View style={player.id === playerId ? styles.selectedtile : styles.tile}>
                <Text style={{fontSize: 24, fontWeight: player.id === playerId ? 'bold' : 'normal'}}>{player.name}</Text>
              </View>
            </View>
          ))}
        </View>
        {isHost && <Button title="Start Game" onPress={startGame} />}
        {!isHost && <Text>Waiting for the host to start the game...</Text>}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  playerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tileContainer: {
    marginVertical: 5,
  },
  tile: {
    width: 300,
    height: 100,
    backgroundColor: '#4D9DE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedtile: {
    width: 300,
    height: 100,
    backgroundColor: '#4D9DE9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'black',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LobbyScreen;
