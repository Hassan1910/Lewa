import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorState, FilterChip, Icon, LoadingState, SearchBar, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { listFaqs } from '@/services/content';

export default function HelpScreen() {
  const { data: faqs = [], isLoading, error } = useQuery({ queryKey: ['faqs'], queryFn: listFaqs });
  const categories = useMemo(() => Array.from(new Set(faqs.map((f) => f.category))), [faqs]);
  const [category, setCategory] = useState<string>('General');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeCategory = categories.includes(category) ? category : (categories[0] ?? 'General');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs
      .filter((f) => f.category === activeCategory)
      .filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [activeCategory, query, faqs]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Help & FAQ</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Answers to common questions. Can’t find what you need? Send us a note.
        </ThemedText>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search help articles"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              selected={activeCategory === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} /> : null}
        <SectionHeader title={activeCategory} />
        <View style={{ gap: Spacing.sm }}>
          {filtered.length === 0 ? (
            <ThemedText type="bodySmall" themeColor="textSecondary">
              No matching articles. Try a different term.
            </ThemedText>
          ) : (
            filtered.map((f) => {
              const open = expanded === f.id;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.item, { borderColor: Colors.light.border }]}
                  onPress={() => setExpanded(open ? null : f.id)}
                >
                  <View style={styles.itemHeader}>
                    <ThemedText type="bodyMedium" style={{ flex: 1 }}>
                      {f.question}
                    </ThemedText>
                    <Icon
                      name={open ? 'chevron.up' : 'chevron.down'}
                      size={16}
                      color={Colors.light.textSecondary}
                    />
                  </View>
                  {open ? (
                    <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.answer}>
                      {f.answer}
                    </ThemedText>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.contact}>
          <ThemedText type="h3">Still stuck?</ThemedText>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Our team is on hand between 8am and 6pm East Africa Time.
          </ThemedText>
          <Button label="Send feedback" onPress={() => router.push('/feedback')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  item: {
    borderRadius: Radius.medium,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  answer: {
    marginTop: Spacing.xs,
  },
  contact: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    backgroundColor: Colors.light.primaryLight,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
});
