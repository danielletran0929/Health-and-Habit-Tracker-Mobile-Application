import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  // ✅ Load habits from AsyncStorage
  const loadHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem('@habits');
      if (saved) setHabits(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading habits:', e);
    }
  };

  // ✅ Save habits to AsyncStorage
  const saveHabits = async (updated) => {
    try {
      await AsyncStorage.setItem('@habits', JSON.stringify(updated));
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
    elevation: 2,
  },
  habitDone: {
    backgroundColor: '#dcfce7',
  },
  habitText: {
    fontSize: 18,
    color: '#111827',
  },
  deleteText: {
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6b7280',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#1d4ed8',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resetText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
