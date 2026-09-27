import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ErrorState, Icon, LoadingState } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { listAboutSections } from '@/services/content';

export default function AboutScreen() {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['about'],
    queryFn: listAboutSections,
  });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">About Lewa</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          A UNESCO World Heritage landscape in northern Kenya.
        </ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {data.map((section) => (
          <View key={section.key} style={[styles.card, { borderColor: Colors.light.border }]}>
            <ThemedText type="h3">{section.title}</ThemedText>
            <ThemedText type="body" themeColor="textSecondary">
              {section.body}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
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
    gap: Spacing.sm,
  },
});
