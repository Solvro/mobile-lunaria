import { StyleSheet } from 'react-native';

export const colors = {
  plum: '#29152F',
  plumSoft: '#3A2342',
  lavender: '#D8C5E6',
  silver: '#D9D6DD',
  cream: '#FFF9F0',
  creamMuted: '#EEE7DE',
  green: '#7F9B73',
  rose: '#C78B9D',
  text: '#29152F',
  muted: '#6F6573',
  border: '#DDD4E1',
  white: '#FFFFFF',
};

export const shadow = StyleSheet.create({
  card: {
    shadowColor: '#29152F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
}).card;
