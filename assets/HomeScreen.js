import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const HomeScreen = ({navigation}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>IMPOSTER SYNDROME</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setCode}
          value={code}
          placeholder="CODE"
        /> 
        <TextInput
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder="Name"
        /> 
        <TouchableOpacity style={styles.joinButton} onPress={() => navigation.navigate('Lobby')}>
          <Text style={styles.joinButtonText}>Join</Text>
          
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Create Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ECF21',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#D9D9D9',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    color: '#000000',
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  input: {
    flex: 1,
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  joinButton: {
    backgroundColor: '#6A0DAD',
    padding: 10,
  },
  joinButtonText: {
    color: '#FFF',
  },
  createButton: {
    backgroundColor: '#00008B',
    padding: 20,
  },
  createButtonText: {
    color: '#FFF',
  },
});

export default HomeScreen;
