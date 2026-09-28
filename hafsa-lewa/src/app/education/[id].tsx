import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorState, Icon, ImageWithFallback, LoadingState, StatusBadge } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { getEducationResource } from '@/services/content';
import { shareLewaItem } from '@/utils/share';

export default function EducationArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['education', id],
    queryFn: () => getEducationResource(id!),
    enabled: Boolean(id),
  });
  const refreshArticle = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshArticle, { tintColor: '#FFFFFF' });

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState />
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

  if (!article) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="book.fill"
          title="Article unavailable"
          message="This story is no longer published."
          actionLabel="Back to Learn"
          onAction={() => router.replace('/education')}
        />
      </View>
    );
  }

  const paragraphs = (article.content ?? article.summary ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={refreshControl}
      >
        <View style={styles.hero}>
          <ImageWithFallback uri={article.coverImage} style={StyleSheet.absoluteFill} fallbackIcon="book.fill" />
          <LinearGradient
            colors={['rgba(15,23,17,0.45)', 'rgba(15,23,17,0)', 'rgba(15,23,17,0.88)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroActions}>
              <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={12}>
                <Icon name="chevron.left" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => void shareLewaItem(article.title, article.summary)}
                style={styles.iconButton}
                hitSlop={12}
                accessibilityLabel="Share article"
              >
                <Icon name="square.and.arrow.up" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.chipRow}>
            {article.category ? <StatusBadge label={article.category} tone="primary" /> : null}
            {article.readingMinutes ? (
              <ThemedText type="caption" themeColor="textSecondary">
                {article.readingMinutes} min read
              </ThemedText>
            ) : null}
          </View>
          <ThemedText type="h1">{article.title}</ThemedText>
          {article.summary ? (
            <ThemedText type="body" themeColor="textSecondary">
              {article.summary}
            </ThemedText>
          ) : null}
          {paragraphs.map((paragraph, index) => (
            <ThemedText key={index} type="body">
              {paragraph}
            </ThemedText>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingBottom: Spacing.huge, flexGrow: 1 },
  hero: { height: 280, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xl },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,17,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
