import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  ImageWithFallback,
  LoadingState,
  StatusBadge,
  type StatusBadgeTone,
} from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getBookingById } from '@/services/bookings';
import type { PaymentStatus } from '@/services/types';
import { formatCurrency, formatDate } from '@/utils/format';

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  success: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const PAYMENT_TONE: Record<PaymentStatus, StatusBadgeTone> = {
  pending: 'warning',
  processing: 'warning',
  success: 'success',
  failed: 'error',
  cancelled: 'neutral',
  refunded: 'neutral',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => getBookingById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="calendar"
          title="Booking unavailable"
          message="This reservation could not be found. It may belong to another account."
          actionLabel="My bookings"
          onAction={() => router.replace('/(tabs)/bookings')}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          {booking.imageUrl ? (
            <ImageWithFallback uri={booking.imageUrl} style={StyleSheet.absoluteFill} fallbackIcon="binoculars.fill" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.heroFallback]} />
          )}
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
              <Icon name="chevron.left" size={20} color={Colors.light.text} />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.badges}>
            <StatusBadge label={BOOKING_STATUS_LABEL[booking.status]} tone={BOOKING_STATUS_TONE[booking.status]} />
            <StatusBadge label={PAYMENT_LABEL[booking.paymentStatus]} tone={PAYMENT_TONE[booking.paymentStatus]} />
          </View>
          <ThemedText type="h1">{booking.serviceTitle}</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Ref {booking.reference}
          </ThemedText>

          <View style={[styles.card, { borderColor: Colors.light.border }]}>
            <Row label="Experience" value={booking.serviceTitle} />
            <Row label="Date" value={formatDate(booking.bookingDate)} />
            <Row label="Guests" value={String(booking.guests)} />
            <Row label="Amount" value={formatCurrency(booking.amount, { currency: booking.currency })} />
            <Row label="Booking status" value={BOOKING_STATUS_LABEL[booking.status]} />
            <Row label="Payment" value={PAYMENT_LABEL[booking.paymentStatus]} />
          </View>

          <Button
            label="View experience"
            variant="secondary"
            fullWidth
            onPress={() => router.push(`/tourism/${booking.serviceId}`)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="bodySmall" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="bodyMedium" style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingBottom: Spacing.huge },
  hero: {
    height: 220,
    backgroundColor: Colors.light.primaryLight,
  },
  heroFallback: {
    backgroundColor: Colors.light.primaryLight,
  },
  heroSafe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  card: {
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowValue: { textAlign: 'right', flex: 1, marginLeft: Spacing.md },
});
