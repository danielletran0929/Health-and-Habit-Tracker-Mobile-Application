import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import notifee, { TriggerType, EventType, TimestampTrigger } from "@notifee/react-native";
import SleepAlarmStyles from "../styles/SleepAlarmStyles";

export default function SleepAlarmScreen() {
  // ===== States =====
  const [alarms, setAlarms] = useState([]);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("AM");
  const [dnd, setDnd] = useState(false);
  const [dndEnd, setDndEnd] = useState(null);
  const [nextAlarmTime, setNextAlarmTime] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [sleepData, setSleepData] = useState([]);
  const fallbackTimerRef = useRef(null);

  // ===== Helper =====
  const to24Hour = (h, p) =>
    p === "PM" && h !== 12 ? h + 12 : p === "AM" && h === 12 ? 0 : h;

  // ===== Load saved state =====
  useEffect(() => {
    (async () => {
      try {
        await notifee.requestPermission();

        const savedAlarms = await AsyncStorage.getItem("alarms");
        if (savedAlarms) setAlarms(JSON.parse(savedAlarms));

        const savedDnd = await AsyncStorage.getItem("dndState");
        if (savedDnd) {
          const { active, end } = JSON.parse(savedDnd);
          if (active && new Date(end) > new Date()) {
            setDnd(true);
            setDndEnd(new Date(end));
          }
        }

        const start = await AsyncStorage.getItem("sleepStart");
        if (start) {
          setSleepStart(start);
          setIsSleeping(true);
        }

        const savedSleepData = await AsyncStorage.getItem("sleepData");
        if (savedSleepData) setSleepData(JSON.parse(savedSleepData));
      } catch (e) {
        console.log("Error loading state:", e);
      }
    })();
  }, []);

  // ===== Save alarms whenever changed =====
  useEffect(() => {
    AsyncStorage.setItem("alarms", JSON.stringify(alarms));
    updateNextAlarm();
  }, [alarms]);

  // ===== Sleep Tracker =====
  const recordSleepDuration = async (hours) => {
    const newEntry = { x: new Date().toLocaleDateString(), y: parseFloat(hours) };
    const updatedData = [...sleepData, newEntry].slice(-7);
    setSleepData(updatedData);
    await AsyncStorage.setItem("sleepData", JSON.stringify(updatedData));
  };

  const handleStartSleep = async () => {
    const startTime = new Date().toISOString();
    await AsyncStorage.setItem("sleepStart", startTime);
    setSleepStart(startTime);
    setIsSleeping(true);

    fallbackTimerRef.current = setTimeout(async () => {
      await recordSleepDuration(8);
      Alert.alert("Sleep complete", "8 hours passed — good morning!");
      setIsSleeping(false);
      await AsyncStorage.removeItem("sleepStart");
    }, 8 * 60 * 60 * 1000);
  };

  const handleWakeUp = async () => {
    if (!sleepStart) {
      Alert.alert("No sleep session found");
      return;
    }
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    const start = new Date(sleepStart);
    const now = new Date();
    const duration = ((now - start) / 36e5).toFixed(1);
    await recordSleepDuration(duration);
    Alert.alert("Good morning!", `You slept for ${duration} hours.`);
    setIsSleeping(false);
    await AsyncStorage.removeItem("sleepStart");
  };

  // ===== Alarm Scheduling (Notifee) =====
  const scheduleAlarm = async (h, m, p, id) => {
    const hour24 = to24Hour(h, p);
    const triggerDate = new Date();
    triggerDate.setHours(hour24, m, 0, 0);
    if (triggerDate <= new Date()) triggerDate.setDate(triggerDate.getDate() + 1);

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
    };

    const channelId = await notifee.createChannel({
      id: "alarm",
      name: "Alarm Notifications",
      sound: "default",
    });

    const notifId = await notifee.createTriggerNotification(
      {
        title: "⏰ Alarm",
        body: `It's ${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")} ${p}. DND will activate for 8 hours.`,
        android: { channelId },
        data: { alarmId: id },
      },
      trigger
    );

    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notifId } : a))
    );
  };

  const cancelAlarm = async (notifId) => {
    if (notifId) await notifee.cancelNotification(notifId);
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

  // ===== Next alarm countdown =====
  const updateNextAlarm = () => {
    const now = new Date();
    const future = alarms
      .filter((a) => a.active)
      .map((a) => {
        const t = new Date();
        const h24 = to24Hour(a.hour, a.period);
        t.setHours(h24, a.minute, 0, 0);
        if (t <= now) t.setDate(t.getDate() + 1);
        return t;
      })
      .sort((a, b) => a - b);
    setNextAlarmTime(future[0] || null);
  };

  useEffect(() => {
    if (!nextAlarmTime) {
      setCountdown("");
      return;
    }
    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextAlarmTime - now;
      if (diff <= 0) {
        setCountdown("Alarm ringing soon!");
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

  // ===== UI =====
  const renderAlarm = ({ item }) => (
    <View style={SleepAlarmStyles.components}>
      <Text style={SleepAlarmStyles.alarmText}>
        {item.hour.toString().padStart(2, "0")}:
        {item.minute.toString().padStart(2, "0")} {item.period}
      </Text>
      <View style={SleepAlarmStyles.alarmActions}>
        <Switch
          value={item.active}
          onValueChange={() => toggleAlarm(item.id)}
          trackColor={{ true: "#77b86c", false: "#ccc" }}
          thumbColor={Platform.OS === "android" ? "#fff" : undefined}
        />
        <TouchableOpacity
          style={SleepAlarmStyles.deleteButton}
          onPress={() =>
            Alert.alert("Delete Alarm", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteAlarm(item.id),
              },
            ])
          }
        >
          <Text style={SleepAlarmStyles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={SleepAlarmStyles.container}>
      <ScrollView>
        <Text style={SleepAlarmStyles.title}>⏰ Alarm & Sleep Tracker</Text>

        {/* Sleep Tracker */}
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

        {/* Alarm Setter */}
        <View style={SleepAlarmStyles.card}>
          <Text style={SleepAlarmStyles.header}>Set Alarm</Text>
          <View style={SleepAlarmStyles.timeContainer}>
            <View style={SleepAlarmStyles.box}>
              <Picker
                selectedValue={hour}
                onValueChange={setHour}
                style={SleepAlarmStyles.innerPicker}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item key={i} label={(i + 1).toString()} value={i + 1} />
                ))}
              </Picker>
            </View>
            <Text style={SleepAlarmStyles.colon}>:</Text>
            <View style={SleepAlarmStyles.box}>
              <Picker
                selectedValue={minute}
                onValueChange={setMinute}
                style={SleepAlarmStyles.innerPicker}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item key={i} label={i.toString().padStart(2, "0")} value={i} />
                ))}
              </Picker>
            </View>
            <View style={SleepAlarmStyles.periodContainer}>
              {["AM", "PM"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    SleepAlarmStyles.periodButton,
                    period === p && SleepAlarmStyles.periodActive,
                  ]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={SleepAlarmStyles.periodText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={SleepAlarmStyles.setButton} onPress={addAlarm}>
            <Text style={SleepAlarmStyles.setButtonText}>Set Alarm</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown */}
        {nextAlarmTime && (
          <View style={SleepAlarmStyles.countdownContainer}>
            <Text style={SleepAlarmStyles.countdownText}>
              ⏰ Next alarm in: {countdown}
            </Text>
          </View>
        )}

        {/* Alarms List */}
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
