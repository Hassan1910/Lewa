import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DonationCard, ErrorState, Icon, LoadingState } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { listActiveCampaigns } from '@/services/donations';

export default function DonationsIndex() {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['donations', 'active'],
    queryFn: listActiveCampaigns,
  });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Donate</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Support conservation in Kenyan Shillings. Every gift is verified before it is counted.
        </ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {data.map((c) => (
          <DonationCard
            key={c.id}
            title={c.title}
            summary={c.summary}
            imageUrl={c.coverImage}
            goal={c.goalAmount}
            raised={c.amountRaised}
            currency={c.currency}
            onPress={() => router.push(`/donations/${c.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.sm },
  back: { width: 32, height: 32, justifyContent: 'center' },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.lg },
});
