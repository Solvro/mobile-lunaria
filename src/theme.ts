import { StyleSheet } from 'react-native';

export const colors = {
  plum: '#172033',
  plumSoft: '#24324A',
  lavender: '#BFDBFE',
  silver: '#CBD5E1',
  cream: '#F8FAFC',
  creamMuted: '#E8EEF6',
  green: '#0F766E',
  rose: '#F59E0B',
  text: '#172033',
  muted: '#64748B',
  border: '#CBD5E1',
  white: '#FFFFFF',
};

export const shadow = StyleSheet.create({
  card: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
}).card;
