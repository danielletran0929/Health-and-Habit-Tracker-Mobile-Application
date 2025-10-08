import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginRegisterStyles from '../styles/registrationStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
        Alert.alert('Success', `Welcome back, ${username}!`);
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'Invalid username or password.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={LoginRegisterStyles.safeArea}>
      <View style={LoginRegisterStyles.container}>
        <Text style={LoginRegisterStyles.title}>Login</Text>

        <TextInput
          style={LoginRegisterStyles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={LoginRegisterStyles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={LoginRegisterStyles.button} onPress={handleLogin}>
          <Text style={LoginRegisterStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={LoginRegisterStyles.backText}>← Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={LoginRegisterStyles.linkText}>Don’t have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
