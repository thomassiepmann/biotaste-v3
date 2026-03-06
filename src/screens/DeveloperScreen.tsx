import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackendHealthCard from '../components/BackendHealthCard';
import { theme } from '../constants/theme';
import { useBackendAuth } from '../hooks/useBackendAuth';
import { useBackendLottery } from '../hooks/useBackendLottery';
import { useBackendReviews } from '../hooks/useBackendReviews';
import { getApiBaseUrl } from '../lib/api';

export default function DeveloperScreen() {
  const auth = useBackendAuth();
  const reviews = useBackendReviews();
  const lottery = useBackendLottery();

  const runLotteryEntry = async () => {
    try {
      await lottery.submitEntry();
    } catch {
      // Fehler wird bereits im Hook-State hinterlegt
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Developer / Debug</Text>
      <Text style={styles.subtitle}>Backend- und Integrationsstatus zentral prüfen</Text>

      <BackendHealthCard />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Auth Status</Text>
          <StatusBadge ok={auth.ok} loading={auth.loading} />
        </View>
        <Text style={styles.label}>Endpoint</Text>
        <Text style={styles.value}>{getApiBaseUrl() || '(nicht gesetzt)'}/api/auth/me</Text>

        <Text style={styles.label}>Authenticated</Text>
        <Text style={styles.value}>
          {auth.loading ? 'Prüfe...' : auth.data?.authenticated ? 'Ja' : 'Nein/Unbekannt'}
        </Text>

        {auth.data?.user?.name ? (
          <>
            <Text style={styles.label}>User</Text>
            <Text style={styles.value}>{auth.data.user.name}</Text>
          </>
        ) : null}

        {auth.error ? <Text style={styles.error}>Fehler: {auth.error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={auth.refresh} disabled={auth.loading}>
          <Text style={styles.buttonText}>{auth.loading ? 'Lade...' : 'Auth neu laden'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Reviews</Text>
          <StatusBadge ok={reviews.ok} loading={reviews.loading} />
        </View>

        <Text style={styles.label}>Endpoint</Text>
        <Text style={styles.value}>{getApiBaseUrl() || '(nicht gesetzt)'}/api/reviews</Text>

        <Text style={styles.label}>Gefundene Einträge</Text>
        <Text style={styles.value}>{reviews.loading ? 'Lade...' : reviews.items.length}</Text>

        {reviews.items.length > 0 ? (
          <>
            <Text style={styles.label}>Beispiel</Text>
            <Text style={styles.valueSmall}>
              #{String(reviews.items[0].id)} · {reviews.items[0].comment || 'ohne Kommentar'}
            </Text>
          </>
        ) : null}

        {reviews.error ? <Text style={styles.error}>Fehler: {reviews.error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={reviews.refresh} disabled={reviews.loading}>
          <Text style={styles.buttonText}>{reviews.loading ? 'Lade...' : 'Reviews neu laden'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Lottery</Text>
          <StatusBadge ok={lottery.ok} loading={lottery.loading || lottery.submitting} />
        </View>

        <Text style={styles.label}>Status Endpoint</Text>
        <Text style={styles.value}>{getApiBaseUrl() || '(nicht gesetzt)'}/api/lottery/status</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{lottery.loading ? 'Lade...' : lottery.data?.status || '-'}</Text>

        {lottery.data?.message ? (
          <>
            <Text style={styles.label}>Nachricht</Text>
            <Text style={styles.valueSmall}>{lottery.data.message}</Text>
          </>
        ) : null}

        {lottery.submitResult?.message ? (
          <Text style={styles.info}>Letzter Enter-Call: {lottery.submitResult.message}</Text>
        ) : null}

        {lottery.error ? <Text style={styles.error}>Fehler: {lottery.error}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={lottery.refresh} disabled={lottery.loading}>
            <Text style={styles.buttonText}>{lottery.loading ? 'Lade...' : 'Status laden'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonHalf}
            onPress={runLotteryEntry}
            disabled={lottery.submitting}
          >
            <Text style={styles.buttonText}>{lottery.submitting ? 'Sende...' : 'Enter testen'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Supabase Info (Placeholder)</Text>
        <Text style={styles.valueSmall}>EXPO_PUBLIC_SUPABASE_URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? 'gesetzt' : 'nicht gesetzt'}</Text>
        <Text style={styles.valueSmall}>EXPO_PUBLIC_SUPABASE_ANON_KEY: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'gesetzt' : 'nicht gesetzt'}</Text>
      </View>
    </ScrollView>
  );
}

function StatusBadge({ ok, loading }: { ok: boolean; loading: boolean }) {
  if (loading) {
    return (
      <View style={[styles.badge, styles.badgePending]}>
        <Text style={styles.badgeText}>LÄUFT</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeFail]}>
      <Text style={styles.badgeText}>{ok ? 'OK' : 'FAIL'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grayLight,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 56,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.gray,
  },
  value: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  valueSmall: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  button: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  buttonHalf: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 13,
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
  badgePending: {
    backgroundColor: '#FFF4CC',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.red,
    marginTop: theme.spacing.xs,
    fontSize: 12,
  },
  info: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: 12,
  },
});
