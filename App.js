import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Platform} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [alarms, setAlarms] = useState([]);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications to use the alarm clock.');
      }
    })();
  }, []);

  const convertTo24Hour = (hour, period) => {
    if (period === 'AM') return hour === 12 ? 0 : hour;
    else return hour === 12 ? 12 : hour + 12;
  };

  const scheduleAlarm = async (hour, minute, period, id) => {
    const hour24 = convertTo24Hour(hour, period);
    let trigger = new Date();
    trigger.setHours(hour24);
    trigger.setMinutes(minute);
    trigger.setSeconds(0);

    if (trigger.getTime() <= Date.now()) trigger.setDate(trigger.getDate() + 1);

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm',
        body: `It's ${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')} ${period}`,
        sound: 'default',
      },
      trigger,
    });
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, notifId } : a)));
  };

  const cancelAlarm = async (notifId) => {
    if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId);
  };

  const toggleAlarm = async (id) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, active: !a.active };
          if (updated.active) {
            scheduleAlarm(updated.hour, updated.minute, updated.period, id);
          } else {
            cancelAlarm(updated.notifId);
          }
          return updated;
        }
        return a;
      })
    );
  };

  const addAlarm = () => {
    const id = Math.random().toString();
    const newAlarm = {
      id,
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod,
      active: true,
      notifId: null,
    };
    setAlarms((prev) => [...prev, newAlarm]);
    scheduleAlarm(selectedHour, selectedMinute, selectedPeriod, id);
  };

  const deleteAlarm = async (id) => {
    const alarm = alarms.find((a) => a.id === id);
    if (alarm?.notifId) await cancelAlarm(alarm.notifId);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const renderAlarm = ({ item }) => (
    <View style={styles.components}>
      <Text style={styles.alarmText}>
        {item.hour.toString().padStart(2, '0')}:
        {item.minute.toString().padStart(2, '0')} {item.period}
      </Text>
      <View style={styles.alarmActions}>
        <Switch
          value={item.active}
          onValueChange={() => toggleAlarm(item.id)}
          trackColor={{ true: '#77b86c', false: '#d3d3d3' }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(item.id) },
            ])
          }>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Enter time</Text>

        <View style={styles.timeContainer}>
          <View style={styles.box}>
            <Picker
              selectedValue={selectedHour}
              style={styles.innerPicker}
              onValueChange={(itemValue) => setSelectedHour(itemValue)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <Picker.Item key={hour} label={hour.toString()} value={hour} />
              ))}
            </Picker>
          </View>

          <Text style={styles.colon}>:</Text>

          <View style={styles.box}>
            <Picker
              selectedValue={selectedMinute}
              style={styles.innerPicker}
              onValueChange={(itemValue) => setSelectedMinute(itemValue)}>
              {Array.from({ length: 60 }, (_, i) => (
                <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
              ))}
            </Picker>
          </View>

          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'AM' && styles.periodActive,
              ]}
              onPress={() => setSelectedPeriod('AM')}>
              <Text style={styles.periodText}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'PM' && styles.periodActive,
              ]}
              onPress={() => setSelectedPeriod('PM')}>
              <Text style={styles.periodText}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.liveTimeText}>
          {selectedHour.toString().padStart(2, '0')}:
          {selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
        </Text>

        <TouchableOpacity style={styles.setButton} onPress={addAlarm}>
          <Text style={styles.setButtonText}>Set Alarm</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Your Alarms</Text>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarm}
        ListEmptyComponent={<Text style={styles.empty}>No alarms set</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fff9',
    padding: 20,
  },
  // title: {
  //   fontSize: 26,
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  //   color: '#2f6b50',
  //   marginBottom: 10,
  // },
  card: {
    backgroundColor: '#b8e0b0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    color: '#2f6b50',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#a9d8a0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  innerPicker: {
    height: 150,
    width: 80,
    color: '#2f6b50',
  },
  colon: {
    fontSize: 28,
    color: '#2f6b50',
    marginHorizontal: 5,
  },
  periodContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  periodButton: {
    backgroundColor: '#a9d8a0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 2,
  },
  periodActive: {
    backgroundColor: '#77b86c',
  },
  periodText: {
    fontSize: 16,
    color: '#2f6b50',
    fontWeight: '600',
  },
  liveTimeText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#2f6b50',
    marginTop: 10,
  },
  setButton: {
    backgroundColor: '#77b86c',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 15,
  },
  setButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 20,
    marginVertical: 12,
    color: '#2f6b50',
  },
  components: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  alarmText: {
    fontSize: 20,
    color: '#111',
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 6,
  },
  deleteText: {
    fontSize: 20,
    color: 'red',
  },
  empty: {
    color: '#666',
  },
});
