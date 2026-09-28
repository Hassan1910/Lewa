import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { listEducationResources } from '@/services/content';

export default function EducationScreen() {
  const { data: articles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['education'],
    queryFn: listEducationResources,
  });
  const refreshArticles = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshArticles);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Learn</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Stories, science and long reads from the field.
        </ThemedText>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl}>
        <SectionHeader title="Latest articles" />
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} /> : null}
        <View style={{ gap: Spacing.md }}>
          {articles.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => router.push(`/education/${a.id}` as never)}
              style={[styles.card, { borderColor: Colors.light.border }]}
            >
              <ImageWithFallback uri={a.coverImage} style={styles.image} fallbackIcon="book.fill" />
              <View style={styles.body}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {a.category}
                  {a.readingMinutes ? ` · ${a.readingMinutes} min read` : ''}
                </ThemedText>
                <ThemedText type="h3">{a.title}</ThemedText>
                <ThemedText type="bodySmall" themeColor="textSecondary">
                  {a.summary}
                </ThemedText>
              </View>
            </Pressable>
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
  image: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: Spacing.lg, gap: Spacing.xs },
});
