import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressCircle } from 'react-native-svg-charts';
import { useIsFocused } from '@react-navigation/native';
import HomeScreenStyles from '../styles/HomeScreenStyles';

export default function HomeScreen({ navigation }) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [nextAlarm, setNextAlarm] = useState('No alarm set');
  const [stepsToday, setStepsToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const isFocused = useIsFocused();

  const stepGoal = 10000;
  const stepProgress = Math.min(stepsToday / stepGoal, 1);

  // 🧠 Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Get user
        const userData = await AsyncStorage.getItem('user');
        setLoggedInUser(userData ? JSON.parse(userData) : null);

        // 🔹 Get alarm
        const alarmData = await AsyncStorage.getItem('sleepAlarm');
        if (alarmData) {
          const alarm = JSON.parse(alarmData);
          setNextAlarm(alarm.time || 'No alarm set');
        } else {
          setNextAlarm('No alarm set');
        }

        // 🔹 Get steps + streak
        const saved = await AsyncStorage.getItem('@step_records');
        const streakData = await AsyncStorage.getItem('@step_streak');
        const records = saved ? JSON.parse(saved) : {};
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split('T')[0];

        const todaySteps = records[today] || 0;
        setStepsToday(todaySteps);

        let currentStreak = streakData ? JSON.parse(streakData) : 0;

        // 🧩 Streak logic:
        // If user reached goal today, check if they also did yesterday.
        if (todaySteps >= stepGoal) {
          const yesterdaySteps = records[yesterday] || 0;
          if (yesterdaySteps >= stepGoal) {
            currentStreak += 1; // continue streak
          } else {
            currentStreak = 1; // restart streak
          }
        } else {
          // If today’s goal not met, keep current streak (don’t increment)
          // but don’t reset it immediately — only reset the next day if still not met
        }

        setStreak(currentStreak);
        await AsyncStorage.setItem('@step_streak', JSON.stringify(currentStreak));
      } catch (error) {
        console.log('Error fetching home data:', error);
      }
    };

    if (isFocused) fetchData();
  }, [isFocused]);

  const handleProfilePress = () => {
    if (loggedInUser) navigation.navigate('Profile');
    else navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={HomeScreenStyles.safeArea}>
      {/* Header */}
      <View style={HomeScreenStyles.header}>
        <Text style={HomeScreenStyles.appName}>Furica</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Text style={HomeScreenStyles.profileLink}>
            {loggedInUser ? 'Profile' : 'Login / Register'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={HomeScreenStyles.scrollContent}>
        <View style={HomeScreenStyles.whiteSection}>

          {/* Today’s Summary */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Today’s Summary</Text>
            <Text style={HomeScreenStyles.text}>
              Steps: {stepsToday.toLocaleString()} / {stepGoal.toLocaleString()}
            </Text>
          </View>

          {/* Daily Goal Progress */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Daily Goal Progress</Text>
            <View style={HomeScreenStyles.progressContainer}>
              <View style={HomeScreenStyles.progressItem}>
                <ProgressCircle
                  style={HomeScreenStyles.progressCircle}
                  progress={stepProgress}
                  progressColor={'#4CAF50'}
                  backgroundColor={'#E0E0E0'}
                  strokeWidth={6}
                />
                <Text style={HomeScreenStyles.progressLabel}>
                  {(stepProgress * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Step Streak Tracker */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Your Streak 🔥</Text>
            <Text style={HomeScreenStyles.text}>
              {streak > 0
                ? `${streak}-day streak! Keep it going!`
                : 'No current streak. Hit 10,000 steps to start one!'}
            </Text>
          </View>

          {/* Next Alarm */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Next Alarm</Text>
            <Text style={HomeScreenStyles.text}>{nextAlarm}</Text>
          </View>

          {/* Motivation */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Motivation 💪</Text>
            <Text style={HomeScreenStyles.text}>
              "CAN DO IT FOR THE SHAWTIES LIL BRO"
            </Text>
          </View>

          {/* Quick Shortcuts */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Quick Shortcuts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SleepAlarm')}>
              <Text style={HomeScreenStyles.link}>Set/Edit Sleep Alarm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('StepCounter')}>
              <Text style={HomeScreenStyles.link}>View Step Counter</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
