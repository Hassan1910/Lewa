import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorState, Icon, LoadingState } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { listMyPayments } from '@/services/payments';
import { formatCurrency, formatDate } from '@/utils/format';

export default function PaymentsScreen() {
  const { session } = useAuth();
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payments', session?.user.id],
    queryFn: () => listMyPayments(session!.user.id),
    enabled: Boolean(session?.user.id),
  });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Payments</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Paystack receipts in Kenyan Shillings.
        </ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {!session ? (
          <EmptyState
            icon="creditcard.fill"
            title="Sign in to view payments"
            actionLabel="Sign in"
            onAction={() => router.push('/(auth)/sign-in')}
          />
        ) : isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : data.length === 0 ? (
          <EmptyState icon="creditcard.fill" title="No payments yet" message="Bookings and donations will appear here after Paystack confirms them." />
        ) : (
          data.map((p) => (
            <View key={p.id} style={[styles.card, { borderColor: Colors.light.border }]}>
              <ThemedText type="h3">{formatCurrency(p.amount, { currency: p.currency })}</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {p.purpose ?? 'payment'} · {p.status}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {p.reference} · {formatDate(p.createdAt)}
              </ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.sm },
  back: { width: 32, height: 32, justifyContent: 'center' },
  content: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.huge },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    gap: Spacing.xs,
  },
});
