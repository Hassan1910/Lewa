import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';

export default function DonationSuccessScreen() {
  const params = useLocalSearchParams<{ amount?: string; campaign?: string; status?: string }>();
  const amount = Number(params.amount ?? 0);
  const paid = params.status === 'success';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon name="heart.fill" size={48} color={Colors.light.primary} />
        </View>
        <ThemedText type="h1" style={styles.center}>
          {paid ? 'Thank you' : 'Donation pending'}
        </ThemedText>
        <ThemedText type="h3" themeColor="primary" style={styles.center}>
          {formatCurrency(amount)}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.center}>
          {paid
            ? `Your gift to “${params.campaign ?? 'Lewa'}” is verified and will be counted toward the campaign.`
            : `If you completed Paystack checkout, confirmation can take a moment. Check Payments for the latest status.`}
        </ThemedText>
      </View>
      <View style={styles.footer}>
        <Button label="Back to donations" fullWidth onPress={() => router.replace('/donations')} />
        <Button
          label="Back to home"
          variant="tertiary"
          fullWidth
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
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
  footer: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
});
