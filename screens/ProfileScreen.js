import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App';
import ProfileStyles from '../styles/ProfileScreenStyles';

export default function ProfileScreen() {
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <View style={ProfileStyles.container}>
      <Text style={ProfileStyles.title}>👤 Profile</Text>

      {user ? (
        <>
          <Text style={ProfileStyles.info}>Username: {user.username}</Text>
          <Text style={ProfileStyles.info}>Email: {user.email || 'No email saved'}</Text>

          <TouchableOpacity style={ProfileStyles.logoutBtn} onPress={handleLogout}>
            <Text style={ProfileStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={ProfileStyles.info}>No user logged in.</Text>
      )}
    </View>
  );
}
