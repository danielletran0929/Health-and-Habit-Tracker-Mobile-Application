import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginRegisterStyles from '../styles/registrationStyles';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const existingUsers = JSON.parse(await AsyncStorage.getItem('users')) || [];

      const userExists = existingUsers.some(u => u.username === username);
      if (userExists) {
        Alert.alert('Error', 'Username already taken.');
        return;
      }

      const newUser = { username, password };
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={LoginRegisterStyles.safeArea}>
      <View style={LoginRegisterStyles.container}>
        <Text style={LoginRegisterStyles.title}>Register</Text>

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
        <TextInput
          style={LoginRegisterStyles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={LoginRegisterStyles.button} onPress={handleRegister}>
          <Text style={LoginRegisterStyles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={LoginRegisterStyles.backText}>← Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={LoginRegisterStyles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
