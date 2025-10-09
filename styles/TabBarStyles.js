import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#A8E6A3',
    borderTopColor: '#7CC47B',
    borderTopWidth: 1,
    height: Platform.OS === 'android' ? 65 : 58,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'android' ? 5 : 0,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    paddingBottom: 4,
  },
  activeTint: {
    color: '#2F6B50',
  },
  inactiveTint: {
    color: '#5E8A67', // ✅ slightly lighter green for better icon visibility
  },
});
