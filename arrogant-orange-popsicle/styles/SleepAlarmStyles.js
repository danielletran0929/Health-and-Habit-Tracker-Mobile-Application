import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => Math.round(size * (width / 375));
const scaleHeight = (size) => Math.round(size * (height / 667));

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fff9',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  title: {
    backgroundColor: '#b8e0b0',
    padding: height * 0.025,
    textAlign: 'center',
    fontSize: scaleFont(18),
    color: '#2f6b50',
    marginBottom: height * 0.007,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#b8e0b0',
    borderRadius: 20,
    padding: height * 0.025,
    alignItems: 'center',
    marginTop: height * 0.015,
  },
  header: {
    fontSize: scaleFont(18),
    color: '#2f6b50',
    marginBottom: height * 0.012,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#a9d8a0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  innerPicker: {
    height: height * 0.22,
    width: width * 0.2,
    color: '#2f6b50',
  },
  colon: {
    fontSize: scaleFont(28),
    color: '#2f6b50',
    marginHorizontal: width * 0.013,
  },
  dndContainer: {
    padding: height * 0.015,
    borderRadius: 5,
    marginBottom: height * 0.012,
    alignItems: 'center',
    marginTop: height * 0.015,
  },
  dndText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#000',
  },
  periodContainer: {
    flexDirection: 'column',
    marginLeft: width * 0.025,
  },
  periodButton: {
    backgroundColor: '#a9d8a0',
    borderRadius: 8,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.035,
    marginVertical: height * 0.003,
  },
  periodActive: {
    backgroundColor: '#77b86c',
  },
  periodText: {
    fontSize: scaleFont(16),
    color: '#2f6b50',
    fontWeight: '600',
  },
  liveTimeText: {
    textAlign: 'center',
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: '#2f6b50',
    marginTop: height * 0.012,
  },
  setButton: {
    backgroundColor: '#77b86c',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.11,
    borderRadius: 10,
    marginTop: height * 0.02,
  },
  setButtonText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  subTitle: {
    fontSize: scaleFont(20),
    marginVertical: height * 0.018,
    color: '#2f6b50',
  },
  alarmListContainer: {
    flex: 1,
    maxHeight: height * 0.6,
  },
  components: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  alarmText: {
    fontSize: scaleFont(20),
    color: '#111',
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: width * 0.025,
    padding: height * 0.008,
  },
  deleteText: {
    fontSize: scaleFont(20),
    color: 'red',
  },
  empty: {
    color: '#666',
  },
  dndOn: {
    backgroundColor: '#b9e4c2',
  },
  dndOff: {
    backgroundColor: '#f8caca',
  },
});
