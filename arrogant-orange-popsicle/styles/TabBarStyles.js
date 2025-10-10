import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => Math.round(size * (width / 375));
const scaleHeight = (size) => Math.round(size * (height / 667));

export default StyleSheet.create({
  container: {
    backgroundColor: '#A8E6A3',
    borderTopColor: '#7CC47B',
    borderTopWidth: 1,
    height: Platform.OS === 'android' ? scaleHeight(65) : scaleHeight(58),
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'android' ? scaleHeight(5) : 0,
    elevation: 8,
  },
  label: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    paddingBottom: scaleHeight(4),
  },
  activeTint: {
    color: '#2F6B50',
  },
  inactiveTint: {
    color: '#5E8A67',
  },
});
