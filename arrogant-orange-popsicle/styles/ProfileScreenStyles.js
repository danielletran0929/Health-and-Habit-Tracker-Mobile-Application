import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3FFF0',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2F6B50',
    marginBottom: 25,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginVertical: 6,
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#2F6B50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
