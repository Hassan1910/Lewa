import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, Icon, ImageWithFallback, SearchBar } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { searchAll, type SearchResult } from '@/services/search';

const SUGGESTIONS = ['Rhino', 'Marathon', 'Safari', 'Community', 'Elephant', 'Photography'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: results = [], refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: query.trim().length > 0,
  });
  const refreshResults = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshResults);

  const goto = (result: SearchResult) => router.push(result.href as never);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <Icon name="xmark" size={20} color={Colors.light.text} />
        </Pressable>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search wildlife, tours, events…"
        />
      </View>

      {query.trim().length === 0 ? (
        <View style={styles.suggestions}>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.suggestLabel}>
            Try searching for
          </ThemedText>
          <View style={styles.suggestList}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setQuery(s)}
                style={[styles.suggestChip, { borderColor: Colors.light.border }]}
              >
                <ThemedText type="bodySmall">{s}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="No results"
          message={`Nothing matches "${query.trim()}". Try a different term.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          refreshControl={refreshControl}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => goto(item)}>
              <ImageWithFallback uri={item.imageUrl} style={styles.thumb} fallbackIcon="photo" />
              <View style={styles.rowBody}>
                <ThemedText type="caption" themeColor="textSecondary" style={styles.typeLabel}>
                  {item.type.toUpperCase()}
                </ThemedText>
                <ThemedText type="bodyMedium">{item.title}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <Icon name="chevron.right" size={16} color={Colors.light.textSecondary} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    alignSelf: 'flex-end',
  },
  suggestions: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  suggestLabel: {
    marginBottom: Spacing.xs,
  },
  suggestList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  typeLabel: {
    letterSpacing: 1,
  },
});
