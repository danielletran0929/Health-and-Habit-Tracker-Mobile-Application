import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressCircle } from 'react-native-svg-charts';
import HomeScreenStyles from './styles/HomeScreenStyles';

function HomeScreen() {
  const insets = useSafeAreaInsets();

  const stepProgress = 0.45; // 45%
  const sleepProgress = 0.75; // 75%

  return (
    <SafeAreaView style={HomeScreenStyles.safeArea}>
      {/* Header */}
      <View style={HomeScreenStyles.header}>
        <Text style={HomeScreenStyles.appName}>Furica</Text>
        <TouchableOpacity>
          <Text style={HomeScreenStyles.profileLink}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Main Content */}
      <ScrollView contentContainerStyle={HomeScreenStyles.scrollContent}>
        <View style={HomeScreenStyles.whiteSection}>

          {/* Today’s Summary */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Today’s Summary</Text>
            <Text style={HomeScreenStyles.text}>Steps: 4,500 / 10,000</Text>
            <Text style={HomeScreenStyles.text}>Sleep: 6h 30m / 8h</Text>
          </View>

          {/* Daily Goal Progress */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Daily Goal Progress</Text>
            <View style={HomeScreenStyles.progressContainer}>
              <View style={HomeScreenStyles.progressItem}>
                <ProgressCircle
                  style={HomeScreenStyles.progressCircle}
                  progress={stepProgress}
                  progressColor={'#4CAF50'}
                  backgroundColor={'#E0E0E0'}
                  strokeWidth={6}
                />
                <Text style={HomeScreenStyles.progressLabel}>Steps</Text>
              </View>

              <View style={HomeScreenStyles.progressItem}>
                <ProgressCircle
                  style={HomeScreenStyles.progressCircle}
                  progress={sleepProgress}
                  progressColor={'#81C784'}
                  backgroundColor={'#E0E0E0'}
                  strokeWidth={6}
                />
                <Text style={HomeScreenStyles.progressLabel}>Sleep</Text>
              </View>
            </View>
          </View>

          {/* Streak Tracker */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Your Streak 🔥</Text>
            <Text style={HomeScreenStyles.text}>Steps: 3-day streak</Text>
            <Text style={HomeScreenStyles.text}>Sleep: 2-day streak</Text>
          </View>

          {/* Weekly Highlight */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Weekly Highlight 🌟</Text>
            <Text style={HomeScreenStyles.text}>
              0% exercises this week, perfection
            </Text>
          </View>
          
          {/* Next Alarm */} 
          <View style={HomeScreenStyles.box}> 
            <Text style={HomeScreenStyles.sectionTitle}>Next Alarm</Text> 
            <Text style={HomeScreenStyles.text}>3:00 AM</Text> 
          </View>

          {/* Motivation */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Motivation 💪</Text>
            <Text style={HomeScreenStyles.text}>
              :CAN DO IT FOR THE SHAWTIES LIL BRO"
            </Text>
          </View>

          {/* Quick Shortcuts */}
          <View style={HomeScreenStyles.box}>
            <Text style={HomeScreenStyles.sectionTitle}>Quick Shortcuts</Text>
            <TouchableOpacity>
              <Text style={HomeScreenStyles.link}>Set/Edit Sleep Alarm</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={HomeScreenStyles.link}>View History</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Navbar */}
      <View style={HomeScreenStyles.navBar}>
        <Text style={HomeScreenStyles.navText}>🏠</Text>
        <Text style={HomeScreenStyles.navText}>👣</Text>
        <Text style={HomeScreenStyles.navText}>🛌</Text>
        <Text style={HomeScreenStyles.navText}>📈</Text>
      </View>
    </SafeAreaView>
  );
}

export default function WrappedHomeScreen() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}
