// App.js
import React, { useEffect, useState, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SleepAlarm from './screens/SleepAlarm';
import StepCounter from './screens/StepCounter';
import HabitTracker from './screens/HabitTracker'; // <-- Import HabitTracker

// Styles
import TabBarStyles from './styles/TabBarStyles';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthContext = createContext();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TabBarStyles.container,
        tabBarLabelStyle: TabBarStyles.label,
        tabBarActiveTintColor: TabBarStyles.activeTint.color,
        tabBarInactiveTintColor: TabBarStyles.inactiveTint.color,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'SleepAlarm':
              iconName = focused ? 'bed' : 'bed-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'StepCounter':
              iconName = focused ? 'walk' : 'walk';
              break;
            case 'Habits':
              iconName = focused ? 'check-circle' : 'check-circle-outline';
              break;
            default:
              iconName = 'circle-outline';
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="SleepAlarm" component={SleepAlarm} options={{ tabBarLabel: 'Alarm' }} />
      <Tab.Screen name="StepCounter" component={StepCounter} options={{ tabBarLabel: 'Steps' }} />
      <Tab.Screen name="Habits" component={HabitTracker} options={{ tabBarLabel: 'Habits' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
