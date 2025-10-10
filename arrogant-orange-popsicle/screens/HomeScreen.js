import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import HomeScreenStyles from '../styles/HomeScreenStyles';

export default function HomeScreen({ navigation }) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [nextAlarm, setNextAlarm] = useState('No alarm set');
  const [stepsToday, setStepsToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [motivation, setMotivation] = useState('');
  const [habits, setHabits] = useState([]);
  const [dailyTip, setDailyTip] = useState('');
  const isFocused = useIsFocused();

  const stepGoal = 10000;

  const MOTIVATION_QUOTES = [
    "Keep moving, you're crushing it! 💪",
    "Every step counts! 🏃‍♂️",
    "Stay strong, stay consistent! 🔥",
    "You're unstoppable today! ⚡",
    "CAN DO IT FOR THE SHAWTIES LIL BRO 😎",
  ];

  const DAILY_TIPS = [
    "Drink at least 8 glasses of water today 💧",
    "Take a 5-minute stretch break every hour 🧘‍♂️",
    "Get at least 7–8 hours of sleep tonight 😴",
    "Try a short walk after lunch 🚶‍♀️",
    "Write down one thing you're grateful for today ✍️",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        setLoggedInUser(user);

        setMotivation(MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);
        setDailyTip(DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)]);

        // Next alarm logic
        let nextAlarmText = 'No alarm set';
        if (user) {
          const alarmKey = `alarms_${user.username}`;
          const savedAlarms = await AsyncStorage.getItem(alarmKey);
          if (savedAlarms) {
            const alarms = JSON.parse(savedAlarms);
            const now = new Date();
            const upcoming = alarms
              .filter(a => a.active)
              .map(a => {
                let hour24 = a.period === 'AM' ? (a.hour === 12 ? 0 : a.hour) : (a.hour === 12 ? 12 : a.hour + 12);
                const alarmTime = new Date();
                alarmTime.setHours(hour24, a.minute, 0, 0);
                if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1);
                return alarmTime;
              })
              .sort((a, b) => a - b);

            if (upcoming.length > 0) {
              const next = upcoming[0];
              const h = next.getHours();
              const m = next.getMinutes();
              const period = h >= 12 ? 'PM' : 'AM';
              const displayHour = h % 12 === 0 ? 12 : h % 12;
              nextAlarmText = `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
            }
          }
        }
        setNextAlarm(nextAlarmText);

        // Steps & streak
        const stepKey = user ? `steps_${user.username}` : '@step_records';
        const streakKey = user ? `streak_${user.username}` : '@step_streak';

        const saved = await AsyncStorage.getItem(stepKey);
        const streakData = await AsyncStorage.getItem(streakKey);
        const records = saved ? JSON.parse(saved) : {};
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const todaySteps = records[today] || 0;
        setStepsToday(todaySteps);

        let currentStreak = streakData ? JSON.parse(streakData) : 0;
        if (todaySteps >= stepGoal) {
          const yesterdaySteps = records[yesterday] || 0;
          currentStreak = yesterdaySteps >= stepGoal ? currentStreak + 1 : 1;
        }
        setStreak(currentStreak);
        await AsyncStorage.setItem(streakKey, JSON.stringify(currentStreak));

        // Load user habits
        const habitKey = user ? `habits_${user.username}` : '@habits';
        const savedHabits = await AsyncStorage.getItem(habitKey);
        const habitsData = savedHabits ? JSON.parse(savedHabits) : [];
        setHabits(habitsData);
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

  // --- Toggle habit completion ---
  const toggleHabit = async (id) => {
    const updated = habits.map(h => h.id === id ? { ...h, done: !h.done } : h);
    setHabits(updated);
    if (loggedInUser) {
      const habitKey = `habits_${loggedInUser.username}`;
      await AsyncStorage.setItem(habitKey, JSON.stringify(updated));
    }
  };

  const completedHabits = habits.filter(h => h.done).length;
  const totalHabits = habits.length;

  return (
    <SafeAreaView style={HomeScreenStyles.safeArea}>
      <View style={HomeScreenStyles.header}>
        <Text style={HomeScreenStyles.appName}>Furica</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Text style={HomeScreenStyles.profileLink}>
            {loggedInUser ? 'Profile' : 'Login / Register'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={HomeScreenStyles.scrollContent}>
        <View style={HomeScreenStyles.whiteSection}>
          {/* Today’s Summary */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Today’s Summary</Text>
            <Text style={HomeScreenStyles.text}>
              Steps: {stepsToday.toLocaleString()} / {stepGoal.toLocaleString()}
            </Text>
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
            <Text style={HomeScreenStyles.sectionTitle}>Motivation</Text>
            <Text style={HomeScreenStyles.text}>{motivation}</Text>
          </View>

          {/* Habits */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Today's Habits</Text>
            {totalHabits === 0 ? (
              <Text style={HomeScreenStyles.text}>No habits added yet!</Text>
            ) : (
              <>
                {habits.slice(0, 5).map(h => (
                  <TouchableOpacity key={h.id} onPress={() => toggleHabit(h.id)}>
                    <Text
                      style={[
                        HomeScreenStyles.text,
                        h.done && { textDecorationLine: 'line-through', color: '#22c55e' },
                      ]}
                    >
                      {h.name} {h.done && '✅'}
                    </Text>
                  </TouchableOpacity>
                ))}
                {totalHabits > 5 && (
                  <Text style={HomeScreenStyles.text}>
                    …and {totalHabits - 5} more habit{totalHabits - 5 > 1 ? 's' : ''} to complete
                  </Text>
                )}
                <Text style={[HomeScreenStyles.text, { marginTop: 4 }]}>
                  Completed: {completedHabits} / {totalHabits}
                </Text>
              </>
            )}
          </View>

          {/* Daily Tip */}
          <View style={HomeScreenStyles.tipBox}>
            <Text style={HomeScreenStyles.sectionTitle}>Tip of the Day 💡</Text>
            <Text style={HomeScreenStyles.text}>{dailyTip}</Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
