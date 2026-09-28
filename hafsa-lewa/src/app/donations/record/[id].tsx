import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorState, Icon, LoadingState, StatusBadge, type StatusBadgeTone } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getDonationById } from '@/services/donations';
import { getLatestDonationPayment } from '@/services/payments';
import { downloadReceipt } from '@/utils/download-receipt';
import { formatCurrency, formatDate } from '@/utils/format';
import { donationReceiptModel } from '@/utils/receipt';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  success: 'success',
  succeeded: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  cancelled: 'neutral',
  refunded: 'neutral',
};

export default function DonationRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const donationQuery = useQuery({
    queryKey: ['donations', 'record', id],
    queryFn: () => getDonationById(id!),
    enabled: Boolean(id && session?.user.id),
  });
  const paymentQuery = useQuery({
    queryKey: ['payments', 'donation', id],
    queryFn: () => getLatestDonationPayment(id!),
    enabled: Boolean(id && session?.user.id),
  });

  if (!session) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="person.crop.circle"
          title="Sign in to view this donation"
          message="Gifts stay on the account that made them."
          actionLabel="Sign in"
          onAction={() => router.replace('/(auth)/sign-in')}
        />
      </View>
    );
  }

  if (donationQuery.isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState label="Loading donation" />
      </View>
    );
  }

  if (donationQuery.error) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={(donationQuery.error as Error).message} onRetry={() => donationQuery.refetch()} />
      </View>
    );
  }

  const donation = donationQuery.data;
  if (!donation) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="heart.fill"
          title="Donation unavailable"
          message="This gift could not be found. It may belong to another account."
          actionLabel="Your gifts"
          onAction={() => router.replace('/donations/history')}
        />
      </View>
    );
  }

  const payment = paymentQuery.data ?? null;
  const paid = donation.status === 'success' || donation.status === 'succeeded';

  const onDownload = async () => {
    if (!payment || payment.status !== 'success') return;
    setDownloading(true);
    try {
      await downloadReceipt(donationReceiptModel(donation, payment));
    } catch (err) {
      Alert.alert('Receipt', err instanceof Error ? err.message : 'Could not download this receipt');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">{donation.campaignTitle}</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          {donation.reference}
        </ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusBadge label={donation.status.replace('_', ' ')} tone={STATUS_TONE[donation.status] ?? 'neutral'} />
        <View style={[styles.card, { borderColor: Colors.light.border }]}>
          <Row label="Receipt" value={payment?.receiptNumber ?? '—'} />
          <Row label="Donation reference" value={donation.reference} />
          <Row label="Donor" value={donation.donorName ?? '—'} />
          <Row label="Contact" value={donation.donorEmail ?? '—'} />
          <Row label="Campaign" value={donation.campaignTitle} />
          <Row label="Donation date" value={formatDate(donation.createdAt)} />
          <Row label="Amount" value={formatCurrency(donation.amount, { currency: donation.currency, useCode: true })} />
          <Row label="Payment method" value={payment ? paymentMethod(payment.provider) : '—'} />
          <Row label="Transaction" value={payment?.reference ?? '—'} />
          <Row label="Payment status" value={payment?.status ?? donation.status} />
          {donation.message ? <Row label="Message" value={donation.message} /> : null}
        </View>
        <Button
          label="View campaign"
          variant="secondary"
          fullWidth
          onPress={() => router.push(`/donations/${donation.campaignId}`)}
        />
        {paid && payment?.status === 'success' ? (
          <Button label="Download Receipt" fullWidth loading={downloading} onPress={() => void onDownload()} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function paymentMethod(provider: string): string {
  return provider.toLowerCase() === 'paystack' ? 'Paystack' : provider;
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
  header: { padding: Spacing.xl, gap: Spacing.sm },
  back: { width: 32, height: 32, justifyContent: 'center' },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.md },
  card: {
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
