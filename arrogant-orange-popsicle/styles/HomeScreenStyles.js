import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Helper for scaling font sizes based on screen width
const scaleFont = (size) => Math.round(size * (width / 375));

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A8E6A3',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // 5% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
  },

  appName: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
  },

  profileLink: {
    fontSize: scaleFont(16),
    color: '#000',
  },

  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.03,
  },

  whiteSection: {
    flex: 1,
  },

  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04, // scale padding to screen width
    elevation: 3,
    marginBottom: height * 0.015,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: scaleFont(16),
    marginBottom: height * 0.008,
  },

  text: {
    fontSize: scaleFont(14),
  },

  link: {
    fontSize: scaleFont(14),
    color: '#007AFF',
    marginTop: height * 0.004,
  },

  // Navbar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },

  navText: {
    fontSize: scaleFont(20),
  },

  navTextActive: {
    color: '#2F6B50',
    fontWeight: '700',
    transform: [{ scale: 1.2 }],
  },

  tipBox: {
    backgroundColor: '#f0fdf4',
    padding: width * 0.035,
    borderRadius: 10,
    marginVertical: height * 0.01,
  },
});
