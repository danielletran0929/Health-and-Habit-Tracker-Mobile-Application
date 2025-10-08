import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Platform, ScrollView}from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import SleepAlarmStyles from './SleepAlarmStyles/SleepAlarmStyles';

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
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const [dndEndTime, setDndEndTime] = useState(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const matchingAlarm = alarms.find((a) => {
        const alarmHour24 = convertTo24Hour(a.hour, a.period);
        return a.active && alarmHour24 === currentHour && a.minute === currentMinute;
      });

      if (matchingAlarm && !doNotDisturb) {
        setDoNotDisturb(true);

        const endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); 
        setDndEndTime(endTime);
      }

      if (doNotDisturb && dndEndTime && now >= dndEndTime) {
        setDoNotDisturb(false);
        setDndEndTime(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [alarms, doNotDisturb, dndEndTime]);

  const renderAlarm = ({ item }) => (
    <View style={SleepAlarmStyles.components}>
      <Text style={SleepAlarmStyles.alarmText}>
        {item.hour.toString().padStart(2, '0')}:
        {item.minute.toString().padStart(2, '0')} {item.period}
      </Text>
      <View style={SleepAlarmStyles.alarmActions}>
        <Switch
          value={item.active}
          onValueChange={() => toggleAlarm(item.id)}
          trackColor={{ true: '#77b86c', false: '#d3d3d3' }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
        <TouchableOpacity
          style={SleepAlarmStyles.deleteButton}
          onPress={() =>
            Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(item.id) },
            ])
          }>
          <Text style={SleepAlarmStyles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
      <View style={SleepAlarmStyles.container}>
        <Text style={SleepAlarmStyles.title}>Alarm Clock</Text>
        <View style={SleepAlarmStyles.card}>
          <Text style={SleepAlarmStyles.header}>Enter time</Text>

          <View style={SleepAlarmStyles.timeContainer}>
            <View style={SleepAlarmStyles.box}>
              <Picker
                selectedValue={selectedHour}
                style={SleepAlarmStyles.innerPicker}
                onValueChange={(itemValue) => setSelectedHour(itemValue)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                  <Picker.Item key={hour} label={hour.toString()} value={hour} />
                ))}
              </Picker>
            </View>

            <Text style={SleepAlarmStyles.colon}>:</Text>

            <View style={SleepAlarmStyles.box}>
              <Picker
                selectedValue={selectedMinute}
                style={SleepAlarmStyles.innerPicker}
                onValueChange={(itemValue) => setSelectedMinute(itemValue)}>
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                ))}
              </Picker>
            </View>

            <View style={SleepAlarmStyles.periodContainer}>
              <TouchableOpacity
                style={[
                  SleepAlarmStyles.periodButton,
                  selectedPeriod === 'AM' && SleepAlarmStyles.periodActive,
                ]}
                onPress={() => setSelectedPeriod('AM')}>
                <Text style={SleepAlarmStyles.periodText}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  SleepAlarmStyles.periodButton,
                  selectedPeriod === 'PM' && SleepAlarmStyles.periodActive,
                ]}
                onPress={() => setSelectedPeriod('PM')}>
                <Text style={SleepAlarmStyles.periodText}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={SleepAlarmStyles.liveTimeText}>
            {selectedHour.toString().padStart(2, '0')}:
            {selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
          </Text>

          <TouchableOpacity style={SleepAlarmStyles.setButton} onPress={addAlarm}>
            <Text style={SleepAlarmStyles.setButtonText}>Set Alarm</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            SleepAlarmStyles.dndContainer,
            { backgroundColor: doNotDisturb ? '#b9e4c2' : '#f8caca' },
          ]}>
          <Text style={SleepAlarmStyles.dndText}>
            Do Not Disturb is {doNotDisturb ? 'Turned ON' : 'Turned OFF'}
          </Text>
        </View>

        <Text style={SleepAlarmStyles.subTitle}>Your Alarms</Text>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={SleepAlarmStyles.alarmListContainer}>
          <FlatList
            data={alarms}
            keyExtractor={(item) => item.id}
            renderItem={renderAlarm}
            ListEmptyComponent={<Text style={SleepAlarmStyles.empty}>No alarms set</Text>}
          />
        </View>
         </ScrollView>
      </View>
  );
}

