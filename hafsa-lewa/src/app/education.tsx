import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { listEducationResources } from '@/services/content';

export default function EducationScreen() {
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['education'],
    queryFn: listEducationResources,
  });

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

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Latest articles" />
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} /> : null}
        <View style={{ gap: Spacing.md }}>
          {articles.map((a) => (
            <View key={a.id} style={[styles.card, { borderColor: Colors.light.border }]}>
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
                {a.content ? (
                  <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={4}>
                    {a.content}
                  </ThemedText>
                ) : null}
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
