import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert,ScrollView } from 'react-native';
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

  const enoughPlayers = Object.keys(lobbyData.players).length >= 3;

  return (
    <LinearGradient colors={['#14678B', '#4C1C4A']} style={styles.container}>
      <ScrollView style={styles.playerScrollContainer}>
        <Text style={styles.header}>Lobby: {lobbyCode}</Text>
        <View style={styles.playerContainer}>
          {Object.entries(lobbyData?.players || {}).map(([key, player]) => (
            <View style={styles.tileContainer} key={key}> 
              <View style={player.id === playerId ? styles.selectedtile : styles.tile}>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
      {isHost && (
          <Button
            title="Start Game"
            onPress={startGame}
            color={enoughPlayers ? "#4D9DE0" : "#CCCCCC"} // Attempt to visually indicate disabled state, might not work on all platforms
            disabled={!enoughPlayers}
          />
        )}
        {!isHost && <Text style={styles.waitingText}>Waiting for the host to start the game...</Text>}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  playerScrollContainer: {
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    height: '60%',
    marginTop: 20, // Adjust as needed
  },
  startbutton:{
    borderRadius:10,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  playerContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tileContainer: {
    marginVertical: 5,
  },
  tile: {
    backgroundColor: '#4D9DE0',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectedtile: {
    backgroundColor: '#4D9DE9',
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
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'normal', // Adjust fontWeight dynamically in the render method if needed
    color: 'white',
  },
  buttonContainer: {
    width: '50%',
    marginBottom: 20,
    marginTop:20,
  },
  waitingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  }
});

export default LobbyScreen;