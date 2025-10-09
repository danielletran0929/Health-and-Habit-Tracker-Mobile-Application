import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

const StepCounter = () => {
  const [steps, setSteps] = useState(0);
  const [records, setRecords] = useState({});
  const [prevMagnitude, setPrevMagnitude] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Load saved records on start ---
  useEffect(() => {
    loadRecords();
  }, []);

  // --- Sensor subscription ---
  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 250);

    const subscription = accelerometer
      .pipe(
        map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
        filter((magnitude) => {
          const threshold = 1.2; // sensitivity (higher = less sensitive)
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

  // --- Save today's steps ---
  const saveSteps = async (count) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updated = { ...records, [today]: count };
      setRecords(updated);
      await AsyncStorage.setItem('@step_records', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving steps:', e);
    }
  };

  // --- Load all records and today’s count ---
  const loadRecords = async () => {
    try {
      const saved = await AsyncStorage.getItem('@step_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecords(parsed);

        const today = new Date().toISOString().split('T')[0];
        if (parsed[today]) setSteps(parsed[today]);
      }
    } catch (e) {
      console.log('Error loading records:', e);
    }
  };

  // --- Detect day change every minute ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[0];
      if (now !== currentDate) {
        // Day changed -> save old record & reset counter
        handleNewDay(now);
      }
    }, 60000); // check every 1 minute

    return () => clearInterval(interval);
  }, [currentDate, records, steps]);

  const handleNewDay = async (newDate) => {
    try {
      const updated = { ...records, [currentDate]: steps };
      await AsyncStorage.setItem('@step_records', JSON.stringify(updated));

      // Reset for new day
      setRecords(updated);
      setSteps(0);
      setCurrentDate(newDate);
    } catch (e) {
      console.log('Error handling new day:', e);
    }
  };

  // --- Compute weekly/monthly summaries ---
  const getStats = () => {
    const today = new Date();
    let weekTotal = 0;
    let monthTotal = 0;
    const thisWeek = [];
    const thisMonth = [];

    Object.keys(records).forEach((date) => {
      const d = new Date(date);
      const diffDays = (today - d) / (1000 * 3600 * 24);

      if (diffDays <= 7) {
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
        {thisWeek.length > 0 ? (
          thisWeek.map((r) => (
            <Text key={r.date} style={styles.record}>
              {r.date}: {r.steps}
            </Text>
          ))
        ) : (
          <Text style={styles.record}>No data yet</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🗓️ This Month</Text>
        {thisMonth.length > 0 ? (
          thisMonth.map((r) => (
            <Text key={r.date} style={styles.record}>
              {r.date}: {r.steps}
            </Text>
          ))
        ) : (
          <Text style={styles.record}>No data yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  counter: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563EB',
  },
  label: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
  },
  date: {
    textAlign: 'center',
    color: '#999',
    marginTop: 4,
  },
  stat: {
    fontSize: 18,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  record: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
});

export default StepCounter;