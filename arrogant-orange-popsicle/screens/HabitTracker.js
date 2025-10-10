import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App'; // adjust this path if needed

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => Math.round(size * (width / 375));


const HabitTracker = () => {
  const { user } = useContext(AuthContext);
  const userKey = user ? `habits_${user.username}` : '@habits';

  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    loadHabits();
  }, [user]);

  // ✅ Load habits from AsyncStorage
  const loadHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem(userKey);
      if (saved) setHabits(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading habits:', e);
    }
  };

  // ✅ Save habits to AsyncStorage
  const saveHabits = async (updated) => {
    try {
      await AsyncStorage.setItem(userKey, JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving habits:', e);
    }
  };

  // ✅ Add a new habit
  const addHabit = () => {
    if (newHabit.trim() === '') return;
    const updated = [
      ...habits,
      { id: Date.now().toString(), name: newHabit.trim(), done: false },
    ];
    setHabits(updated);
    saveHabits(updated);
    setNewHabit('');
  };

  // ✅ Toggle habit completion
  const toggleHabit = (id) => {
    const updated = habits.map((h) =>
      h.id === id ? { ...h, done: !h.done } : h
    );
    setHabits(updated);
    saveHabits(updated);
  };

  // ✅ Delete a habit
  const deleteHabit = (id) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    saveHabits(updated);
  };

  // ✅ Reset all habits
  const resetHabits = () => {
    const reset = habits.map((h) => ({ ...h, done: false }));
    setHabits(reset);
    saveHabits(reset);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Habit Tracker</Text>

      {/* ➕ Input for new habit */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a new habit..."
          value={newHabit}
          onChangeText={setNewHabit}
        />
        <TouchableOpacity style={styles.addButton} onPress={addHabit}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* 📝 List of habits */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            <TouchableOpacity
              style={[styles.habitCard, item.done && styles.habitDone]}
              onPress={() => toggleHabit(item.id)}
            >
              <Text
                style={[
                  styles.habitText,
                  item.done && {
                    textDecorationLine: 'line-through',
                    color: '#22c55e',
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteHabit(item.id)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits yet — add one!</Text>
        }
      />

      <TouchableOpacity style={styles.resetButton} onPress={resetHabits}>
        <Text style={styles.resetText}>Reset All</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HabitTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: width * 0.05,
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: height * 0.025,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: height * 0.02,
    gap: width * 0.02,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    fontSize: scaleFont(16),
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: width * 0.04,
    justifyContent: 'center',
    borderRadius: 10,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(16),
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  habitCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 12,
    marginRight: width * 0.03,
    elevation: 2,
  },
  habitDone: {
    backgroundColor: '#dcfce7',
  },
  habitText: {
    fontSize: scaleFont(18),
    color: '#111827',
  },
  deleteText: {
    fontSize: scaleFont(20),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: height * 0.05,
    color: '#6b7280',
    fontSize: scaleFont(16),
  },
  resetButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: height * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  resetText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
});

