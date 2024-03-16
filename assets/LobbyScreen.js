import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const LobbyScreen = () => {
  // Placeholder for player slots, you can replace this with actual data.
  const playerSlots = new Array(6).fill(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lobby XCVQD</Text>
      </View>
      <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent}>
        {playerSlots.map((_, index) => (
          <View key={index} style={styles.playerSlot} />
        ))}
      </ScrollView>
      <Text style={styles.waitingText}>waiting for players..</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ECF21',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  playerList: {
    width: '100%',
    flex: 1,
  },
  playerListContent: {
    alignItems: 'center',
  },
  playerSlot: {
    backgroundColor: '#FFC0CB',
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    // Add additional styling to make it look like your design.
  },
  waitingText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
});

export default LobbyScreen;
