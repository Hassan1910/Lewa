import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { listConservationPrograms } from '@/services/content';

export default function ConservationScreen() {
  const { data: programs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['conservation'],
    queryFn: listConservationPrograms,
  });
  const refreshPrograms = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshPrograms);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Conservation</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Programmes that protect wildlife, habitat and communities.
        </ThemedText>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl}>
        <SectionHeader title="Our work" />
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} /> : null}
        <View style={{ gap: Spacing.md }}>
          {programs.map((p) => (
            <View key={p.id} style={[styles.card, { borderColor: Colors.light.border }]}>
              <ImageWithFallback uri={p.coverImage} style={styles.image} fallbackIcon="leaf.fill" />
              <View style={styles.body}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {p.category}
                </ThemedText>
                <ThemedText type="h3">{p.title}</ThemedText>
                <ThemedText type="bodySmall" themeColor="textSecondary">
                  {p.summary}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  card: {
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
});
