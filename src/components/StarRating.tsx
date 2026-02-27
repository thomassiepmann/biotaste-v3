import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={styles.starButton}
        >
          <Text style={styles.star}>
            {star <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    marginHorizontal: 4,
  },
  star: {
    fontSize: 40,
    color: theme.colors.primary,
  },
});
