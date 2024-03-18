import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const HomeScreen = ({navigation}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  

  const playedPaid = true;
  
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
          keyboardType="default"
        /> 
        <TextInput
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder="Name"
        /> 
<TouchableOpacity
  style={[styles.joinButton, !(name && code) && styles.disabledJoinButton]}
  
  onPress={() =>  navigation.navigate('Lobby', {name,code})}
  disabled={!(name && code)} // The button is disabled if either name or code is empty
>
  <Text style={styles.joinButtonText}>Join</Text>
</TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.createButton}
      onPress={() => {playedPaid ?  navigation.navigate('TestScreen', {name,code}): navigation.navigate('Paywall')}}
      >
        
        <Text style={styles.createButtonText}>Create Lobby</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.createButton}
      onPress={() => {navigation.navigate('JoinLobby')}}
      >
        
        <Text style={styles.createButtonText}>Join Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ECF21',
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
    fontSize: 30,
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
    width:'100%',
  },
  input: {
    flex: 1,
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
    width:'75%',
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
  disabledJoinButton: {
    backgroundColor: '#aaa', // A light grey, for example, indicating it's disabled
  },
});

export default HomeScreen;
