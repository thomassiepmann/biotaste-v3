import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../constants/theme';

interface LosesAnimationProps {
  losesEarned: number;
  onComplete?: () => void;
}

export default function LosesAnimation({ losesEarned, onComplete }: LosesAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animations-Sequenz
    Animated.sequence([
      // Einblenden und Skalieren
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Kurz halten
      Animated.delay(1500),
      // Ausblenden
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, [losesEarned]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animationBox,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Text style={styles.ticketEmoji}>🎟️</Text>
        <Text style={styles.losesText}>
          +{losesEarned} {losesEarned === 1 ? 'Los' : 'Lose'}
        </Text>
        <Text style={styles.subText}>gesammelt!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  animationBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  ticketEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  losesText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
