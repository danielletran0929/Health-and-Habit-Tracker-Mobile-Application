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
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import notifee, { TriggerType, EventType } from "@notifee/react-native";
import SleepAlarmStyles from "../styles/SleepAlarmStyles";

export default function SleepAlarmScreen() {
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
  const fallbackTimerRef = useRef(null);

  const to24Hour = (h, p) =>
    p === "PM" && h !== 12 ? h + 12 : p === "AM" && h === 12 ? 0 : h;

  // ===== Load saved states =====
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
      } catch (e) {
        console.log("Error loading state:", e);
      }
    })();
  }, []);

  // ===== Save alarms whenever they change =====
  useEffect(() => {
    AsyncStorage.setItem("alarms", JSON.stringify(alarms));
    updateNextAlarm();
  }, [alarms]);

  // ===== Sleep Tracking =====
  const handleStartSleep = async () => {
    const startTime = new Date().toISOString();
    await AsyncStorage.setItem("sleepStart", startTime);
    setSleepStart(startTime);
    setIsSleeping(true);
    
    fallbackTimerRef.current = setTimeout(async () => {
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
    Alert.alert("Good morning!", `You slept for ${duration} hours.`);
    setIsSleeping(false);
    await AsyncStorage.removeItem("sleepStart");
  };

  // ===== Alarm Scheduling (using Notifee) =====
  const scheduleAlarm = async (h, m, p, id) => {
    const hour24 = to24Hour(h, p);
    const trigger = new Date();
    trigger.setHours(hour24, m, 0, 0);
    if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

    const triggerObj = {
      type: TriggerType.TIMESTAMP,
      timestamp: trigger.getTime(),
      alarmManager: true,
    };

    const notifId = await notifee.createTriggerNotification(
      {
        title: "⏰ Alarm",
        body: `It's ${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")} ${p}. Do Not Disturb mode will activate for 8 hours.`,
      },
      triggerObj
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

  // ===== Handle DND when alarm triggers =====
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const event = await notifee.getInitialNotification();
        if (event?.notification) {
          setDnd(true);
          const end = new Date(Date.now() + 8 * 60 * 60 * 1000);
          setDndEnd(end);
          await AsyncStorage.setItem(
            "dndState",
            JSON.stringify({ active: true, end })
          );
        }
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!dnd || !dndEnd) return;
    const timer = setInterval(async () => {
      if (new Date() >= dndEnd) {
        setDnd(false);
        setDndEnd(null);
        await AsyncStorage.removeItem("dndState");
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [dnd, dndEnd]);

  // ===== Next Alarm Countdown =====
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

  // ===== Render Alarm Item =====
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
            <TouchableOpacity
              style={SleepAlarmStyles.button}
              onPress={handleStartSleep}
            >
              <Text style={SleepAlarmStyles.buttonText}>Start Sleep</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={SleepAlarmStyles.button}
              onPress={handleWakeUp}
            >
              <Text style={SleepAlarmStyles.buttonText}>I’m Awake</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Time Picker */}
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
                  <Picker.Item
                    key={i}
                    label={i.toString().padStart(2, "0")}
                    value={i}
                  />
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
          <TouchableOpacity
            style={SleepAlarmStyles.setButton}
            onPress={addAlarm}
          >
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

        {/* DND Status */}
        <View
          style={[
            SleepAlarmStyles.dndContainer,
            dnd ? SleepAlarmStyles.dndOn : SleepAlarmStyles.dndOff,
          ]}
        >
          <Text style={SleepAlarmStyles.dndText}>
            Do Not Disturb is {dnd ? "ON" : "OFF"}
          </Text>
          <TouchableOpacity
  style={SleepAlarmStyles.setButton}
  onPress={() => setDnd(!dnd)}
>
  <Text style={SleepAlarmStyles.setButtonText}>
    Toggle DND ({dnd ? "ON" : "OFF"})
  </Text>
</TouchableOpacity>

        </View>

        {/* Alarm List */}
        <Text style={SleepAlarmStyles.subTitle}>Your Alarms</Text>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarm}
          ListEmptyComponent={
            <Text style={SleepAlarmStyles.empty}>No alarms set</Text>
          }
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}
