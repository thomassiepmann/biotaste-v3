import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface AmpelBadgeProps {
  status: 'green' | 'yellow' | 'red';
  stars: number;
}

export default function AmpelBadge({ status, stars }: AmpelBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'green':
        return { emoji: '🟢', text: 'Empfohlen', color: theme.colors.primary };
      case 'yellow':
        return { emoji: '🟡', text: 'Beobachten', color: theme.colors.yellow };
      case 'red':
        return { emoji: '🔴', text: 'Prüfen', color: theme.colors.red };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
