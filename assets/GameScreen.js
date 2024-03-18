import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const GameScreen = ({route}) => {
  // Placeholder for player slots, you can replace this with actual data.
  const {name,code} = route.params;
  const playerSlots = new Array(6).fill(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>GAME {code}</Text>
      </View>
      <Text style={styles.waitingText}>GAMETEXT</Text>
    </View>
  );
};

export default GameScreen;