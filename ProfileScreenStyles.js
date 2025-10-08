import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A8E6A3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  label: {
    fontSize: 18,
    marginBottom: 10,
  },

  value: {
    fontWeight: '600',
  },

  notLoggedIn: {
    fontSize: 18,
    marginBottom: 20,
  },

  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },

  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
