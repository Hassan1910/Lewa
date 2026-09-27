import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  ErrorState,
  EventCard,
  FilterChip,
  Icon,
  ImageWithFallback,
  LoadingState,
  SearchBar,
  SectionHeader,
  TourismCard,
  WildlifeCard,
} from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { listCommunityPrograms, listConservationPrograms, listEducationResources } from '@/services/content';
import { listEvents } from '@/services/events';
import { listTourism } from '@/services/tourism';
import { listWildlife } from '@/services/wildlife';

type Category = 'wildlife' | 'tourism' | 'events' | 'conservation' | 'education' | 'community';

const CATEGORY_LABEL: Record<Category, string> = {
  wildlife: 'Wildlife',
  tourism: 'Tourism',
  events: 'Events',
  conservation: 'Conservation',
  education: 'Education',
  community: 'Community',
};

const VALID_CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

function normalizeCategory(raw: string | string[] | undefined): Category | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  return VALID_CATEGORIES.includes(value as Category) ? (value as Category) : undefined;
}

export default function ExploreTab() {
  const params = useLocalSearchParams<{ category?: Category | Category[] }>();
  const paramCategory = normalizeCategory(params.category);
  const [category, setCategory] = useState<Category>(paramCategory ?? 'wildlife');
  const [wildlifeFilter, setWildlifeFilter] = useState<string>('All');
  const [tourismFilter, setTourismFilter] = useState<string>('All');

  useEffect(() => {
    if (paramCategory && paramCategory !== category) setCategory(paramCategory);
  }, [paramCategory, category]);

  const wildlifeQ = useQuery({ queryKey: ['wildlife'], queryFn: listWildlife });
  const tourismQ = useQuery({ queryKey: ['tourism'], queryFn: listTourism });
  const eventsQ = useQuery({ queryKey: ['events'], queryFn: listEvents });
  const conservationQ = useQuery({ queryKey: ['conservation'], queryFn: listConservationPrograms });
  const educationQ = useQuery({ queryKey: ['education'], queryFn: listEducationResources });
  const communityQ = useQuery({ queryKey: ['community'], queryFn: listCommunityPrograms });

  const wildlifeCategories = useMemo(
    () => Array.from(new Set((wildlifeQ.data ?? []).map((w) => w.category))),
    [wildlifeQ.data],
  );
  const tourismCategories = useMemo(
    () => Array.from(new Set((tourismQ.data ?? []).map((t) => t.category))),
    [tourismQ.data],
  );

  const wildlife = (wildlifeQ.data ?? []).filter((w) => wildlifeFilter === 'All' || w.category === wildlifeFilter);
  const tourism = (tourismQ.data ?? []).filter((t) => tourismFilter === 'All' || t.category === tourismFilter);

  const selectCategory = (next: Category) => {
    setCategory(next);
    router.setParams({ category: next });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <ThemedText type="h1">Explore</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Wildlife, experiences and stories from Lewa.
        </ThemedText>
        <Pressable onPress={() => router.push('/search')}>
          <View pointerEvents="none">
            <SearchBar editable={false} placeholder="Search Lewa" />
          </View>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <FilterChip key={c} label={CATEGORY_LABEL[c]} selected={category === c} onPress={() => selectCategory(c)} />
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {category === 'wildlife' ? (
          wildlifeQ.isLoading ? (
            <LoadingState />
          ) : wildlifeQ.error ? (
            <ErrorState message={(wildlifeQ.error as Error).message} onRetry={() => wildlifeQ.refetch()} />
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subChips}>
                <FilterChip label="All" selected={wildlifeFilter === 'All'} onPress={() => setWildlifeFilter('All')} />
                {wildlifeCategories.map((c) => (
                  <FilterChip key={c} label={c} selected={wildlifeFilter === c} onPress={() => setWildlifeFilter(c)} />
                ))}
              </ScrollView>
              <View style={styles.grid}>
                {wildlife.map((w) => (
                  <View key={w.id} style={styles.gridItem}>
                    <WildlifeCard
                      name={w.name}
                      scientificName={w.scientificName}
                      imageUrl={w.imageUrl}
                      conservationStatus={w.conservationStatus}
                      variant="compact"
                      onPress={() => router.push(`/wildlife/${w.id}`)}
                    />
                  </View>
                ))}
              </View>
            </>
          )
        ) : null}

        {category === 'tourism' ? (
          tourismQ.isLoading ? (
            <LoadingState />
          ) : tourismQ.error ? (
            <ErrorState message={(tourismQ.error as Error).message} onRetry={() => tourismQ.refetch()} />
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subChips}>
                <FilterChip label="All" selected={tourismFilter === 'All'} onPress={() => setTourismFilter('All')} />
                {tourismCategories.map((c) => (
                  <FilterChip key={c} label={c} selected={tourismFilter === c} onPress={() => setTourismFilter(c)} />
                ))}
              </ScrollView>
              <View style={styles.stack}>
                {tourism.map((t) => (
                  <TourismCard
                    key={t.id}
                    title={t.title}
                    category={t.category}
                    imageUrl={t.imageUrl}
                    price={t.price}
                    currency={t.currency}
                    durationLabel={t.durationLabel}
                    onPress={() => router.push(`/tourism/${t.id}`)}
                  />
                ))}
              </View>
            </>
          )
        ) : null}

        {category === 'events' ? (
          eventsQ.isLoading ? (
            <LoadingState />
          ) : eventsQ.error ? (
            <ErrorState message={(eventsQ.error as Error).message} onRetry={() => eventsQ.refetch()} />
          ) : (
            <View style={styles.stack}>
              {(eventsQ.data ?? []).map((e) => (
                <EventCard
                  key={e.id}
                  title={e.title}
                  isoDate={e.startAt}
                  location={e.location ?? 'Lewa'}
                  imageUrl={e.imageUrl}
                  variant="row"
                  onPress={() => router.push(`/events/${e.id}`)}
                />
              ))}
            </View>
          )
        ) : null}

        {category === 'conservation' ? (
          <View style={styles.stack}>
            <SectionHeader title="Conservation programs" subtitle="Where your visits and donations go" />
            {(conservationQ.data ?? []).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push('/conservation')}
                style={({ pressed }) => [styles.storyCard, { borderColor: Colors.light.border, opacity: pressed ? 0.9 : 1 }]}
              >
                <ImageWithFallback uri={p.coverImage} style={styles.storyImage} fallbackIcon="leaf.fill" />
                <View style={styles.storyBody}>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {p.category}
                  </ThemedText>
                  <ThemedText type="h3">{p.title}</ThemedText>
                  <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={2}>
                    {p.summary}
                  </ThemedText>
                </View>
                <Icon name="chevron.right" size={18} color={Colors.light.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {category === 'education' ? (
          <View style={styles.stack}>
            <SectionHeader title="Learn" subtitle="Articles from the field" />
            {(educationQ.data ?? []).map((a) => (
              <Pressable
                key={a.id}
                onPress={() => router.push('/education')}
                style={({ pressed }) => [styles.storyCard, { borderColor: Colors.light.border, opacity: pressed ? 0.9 : 1 }]}
              >
                <ImageWithFallback uri={a.coverImage} style={styles.storyImage} fallbackIcon="book.fill" />
                <View style={styles.storyBody}>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {a.category}
                    {a.readingMinutes ? ` · ${a.readingMinutes} min read` : ''}
                  </ThemedText>
                  <ThemedText type="h3">{a.title}</ThemedText>
                  <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={2}>
                    {a.summary}
                  </ThemedText>
                </View>
                <Icon name="chevron.right" size={18} color={Colors.light.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {category === 'community' ? (
          <View style={styles.stack}>
            <SectionHeader title="Community" subtitle="Programmes with our neighbours" />
            {(communityQ.data ?? []).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push('/community')}
                style={({ pressed }) => [styles.storyCard, { borderColor: Colors.light.border, opacity: pressed ? 0.9 : 1 }]}
              >
                <ImageWithFallback uri={p.coverImage} style={styles.storyImage} fallbackIcon="person.2.fill" />
                <View style={styles.storyBody}>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {p.location ?? 'Community'}
                  </ThemedText>
                  <ThemedText type="h3">{p.title}</ThemedText>
                  <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={2}>
                    {p.summary}
                  </ThemedText>
                </View>
                <Icon name="chevron.right" size={18} color={Colors.light.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  chips: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.md },
  content: { paddingBottom: Spacing.huge },
  subChips: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  gridItem: { width: '48%' },
  stack: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
  },
  storyImage: { width: 72, height: 72, borderRadius: 12 },
  storyBody: { flex: 1, gap: 2 },
});
