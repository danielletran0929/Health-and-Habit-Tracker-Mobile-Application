import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import SleepAlarmStyles from '../styles/SleepAlarmStyles';
import { AuthContext } from '../App'; // adjust this to your context

// ✅ Notification handler setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SleepAlarmScreen() {
  const { user } = useContext(AuthContext); // get logged-in user
  const userKey = user ? `alarms_${user.username}` : 'alarms_guest';
  const dndKey = user ? `dndState_${user.username}` : 'dnd_guest';
  const sleepKey = user ? `sleepStart_${user.username}` : 'sleep_guest';
  const sleepDurationKey = user ? `lastSleepDuration_${user.username}` : 'sleepDuration_guest';

  // ===== Alarms & DND =====
  const [alarms, setAlarms] = useState([]);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [dnd, setDnd] = useState(false);
  const [dndEnd, setDndEnd] = useState(null);
  const [nextAlarmTime, setNextAlarmTime] = useState(null);
  const [countdown, setCountdown] = useState('');

  // ===== Sleep Tracker =====
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const fallbackTimerRef = useRef(null);

  // ===== Helper: 24-hour conversion =====
  const to24Hour = (h, p) => (p === 'AM' ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12);

  // ===== Load alarms, DND, and ongoing sleep =====
  useEffect(() => {
    (async () => {
      if (!user) return;

      try {
        // Load alarms
        const savedAlarms = await AsyncStorage.getItem(userKey);
        if (savedAlarms) setAlarms(JSON.parse(savedAlarms));

        // Load DND
        const savedDnd = await AsyncStorage.getItem(dndKey);
        if (savedDnd) {
          const { active, end } = JSON.parse(savedDnd);
          const now = new Date();
          if (active && new Date(end) > now) {
            setDnd(true);
            setDndEnd(new Date(end));
          }
        }

        // Load ongoing sleep
        const start = await AsyncStorage.getItem(sleepKey);
        if (start) {
          setSleepStart(start);
          setIsSleeping(true);

          const startTime = new Date(start);
          const now = new Date();
          const diff = 8 * 60 * 60 * 1000 - (now - startTime);
          if (diff > 0) {
            fallbackTimerRef.current = setTimeout(async () => {
              await recordSleepDuration(8);
              Alert.alert('Sleep complete', '8 hours passed — good morning!');
              setIsSleeping(false);
              await AsyncStorage.removeItem(sleepKey);
            }, diff);
          } else {
            await recordSleepDuration(8);
            setIsSleeping(false);
            await AsyncStorage.removeItem(sleepKey);
          }
        }

        // Notifications permission
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Enable notifications for alarms.');
        }
      } catch (e) {
        console.log('Error loading state:', e);
      }
    })();
  }, [user]);

  // ===== Save alarms whenever they change =====
  useEffect(() => {
    if (!user) return;
    AsyncStorage.setItem(userKey, JSON.stringify(alarms));
    updateNextAlarm();
  }, [alarms, user]);

  // ===== Record sleep =====
  const recordSleepDuration = async (hours) => {
    if (!user) return;
    await AsyncStorage.setItem(sleepDurationKey, hours.toString());
  };

  // ===== Start sleep =====
  const handleStartSleep = async () => {
    if (!user) return;
    const startTime = new Date().toISOString();
    await AsyncStorage.setItem(sleepKey, startTime);
    setSleepStart(startTime);
    setIsSleeping(true);

    fallbackTimerRef.current = setTimeout(async () => {
      await recordSleepDuration(8);
      Alert.alert('Sleep complete', '8 hours passed — good morning!');
      setIsSleeping(false);
      await AsyncStorage.removeItem(sleepKey);
    }, 8 * 60 * 60 * 1000);
  };

  // ===== Stop sleep manually =====
  const handleWakeUp = async () => {
    if (!sleepStart) {
      Alert.alert('No sleep session found');
      return;
    }
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    const start = new Date(sleepStart);
    const now = new Date();
    const duration = ((now - start) / 36e5).toFixed(1); // hours
    await recordSleepDuration(duration);
    Alert.alert('Good morning!', `You slept for ${duration} hours.`);

    setIsSleeping(false);
    await AsyncStorage.removeItem(sleepKey);
  };

  // ===== Schedule / Cancel alarms =====
  const scheduleAlarm = async (h, m, p, id) => {
    const hour24 = to24Hour(h, p);
    const trigger = new Date();
    trigger.setHours(hour24, m, 0, 0);
    if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Alarm',
        body: `It's ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${p}. Do Not Disturb mode will now activate for 8 hours.`,
        sound: 'default',
        data: { alarmId: id },
      },
      trigger,
    });

    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notifId } : a))
    );
  };

  const cancelAlarm = async (notifId) => {
    if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId);
  };

  const toggleAlarm = async (id) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const active = !a.active;
        if (active) scheduleAlarm(a.hour, a.minute, a.period, id);
        else cancelAlarm(a.notifId);
        return { ...a, active };
      })
    );
  };

  const addAlarm = () => {
    const id = Math.random().toString();
    const newAlarm = { id, hour, minute, period, active: true, notifId: null };
    setAlarms((prev) => [...prev, newAlarm]);
    scheduleAlarm(hour, minute, period, id);
  };

  const deleteAlarm = async (id) => {
    const alarm = alarms.find((a) => a.id === id);
    if (alarm?.notifId) await cancelAlarm(alarm.notifId);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // ===== Handle DND activation =====
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const lastNotification = await Notifications.getLastNotificationResponseAsync();
        if (lastNotification?.notification?.request?.content?.data?.alarmId) {
          setDnd(true);
          const end = new Date(Date.now() + 8 * 60 * 60 * 1000);
          setDndEnd(end);
          if (user) await AsyncStorage.setItem(dndKey, JSON.stringify({ active: true, end }));
        }
      }
    });
    return () => sub.remove();
  }, [user]);

  useEffect(() => {
    if (!dnd || !dndEnd) return;
    const timer = setInterval(async () => {
      const now = new Date();
      if (now >= dndEnd) {
        setDnd(false);
        setDndEnd(null);
        if (user) await AsyncStorage.removeItem(dndKey);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [dnd, dndEnd, user]);

  // ===== Next alarm & countdown =====
  const updateNextAlarm = () => {
    const now = new Date();
    const futureAlarms = alarms
      .filter((a) => a.active)
      .map((a) => {
        const t = new Date();
        const hour24 = to24Hour(a.hour, a.period);
        t.setHours(hour24, a.minute, 0, 0);
        if (t <= now) t.setDate(t.getDate() + 1);
        return t;
      })
      .sort((a, b) => a - b);

    setNextAlarmTime(futureAlarms[0] || null);
  };

  useEffect(() => {
    if (!nextAlarmTime) {
      setCountdown('');
      return;
    }
    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextAlarmTime - now;
      if (diff <= 0) {
        setCountdown('Alarm ringing soon!');
        updateNextAlarm();
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [nextAlarmTime]);

  // ===== Render alarm item =====
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
          trackColor={{ true: '#77b86c', false: '#ccc' }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
        <TouchableOpacity
          style={SleepAlarmStyles.deleteButton}
          onPress={() =>
            Alert.alert('Delete Alarm', 'Are you sure?', [
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
      <ScrollView>
        <Text style={SleepAlarmStyles.title}>⏰ Alarm & Sleep Tracker</Text>

        {/* ===== Sleep Tracker Section ===== */}
        <View style={SleepAlarmStyles.card}>
          <Text style={SleepAlarmStyles.header}>Sleep Tracker</Text>
          {!isSleeping ? (
            <TouchableOpacity style={SleepAlarmStyles.button} onPress={handleStartSleep}>
              <Text style={SleepAlarmStyles.buttonText}>Start Sleep</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={SleepAlarmStyles.button} onPress={handleWakeUp}>
              <Text style={SleepAlarmStyles.buttonText}>I’m Awake</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== Time Picker Section ===== */}
        <View style={SleepAlarmStyles.card}>
          <Text style={SleepAlarmStyles.header}>Set Alarm</Text>
          <View style={SleepAlarmStyles.timeContainer}>
            <View style={SleepAlarmStyles.box}>
              <Picker selectedValue={hour} onValueChange={setHour} style={SleepAlarmStyles.innerPicker}>
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item key={i} label={(i + 1).toString()} value={i + 1} />
                ))}
              </Picker>
            </View>
            <Text style={SleepAlarmStyles.colon}>:</Text>
            <View style={SleepAlarmStyles.box}>
              <Picker selectedValue={minute} onValueChange={setMinute} style={SleepAlarmStyles.innerPicker}>
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                ))}
              </Picker>
            </View>
            <View style={SleepAlarmStyles.periodContainer}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[SleepAlarmStyles.periodButton, period === p && SleepAlarmStyles.periodActive]}
                  onPress={() => setPeriod(p)}>
                  <Text style={SleepAlarmStyles.periodText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Text style={SleepAlarmStyles.liveTimeText}>
            {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {period}
          </Text>
          <TouchableOpacity style={SleepAlarmStyles.setButton} onPress={addAlarm}>
            <Text style={SleepAlarmStyles.setButtonText}>Set Alarm</Text>
          </TouchableOpacity>
        </View>

        {/* ===== Countdown Section ===== */}
        {nextAlarmTime && (
          <View style={SleepAlarmStyles.countdownContainer}>
            <Text style={SleepAlarmStyles.countdownText}>⏰ Next alarm in: {countdown}</Text>
          </View>
        )}

        {/* ===== DND Status ===== */}
        <View style={[SleepAlarmStyles.dndContainer, dnd ? SleepAlarmStyles.dndOn : SleepAlarmStyles.dndOff]}>
          <Text style={SleepAlarmStyles.dndText}>Do Not Disturb is {dnd ? 'ON' : 'OFF'}</Text>
        </View>

        {/* ===== Alarm List ===== */}
        <Text style={SleepAlarmStyles.subTitle}>Your Alarms</Text>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarm}
          ListEmptyComponent={<Text style={SleepAlarmStyles.empty}>No alarms set</Text>}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}
