import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BookingCard, Button, EmptyState, ErrorState, FilterChip, LoadingState } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useAuth } from '@/lib/auth-context';
import { openBookingRecord } from '@/lib/record-navigation';
import { listMyBookings } from '@/services/bookings';

type Tab = 'upcoming' | 'past';

export default function BookingsTab() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', session?.user.id],
    queryFn: () => listMyBookings(session!.user.id),
    enabled: Boolean(session?.user.id),
  });

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const upcomingList = data.filter(
      (b) =>
        new Date(b.bookingDate).getTime() >= now &&
        (b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'payment_verification'),
    );
    const pastList = data.filter(
      (b) =>
        new Date(b.bookingDate).getTime() < now ||
        b.status === 'completed' ||
        b.status === 'cancelled' ||
        b.status === 'refunded',
    );
    return { upcoming: upcomingList, past: pastList };
  }, [data]);

  const list = tab === 'upcoming' ? upcoming : past;
  const refreshBookings = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshBookings);

  if (!session) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <ThemedText type="h1">Bookings</ThemedText>
        </SafeAreaView>
        <EmptyState
          icon="calendar"
          title="Sign in to see bookings"
          message="Create an account to book safaris and track your reservations."
          actionLabel="Sign in"
          onAction={() => router.push('/(auth)/sign-in')}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <ThemedText type="h1">Bookings</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Manage your Lewa experiences.
        </ThemedText>
        <View style={styles.tabs}>
          <FilterChip
            label={`Upcoming · ${upcoming.length}`}
            selected={tab === 'upcoming'}
            onPress={() => setTab('upcoming')}
          />
          <FilterChip label={`Past · ${past.length}`} selected={tab === 'past'} onPress={() => setTab('past')} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
      >
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {!isLoading && !error && list.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
            message={
              tab === 'upcoming'
                ? 'Browse experiences and book your next adventure at Lewa.'
                : 'Your completed bookings will appear here.'
            }
            actionLabel={tab === 'upcoming' ? 'Browse tourism' : undefined}
            onAction={tab === 'upcoming' ? () => router.push('/(tabs)/explore?category=tourism') : undefined}
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {list.map((b) => (
              <BookingCard
                key={b.id}
                serviceTitle={b.serviceTitle}
                imageUrl={b.imageUrl}
                isoDate={b.bookingDate}
                guests={b.guests}
                status={b.status}
                reference={b.reference}
                amount={b.amount}
                currency={b.currency}
                onPress={() => openBookingRecord(b.id)}
              />
            ))}
            {tab === 'upcoming' ? (
              <Button
                label="Book another experience"
                variant="secondary"
                onPress={() => router.push('/(tabs)/explore?category=tourism')}
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.md },
  tabs: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, flexGrow: 1 },
});
