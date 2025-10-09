import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A8E6A3',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  appName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  profileLink: {
    fontSize: 16,
    color: '#000',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  whiteSection: {
    flex: 1,
  },

  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    marginBottom: 12,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },

  text: {
    fontSize: 14,
  },

  link: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },

  // Progress circles section
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
  },

  progressItem: {
    alignItems: 'center',
  },

  progressCircle: {
    height: 60,
    width: 60,
  },

  progressLabel: {
    fontSize: 13,
    marginTop: 6,
  },

  // Navbar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },

  navText: {
    fontSize: 20,
  },

    navTextActive: {
    color: '#2F6B50',
    fontWeight: '700',
    transform: [{ scale: 1.2 }],
  },

});