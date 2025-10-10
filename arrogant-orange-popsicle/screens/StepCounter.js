import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';
import { AuthContext } from '../App'; // adjust import based on your context

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => Math.round(size * (width / 375));
const scaleSize = (size) => size * (width / 375);

const StepCounter = () => {
  const { user } = useContext(AuthContext);
  const userKey = user ? `steps_${user.username}` : '@step_records';

  const [steps, setSteps] = useState(0);
  const [records, setRecords] = useState({});
  const [prevMagnitude, setPrevMagnitude] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadRecords(); }, [user]);

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 250);

    const subscription = accelerometer
      .pipe(
        map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
        filter((magnitude) => {
          const threshold = 1.2;
          const isStep = magnitude - prevMagnitude > threshold;
          setPrevMagnitude(magnitude);
          return isStep;
        })
      )
      .subscribe(() => {
        const newCount = steps + 1;
        setSteps(newCount);
        saveSteps(newCount);
      });

    return () => subscription.unsubscribe();
  }, [steps, prevMagnitude]);

  const saveSteps = async (count) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updated = { ...records, [today]: count };
      setRecords(updated);
      await AsyncStorage.setItem(userKey, JSON.stringify(updated));
    } catch (e) { console.log('Error saving steps:', e); }
  };

  const loadRecords = async () => {
    try {
      const saved = await AsyncStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecords(parsed);
        const today = new Date().toISOString().split('T')[0];
        if (parsed[today]) setSteps(parsed[today]);
      }
    } catch (e) { console.log('Error loading records:', e); }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[0];
      if (now !== currentDate) handleNewDay(now);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate, records, steps]);

  const handleNewDay = async (newDate) => {
    try {
      const updated = { ...records, [currentDate]: steps };
      await AsyncStorage.setItem(userKey, JSON.stringify(updated));
      setRecords(updated);
      setSteps(0);
      setCurrentDate(newDate);
    } catch (e) { console.log('Error handling new day:', e); }
  };

  const getStats = () => {
    const today = new Date();
    let weekTotal = 0;
    let monthTotal = 0;
    const thisWeek = [];
    const thisMonth = [];

    Object.keys(records).forEach((date) => {
      const d = new Date(date);
      const diffDays = (today - d) / (1000 * 3600 * 24);
      if (diffDays < 7) {
        weekTotal += records[date];
        thisWeek.push({ date, steps: records[date] });
      }
      if (today.getMonth() === d.getMonth() && today.getFullYear() === d.getFullYear()) {
        monthTotal += records[date];
        thisMonth.push({ date, steps: records[date] });
      }
    });

    return { weekTotal, monthTotal, thisWeek, thisMonth };
  };

  const { weekTotal, monthTotal, thisWeek, thisMonth } = getStats();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏃 Step Counter</Text>

      <View style={styles.card}>
        <Text style={styles.counter}>{steps}</Text>
        <Text style={styles.label}>Steps Today</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.stat}>📅 Weekly Total: {weekTotal}</Text>
        <Text style={styles.stat}>🗓️ Monthly Total: {monthTotal}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📆 This Week</Text>
        {thisWeek.length > 0 ? thisWeek.map((r) => (
          <Text key={r.date} style={styles.record}>{r.date}: {r.steps}</Text>
        )) : <Text style={styles.record}>No data yet</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🗓️ This Month</Text>
        {thisMonth.length > 0 ? thisMonth.map((r) => (
          <Text key={r.date} style={styles.record}>{r.date}: {r.steps}</Text>
        )) : <Text style={styles.record}>No data yet</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: scaleSize(20) },
  title: { fontSize: scaleFont(28), fontWeight: 'bold', textAlign: 'center', marginVertical: height * 0.025 },
  card: { backgroundColor: '#fff', borderRadius: scaleSize(16), padding: scaleSize(16), marginBottom: height * 0.025, elevation: 3 },
  counter: { fontSize: scaleFont(72), fontWeight: 'bold', textAlign: 'center', color: '#2563EB' },
  label: { textAlign: 'center', fontSize: scaleFont(18), color: '#555' },
  date: { textAlign: 'center', color: '#999', marginTop: height * 0.005 },
  stat: { fontSize: scaleFont(18), marginVertical: height * 0.005 },
  sectionTitle: { fontSize: scaleFont(20), fontWeight: 'bold', marginBottom: height * 0.012 },
  record: { fontSize: scaleFont(16), color: '#333', marginVertical: height * 0.003 },
});

export default StepCounter;
