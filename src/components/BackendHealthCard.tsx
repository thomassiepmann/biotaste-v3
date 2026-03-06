import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { useBackendHealth } from '../hooks/useBackendHealth';

export default function BackendHealthCard() {
  const { loading, ok, data, error, endpoint, lastCheckedAt, refresh } = useBackendHealth();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Backend Connectivity Check</Text>
        <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeFail]}>
          <Text style={styles.badgeText}>{ok ? 'OK' : 'FAIL'}</Text>
        </View>
      </View>

      <Text style={styles.metaLabel}>Endpoint</Text>
      <Text style={styles.metaValue}>{endpoint}</Text>

      <Text style={styles.metaLabel}>Status</Text>
      <Text style={styles.metaValue}>{loading ? 'Prüfe...' : data?.status || 'nicht erreichbar'}</Text>

      {typeof data?.version !== 'undefined' && (
        <>
          <Text style={styles.metaLabel}>Version</Text>
          <Text style={styles.metaValue}>{data.version}</Text>
        </>
      )}

      {error && (
        <>
          <Text style={styles.errorLabel}>Fehler</Text>
          <Text style={styles.errorValue}>{error}</Text>
        </>
      )}

      <Text style={styles.timestamp}>
        Last Check: {lastCheckedAt ? new Date(lastCheckedAt).toLocaleString('de-DE') : '-'}
      </Text>

      <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
        <Text style={styles.refreshButtonText}>{loading ? 'Prüfung läuft...' : 'Erneut prüfen'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeOk: {
    backgroundColor: '#D9FBE8',
  },
  badgeFail: {
    backgroundColor: '#FFE1E1',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  metaLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 6,
  },
  metaValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  errorLabel: {
    fontSize: 12,
    color: theme.colors.red,
    marginTop: 6,
    fontWeight: '600',
  },
  errorValue: {
    fontSize: 13,
    color: theme.colors.red,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 10,
  },
  refreshButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
