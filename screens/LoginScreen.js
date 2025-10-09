import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App';
import LoginRegisterStyles from '../styles/registrationStyles';

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [loginInput, setLoginInput] = useState(''); // ✅ Can be username OR email
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const users = JSON.parse(await AsyncStorage.getItem('users')) || [];

      // ✅ Match either username or email
      const user = users.find(
        u =>
          (u.username === loginInput || u.email === loginInput) &&
          u.password === password
      );

      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        Alert.alert('Success', `Welcome back, ${user.username}!`);
      } else {
        Alert.alert('Error', 'Invalid username/email or password.');
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
          placeholder="Username or Email"
          value={loginInput}
          onChangeText={setLoginInput}
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
