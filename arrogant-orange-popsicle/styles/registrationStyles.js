import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => Math.round(size * (width / 375));

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A8E6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.06,
    width: '85%',
    elevation: 3,
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.025,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: height * 0.015,
    marginBottom: height * 0.012,
    fontSize: scaleFont(14),
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: height * 0.015,
    alignItems: 'center',
    marginBottom: height * 0.012,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(16),
  },
  backText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: height * 0.015,
    fontSize: scaleFont(14),
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: height * 0.015,
    fontSize: scaleFont(14),
  },
});
