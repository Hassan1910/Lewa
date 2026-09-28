import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorState, Icon, LoadingState, StatusBadge } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useAuth } from '@/lib/auth-context';
import { listMyDonations } from '@/services/donations';
import { formatCurrency, formatDate } from '@/utils/format';

const STATUS_TONE = {
  success: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  cancelled: 'error',
  refunded: 'neutral',
} as const;

export default function DonationHistoryScreen() {
  const { session } = useAuth();
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['donations', 'mine', session?.user.id],
    queryFn: () => listMyDonations(session!.user.id),
    enabled: Boolean(session?.user.id),
  });
  const refreshGifts = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshGifts);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Your gifts</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Donations on this account, in Kenyan Shillings.
        </ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl}>
        {!session ? (
          <EmptyState
            icon="heart.fill"
            title="Sign in to see your gifts"
            message="Campaigns stay public. Your donation history stays on your account."
            actionLabel="Sign in"
            onAction={() => router.push('/(auth)/sign-in')}
          />
        ) : null}
        {session && isLoading ? <LoadingState /> : null}
        {session && error ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {session && !isLoading && !error && data.length === 0 ? (
          <EmptyState
            icon="heart.fill"
            title="No gifts yet"
            message="When you support a campaign, the gift shows up here after you start checkout."
            actionLabel="Browse campaigns"
            onAction={() => router.push('/donations')}
          />
        ) : null}
        {data.map((gift) => (
          <Pressable
            key={gift.id}
            onPress={() => router.push(`/donations/record/${gift.id}`)}
            style={[styles.card, { borderColor: Colors.light.border }]}
          >
            <View style={styles.cardTop}>
              <ThemedText type="h3" style={styles.title}>
                {gift.campaignTitle}
              </ThemedText>
              <StatusBadge
                label={gift.status.replace('_', ' ')}
                tone={STATUS_TONE[gift.status as keyof typeof STATUS_TONE] ?? 'neutral'}
              />
            </View>
            <ThemedText type="body" themeColor="primary">
              {formatCurrency(gift.amount, { currency: gift.currency })}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {gift.reference} · {formatDate(gift.createdAt)}
            </ThemedText>
          </Pressable>
        ))}
        {session && data.length > 0 ? (
          <Button label="Browse campaigns" variant="secondary" onPress={() => router.push('/donations')} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.sm },
  back: { width: 32, height: 32, justifyContent: 'center' },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.lg, flexGrow: 1 },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    gap: Spacing.xs,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  title: { flex: 1 },
});
