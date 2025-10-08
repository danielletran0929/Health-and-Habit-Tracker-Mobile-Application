import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreenStyles from '../styles/ProfileScreenStyles';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const savedUser = await AsyncStorage.getItem('loggedInUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={ProfileScreenStyles.safeArea}>
      <View style={ProfileScreenStyles.container}>
        <Text style={ProfileScreenStyles.title}>Profile</Text>

        {user ? (
          <>
            <Text style={ProfileScreenStyles.label}>
              Username: <Text style={ProfileScreenStyles.value}>{user.username}</Text>
            </Text>

            <TouchableOpacity onPress={handleLogout} style={ProfileScreenStyles.logoutButton}>
              <Text style={ProfileScreenStyles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={ProfileScreenStyles.notLoggedIn}>You’re not logged in.</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={ProfileScreenStyles.loginButton}
            >
              <Text style={ProfileScreenStyles.loginText}>Go to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
