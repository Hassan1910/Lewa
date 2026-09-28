import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaystackCheckoutModal, type PaystackCheckoutResult } from '@/components/paystack-checkout-modal';
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
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useAuth } from '@/lib/auth-context';
import { cancelBooking, getBookingById } from '@/services/bookings';
import {
  confirmCheckout,
  getLatestBookingPayment,
  initializePayment,
  verifyPayment,
  type BookingPayment,
} from '@/services/payments';
import type { BookingDetail, PaymentStatus } from '@/services/types';
import { downloadReceipt } from '@/utils/download-receipt';
import { formatBookingTime, formatCurrency, formatDate, formatDateOnly } from '@/utils/format';
import { bookingReceiptModel } from '@/utils/receipt';

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

type Checkout = {
  paymentId: string;
  reference: string;
  authorizationUrl: string;
  amount: number;
};

type VerifyOutcome = 'idle' | 'pending' | 'failed';

function chargeStillOpen(payment: BookingPayment | null, outcome: VerifyOutcome): boolean {
  if (outcome !== 'pending' || !payment) return false;
  return payment.status === 'pending' || payment.status === 'processing';
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const autoChecked = useRef(false);

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => getBookingById(id!),
    enabled: Boolean(id && session?.user.id),
  });
  const paymentQuery = useQuery({
    queryKey: ['payments', 'booking', id],
    queryFn: () => getLatestBookingPayment(id!),
    enabled: Boolean(id && session?.user.id),
  });
  const refreshPayment = paymentQuery.refetch;
  const refreshBooking = useCallback(async () => {
    await Promise.all([refetch(), refreshPayment()]);
  }, [refreshPayment, refetch]);
  const { refreshControl } = usePullToRefresh(refreshBooking);

  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [verifyOutcome, setVerifyOutcome] = useState<VerifyOutcome>('idle');
  const [openCharge, setOpenCharge] = useState<BookingPayment | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const payment = openCharge ?? paymentQuery.data ?? null;

  const refreshLists = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    await queryClient.invalidateQueries({ queryKey: ['payments', 'booking', id] });
  }, [id, queryClient]);

  const checkVerification = useCallback(async () => {
    if (!id) return;
    setChecking(true);
    try {
      const payment = await getLatestBookingPayment(id);
      if (!payment) {
        setOpenCharge(null);
        setVerifyOutcome('failed');
        return;
      }
      const result = await verifyPayment(payment.reference);
      if (result.status === 'success') {
        setOpenCharge(null);
        setVerifyOutcome('idle');
        await refreshLists();
        return;
      }
      if (result.status === 'pending' || result.status === 'processing') {
        setVerifyOutcome('pending');
        setOpenCharge({ ...payment, status: result.status });
        return;
      }
      setOpenCharge(null);
      setVerifyOutcome('failed');
      await refreshLists();
    } catch (err) {
      Alert.alert('Payment', err instanceof Error ? err.message : 'Could not check payment');
    } finally {
      setChecking(false);
    }
  }, [id, refreshLists]);

  useEffect(() => {
    if (booking?.status !== 'payment_verification' || autoChecked.current) return;
    autoChecked.current = true;
    void checkVerification();
  }, [booking?.status, checkVerification]);

  const openCheckout = (payment: { id: string; reference: string; authorizationUrl: string; amount: number }) => {
    setCheckout({
      paymentId: payment.id,
      reference: payment.reference,
      authorizationUrl: payment.authorizationUrl,
      amount: payment.amount,
    });
  };

  const reopenOpenCharge = () => {
    if (!payment?.authorizationUrl) {
      Alert.alert('Payment', 'This charge is still open with Paystack. Check again in a moment.');
      return;
    }
    openCheckout({
      id: payment.id,
      reference: payment.reference,
      authorizationUrl: payment.authorizationUrl,
      amount: payment.amount,
    });
  };

  const startNewPayment = async (current: BookingDetail) => {
    if (chargeStillOpen(payment, verifyOutcome)) {
      reopenOpenCharge();
      return;
    }
    const email = session?.user.email;
    if (!email) {
      Alert.alert('Payment', 'Add an email to your account before paying.');
      return;
    }
    setPaying(true);
    try {
      const init = await initializePayment({
        purpose: 'booking',
        bookingId: current.id,
        email,
      });
      openCheckout({
        id: init.paymentId,
        reference: init.reference,
        authorizationUrl: init.authorizationUrl,
        amount: init.amount,
      });
    } catch (err) {
      Alert.alert('Payment', err instanceof Error ? err.message : 'Could not start payment');
    } finally {
      setPaying(false);
    }
  };

  const onCheckout = async (result: PaystackCheckoutResult) => {
    const currentCheckout = checkout;
    const currentBooking = booking;
    setCheckout(null);
    if (!currentCheckout || !currentBooking || result.status === 'cancelled') return;
    setPaying(true);
    try {
      const status = await confirmCheckout({
        paymentId: currentCheckout.paymentId,
        reference: result.reference ?? currentCheckout.reference,
      });
      await refreshLists();
      router.replace({
        pathname: '/booking/confirmation',
        params: {
          bookingId: currentBooking.id,
          reference: currentBooking.reference,
          serviceTitle: currentBooking.serviceTitle,
          date: currentBooking.bookingDate,
          guests: String(currentBooking.guests),
          total: String(currentCheckout.amount || currentBooking.amount),
          status,
        },
      });
    } catch (err) {
      Alert.alert('Payment', err instanceof Error ? err.message : 'Could not confirm payment');
    } finally {
      setPaying(false);
    }
  };

  const onDownload = async (current: BookingDetail, payment: BookingPayment) => {
    setDownloading(true);
    try {
      await downloadReceipt(bookingReceiptModel(current, payment));
    } catch (err) {
      Alert.alert('Receipt', err instanceof Error ? err.message : 'Could not download this receipt');
    } finally {
      setDownloading(false);
    }
  };

  if (!session) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="person.crop.circle"
          title="Sign in to view this booking"
          message="Bookings stay on your account."
          actionLabel="Sign in"
          onAction={() => router.replace('/(auth)/sign-in')}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState label="Loading booking" />
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

  const time = formatBookingTime(booking.bookingDate);
  const unpaid = booking.status === 'pending_payment' || booking.status === 'payment_verification';
  const canCancel =
    booking.status === 'pending_payment' ||
    booking.status === 'payment_verification' ||
    booking.status === 'confirmed';
  const stillOpen = booking.status === 'payment_verification' && chargeStillOpen(payment, verifyOutcome);
  const needsNewCharge = booking.status === 'pending_payment' || verifyOutcome === 'failed';
  const paid = payment?.status === 'success';

  const onCancel = () => {
    Alert.alert(
      'Cancel booking',
      booking.status === 'confirmed'
        ? 'Cancel this confirmed reservation? Paystack will not refund it automatically.'
        : 'Cancel this reservation and release the seats?',
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            void cancelBooking(booking.id)
              .then(() => refreshLists())
              .catch((err: unknown) => {
                Alert.alert('Booking', err instanceof Error ? err.message : 'Could not cancel this booking');
              })
              .finally(() => setCancelling(false));
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={refreshControl}
      >
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
            {booking.reference}
          </ThemedText>

          <View style={[styles.card, { borderColor: Colors.light.border }]}>
            <Row label="Booking reference" value={booking.reference} />
            <Row label="Customer" value={booking.leadGuest?.fullName ?? '—'} />
            <Row label="Email" value={booking.leadGuest?.email ?? '—'} />
            <Row label="Phone" value={booking.leadGuest?.phone ?? '—'} />
            <Row label="Experience" value={booking.serviceTitle} />
            <Row label="Date" value={formatDateOnly(booking.bookingDate)} />
            {time ? <Row label="Time" value={time} /> : null}
            <Row label="Guests" value={String(booking.guests)} />
            <Row label="Location" value={booking.meetingPoint ?? 'Lewa Wildlife Conservancy'} />
            {booking.specialRequests ? <Row label="Notes" value={booking.specialRequests} /> : null}
            <Row label="Amount" value={formatCurrency(booking.amount, { currency: booking.currency, useCode: true })} />
            <Row label="Booking status" value={BOOKING_STATUS_LABEL[booking.status]} />
            <Row label="Payment status" value={PAYMENT_LABEL[booking.paymentStatus]} />
            {payment ? <Row label="Transaction" value={payment.reference} /> : null}
            {payment?.paidAt ? <Row label="Paid" value={formatDate(payment.paidAt)} /> : null}
            {payment?.receiptNumber ? <Row label="Receipt" value={payment.receiptNumber} /> : null}
          </View>

          <Button
            label="View experience"
            variant="secondary"
            fullWidth
            onPress={() => router.push(`/tourism/${booking.serviceId}`)}
          />
          {paid && payment ? (
            <Button
              label="Download Receipt"
              fullWidth
              loading={downloading}
              onPress={() => void onDownload(booking, payment)}
            />
          ) : null}
        </View>
      </ScrollView>

      {unpaid || canCancel ? (
        <View style={[styles.footer, { borderColor: Colors.light.border }]}>
          {unpaid && stillOpen ? (
            <>
              <Button
                label="Check again"
                variant="secondary"
                fullWidth
                loading={checking}
                onPress={() => void checkVerification()}
              />
              <Button label="Pay again" fullWidth loading={paying} disabled={checking} onPress={reopenOpenCharge} />
            </>
          ) : unpaid ? (
            <Button
              label={needsNewCharge ? 'Continue payment' : 'Check payment'}
              fullWidth
              loading={paying || checking}
              onPress={() => {
                if (needsNewCharge) void startNewPayment(booking);
                else void checkVerification();
              }}
            />
          ) : null}
          {canCancel ? (
            <Button
              label="Cancel booking"
              variant="destructive"
              fullWidth
              loading={cancelling}
              disabled={paying || checking}
              onPress={onCancel}
            />
          ) : null}
        </View>
      ) : null}

      <PaystackCheckoutModal
        authorizationUrl={checkout?.authorizationUrl ?? null}
        onComplete={(result) => void onCheckout(result)}
      />
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
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
});
