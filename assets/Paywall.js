import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const PayWall = ({route}) => {
  // Placeholder for player slots, you can replace this with actual data.

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Paywall</Text>
      </View>
      <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent}>
      </ScrollView>
      <Text style={styles.waitingText}>waiting for players..</Text>
    </View>
  );
};
export default PayWall;