import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VerlosungsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Wöchentliche Verlosung</Text>
      <Text style={styles.subtitle}>Bewerte mindestens 1 Produkt um teilzunehmen!</Text>
      <Text style={styles.info}>Der Gewinner wird jeden Montag gezogen.</Text>
      <Text style={styles.prize}>Aktueller Preis: wird von Kurt festgelegt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F5F0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2D7A3A', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 12 },
  info: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  prize: { fontSize: 16, fontWeight: '600', color: '#2D7A3A', textAlign: 'center' },
});