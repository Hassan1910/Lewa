import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaystackCheckoutModal, type PaystackCheckoutResult } from '@/components/paystack-checkout-modal';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, Icon, InputField, LoadingState, QuantityStepper, StatusBadge } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { createBooking } from '@/services/bookings';
import { confirmCheckout, initializePayment, type PaymentInitResult } from '@/services/payments';
import { calculateTourismTotal, getTourismById, getTourismPricingLabel } from '@/services/tourism';
import { formatCurrency, formatDateOnly } from '@/utils/format';

type Step = 'date' | 'guests' | 'details' | 'review';

const STEPS: { key: Step; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'guests', label: 'Guests' },
  { key: 'details', label: 'Details' },
  { key: 'review', label: 'Review' },
];

function nextNDays(n: number): Date[] {
  const days: Date[] = [];
  for (let i = 1; i <= n; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(6, 0, 0, 0);
    days.push(d);
  }
  return days;
}

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { session, profile } = useAuth();
  const { data: service, isLoading } = useQuery({
    queryKey: ['tourism', serviceId],
    queryFn: () => getTourismById(serviceId!),
    enabled: Boolean(serviceId),
  });

  const [step, setStep] = useState<Step>('date');
  const [date, setDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<{ init: PaymentInitResult; bookingReference: string } | null>(null);

  const unitLabel = service ? getTourismPricingLabel(service) : 'per guest';
  const total = service ? calculateTourismTotal(service, guests) : 0;
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  if (!session) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="person.crop.circle"
          title="Sign in to book"
          message="Bookings require an account so we can confirm payment and send your itinerary."
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
        <LoadingState />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="calendar"
          title="Experience unavailable"
          message="Head back and pick another experience to book."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const canAdvance = step === 'date' ? !!date : step === 'details' ? name.length > 1 && email.includes('@') : true;

  const advance = async () => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].key);
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({
        userId: session.user.id,
        serviceId: service.id,
        serviceTitle: service.title,
        imageUrl: service.imageUrl,
        bookingDate: date?.toISOString() ?? new Date().toISOString(),
        guests,
        amount: total,
        currency: service.currency,
        leadGuest: { fullName: name, email, phone },
      });
      const init = await initializePayment({
        purpose: 'booking',
        bookingId: booking.id,
        email,
      });
      setCheckout({ init, bookingReference: booking.reference });
    } catch (err) {
      Alert.alert('Payment', err instanceof Error ? err.message : 'Could not start payment');
    } finally {
      setSubmitting(false);
    }
  };

  const onCheckout = async (result: PaystackCheckoutResult) => {
    const current = checkout;
    setCheckout(null);
    if (!current || !service || result.status === 'cancelled') return;
    setSubmitting(true);
    try {
      const status = await confirmCheckout({
        paymentId: current.init.paymentId,
        reference: result.reference ?? current.init.reference,
      });
      router.replace({
        pathname: '/booking/confirmation',
        params: {
          reference: current.bookingReference,
          serviceTitle: service.title,
          date: date?.toISOString() ?? '',
          guests: String(guests),
          total: String(current.init.amount || total),
          status,
        },
      });
    } catch (err) {
      Alert.alert('Payment', err instanceof Error ? err.message : 'Could not confirm payment');
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => {
    if (stepIndex === 0) return router.back();
    setStep(STEPS[stepIndex - 1].key);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={back} hitSlop={12} style={styles.back}>
            <Icon name="chevron.left" size={22} color={Colors.light.text} />
          </Pressable>
          <ThemedText type="caption" themeColor="textSecondary">
            Step {stepIndex + 1} of {STEPS.length}
          </ThemedText>
        </View>
        <View style={styles.stepper}>
          {STEPS.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.stepDot,
                { backgroundColor: i <= stepIndex ? Colors.light.primary : Colors.light.backgroundElement },
              ]}
            />
          ))}
        </View>
        <ThemedText type="h2">{titleForStep(step)}</ThemedText>
        <ThemedText type="bodySmall" themeColor="textSecondary">
          {service.title}
        </ThemedText>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 'date' ? (
          <View style={styles.list}>
            {nextNDays(10).map((d) => {
              const selected = date?.toDateString() === d.toDateString();
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => setDate(d)}
                  style={[
                    styles.dateRow,
                    {
                      borderColor: selected ? Colors.light.primary : Colors.light.border,
                      backgroundColor: selected ? Colors.light.primaryLight : Colors.light.surface,
                    },
                  ]}
                >
                  <View>
                    <ThemedText type="bodyMedium">{formatDateOnly(d.toISOString())}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {d.toLocaleDateString('en-KE', { weekday: 'long' })}
                    </ThemedText>
                  </View>
                  {selected ? <Icon name="checkmark.circle.fill" size={20} color={Colors.light.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 'guests' ? (
          <View style={styles.center}>
            <ThemedText type="body" themeColor="textSecondary">
              This experience hosts up to {service.capacity} guests.
            </ThemedText>
            <QuantityStepper value={guests} onChange={setGuests} min={1} max={service.capacity} />
            <ThemedText type="caption" themeColor="textSecondary">
              {service.pricingUnit === 'per_guest'
                ? `${formatCurrency(service.price, { currency: service.currency })} ${unitLabel}`
                : `${formatCurrency(service.price, { currency: service.currency })} ${unitLabel} (guests share this rate)`}
            </ThemedText>
          </View>
        ) : null}

        {step === 'details' ? (
          <View style={styles.form}>
            <InputField label="Full name" placeholder="Amira Osman" value={name} onChangeText={setName} autoCapitalize="words" />
            <InputField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <InputField
              label="Phone"
              placeholder="+254 …"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              helper="We only use your phone in case of on-day changes."
            />
          </View>
        ) : null}

        {step === 'review' ? (
          <View style={styles.list}>
            <ReviewRow label="Experience" value={service.title} />
            <ReviewRow label="Date" value={date ? formatDateOnly(date.toISOString()) : '—'} />
            <ReviewRow label="Guests" value={String(guests)} />
            <ReviewRow label="Meeting point" value={service.meetingPoint ?? '—'} />
            <ReviewRow label="Lead guest" value={name || '—'} />
            <ReviewRow label="Contact" value={email || '—'} />
            <View style={styles.divider} />
            <ReviewRow
              label={<ThemedText type="h3">Total</ThemedText>}
              value={
                <ThemedText type="h3" themeColor="primary">
                  {formatCurrency(total, { currency: service.currency })}
                </ThemedText>
              }
            />
            <View style={styles.hint}>
              <StatusBadge label="Paystack · KES" tone="info" />
              <ThemedText type="caption" themeColor="textSecondary">
                You will complete payment in Kenyan Shillings. The booking is confirmed only after Paystack verifies the charge.
              </ThemedText>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderColor: Colors.light.border }]}>
        <View>
          <ThemedText type="caption" themeColor="textSecondary">
            Estimated total
          </ThemedText>
          <ThemedText type="h3" themeColor="primary">
            {formatCurrency(total, { currency: service.currency })}
          </ThemedText>
        </View>
        <Button
          label={step === 'review' ? 'Pay with Paystack' : 'Continue'}
          disabled={!canAdvance}
          loading={submitting}
          onPress={() => void advance()}
          trailingIcon={<Icon name="arrow.right" size={16} color="#FFFFFF" />}
        />
      </View>
      <PaystackCheckoutModal authorizationUrl={checkout?.init.authorizationUrl ?? null} onComplete={(result) => void onCheckout(result)} />
    </View>
  );
}

function titleForStep(step: Step): string {
  switch (step) {
    case 'date':
      return 'Choose a date';
    case 'guests':
      return 'How many guests?';
    case 'details':
      return 'Lead guest details';
    case 'review':
      return 'Review & pay';
  }
}

function ReviewRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View style={styles.reviewRow}>
      {typeof label === 'string' ? (
        <ThemedText type="bodySmall" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : (
        label
      )}
      {typeof value === 'string' ? <ThemedText type="body">{value}</ThemedText> : value}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.md, backgroundColor: Colors.light.background },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', gap: Spacing.xs },
  stepDot: { flex: 1, height: 4, borderRadius: 2 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge * 2, gap: Spacing.lg },
  list: { gap: Spacing.md },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  center: { alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.xxl },
  form: { gap: Spacing.lg },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.light.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  divider: { height: Spacing.md },
  hint: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.backgroundElement,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
