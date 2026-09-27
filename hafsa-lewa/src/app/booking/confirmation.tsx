import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatCurrency, formatDateOnly } from '@/utils/format';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{
    reference?: string;
    serviceTitle?: string;
    date?: string;
    guests?: string;
    total?: string;
    status?: string;
  }>();
  const paid = params.status === 'success';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon
            name={paid ? 'checkmark.circle.fill' : 'clock'}
            size={56}
            color={paid ? Colors.light.primary : Colors.light.accent}
          />
        </View>
        <ThemedText type="h1" style={styles.center}>
          {paid ? 'Booking confirmed' : 'Payment pending'}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.center}>
          {paid
            ? 'Paystack verified your payment. You can find this booking in the Bookings tab.'
            : 'If you completed checkout, confirmation can take a moment while Paystack notifies us. Check Bookings for the latest status.'}
        </ThemedText>

        <View style={[styles.card, { borderColor: Colors.light.border }]}>
          <Row label="Reference" value={params.reference ?? '—'} />
          <Row label="Experience" value={params.serviceTitle ?? '—'} />
          <Row label="Date" value={params.date ? formatDateOnly(String(params.date)) : '—'} />
          <Row label="Guests" value={params.guests ?? '—'} />
          <Row label="Amount" value={params.total ? formatCurrency(Number(params.total)) : '—'} />
          <Row label="Status" value={paid ? 'Paid · confirmed' : params.status ?? 'pending'} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="View my bookings" fullWidth onPress={() => router.replace('/(tabs)/bookings')} />
        <Button label="Back to home" variant="tertiary" fullWidth onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
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
  content: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  center: { textAlign: 'center' },
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    alignSelf: 'stretch',
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowValue: { textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  footer: { padding: Spacing.xl, gap: Spacing.md },
});
