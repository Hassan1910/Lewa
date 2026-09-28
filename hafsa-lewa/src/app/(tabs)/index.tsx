import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  AnnouncementCard,
  Button,
  DonationCard,
  ErrorState,
  EventCard,
  Icon,
  ImageWithFallback,
  SearchBar,
  SectionHeader,
  SkeletonCard,
  TourismCard,
  WildlifeCard,
} from '@/components/ui';
import { LEWA_LANDSCAPE_URL } from '@/constants/imagery';
import { Radius, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useTheme } from '@/hooks/use-theme';
import { listAnnouncements } from '@/services/content';
import { listActiveCampaigns } from '@/services/donations';
import { listUpcomingEvents } from '@/services/events';
import { listFeaturedTourism } from '@/services/tourism';
import { listFeaturedWildlife } from '@/services/wildlife';

const IMPACT_STATS: { value: string; label: string }[] = [
  { value: '62,000', label: 'acres of protected wilderness' },
  { value: '14%', label: 'of Kenya’s rhino population' },
  { value: '9,180+', label: 'children reached each year' },
  { value: '2,160+', label: 'women in micro-enterprise' },
  { value: '37,490+', label: 'patients across 4 clinics' },
];

const QUICK_ACTIONS: { label: string; icon: string; href: string; accessibilityLabel: string }[] = [
  {
    label: 'Tours',
    icon: 'binoculars.fill',
    href: '/(tabs)/explore?category=tourism',
    accessibilityLabel: 'Book a tour',
  },
  {
    label: 'Wildlife',
    icon: 'pawprint.fill',
    href: '/(tabs)/explore?category=wildlife',
    accessibilityLabel: 'Wildlife',
  },
  {
    label: 'Events',
    icon: 'calendar',
    href: '/(tabs)/explore?category=events',
    accessibilityLabel: 'Events',
  },
  {
    label: 'Donate',
    icon: 'heart.fill',
    href: '/donations',
    accessibilityLabel: 'Donate',
  },
];

export default function HomeTab() {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const wildlife = useQuery({ queryKey: ['wildlife', 'featured'], queryFn: listFeaturedWildlife });
  const tourism = useQuery({ queryKey: ['tourism', 'featured'], queryFn: listFeaturedTourism });
  const events = useQuery({ queryKey: ['events', 'upcoming'], queryFn: listUpcomingEvents });
  const campaigns = useQuery({ queryKey: ['donations', 'active'], queryFn: listActiveCampaigns });
  const announcements = useQuery({ queryKey: ['announcements'], queryFn: () => listAnnouncements(3) });
  const { refreshControl } = usePullToRefresh(
    () =>
      Promise.all([
        wildlife.refetch(),
        tourism.refetch(),
        events.refetch(),
        campaigns.refetch(),
        announcements.refetch(),
      ]),
    { tintColor: '#FFFFFF' },
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={refreshControl}
      >
        <View style={styles.hero}>
          <ImageWithFallback
            uri={LEWA_LANDSCAPE_URL}
            style={StyleSheet.absoluteFill}
            fallbackIcon="leaf.fill"
          />
          <LinearGradient
            colors={['rgba(15, 23, 17, 0)', 'rgba(15, 23, 17, 0.9)']}
            locations={[0.25, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.brandRow}>
              <View style={[styles.logoMark, { backgroundColor: theme.surface }]}>
                <Icon name="leaf.fill" size={18} color={theme.primaryDark} />
              </View>
              <View>
                <ThemedText type="overline" style={styles.brandKicker}>
                  Northern Kenya
                </ThemedText>
                <ThemedText type="h3" style={styles.brand}>
                  Lewa
                </ThemedText>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <View style={styles.heroCopy}>
                <ThemedText type="display" style={styles.heroHeadline}>
                  Where wildlife{'\n'}thrives.
                </ThemedText>
                <Button
                  label="Book a safari"
                  size="sm"
                  onPress={() => router.push('/(tabs)/explore?category=tourism')}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search wildlife, tours, events"
                accessibilityHint="Opens search"
                onPress={() => router.push('/search')}
              >
                <View pointerEvents="none">
                  <SearchBar
                    editable={false}
                    placeholder="Search wildlife, tours, events…"
                    style={styles.heroSearch}
                  />
                </View>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => router.push(action.href as never)}
            >
              <Icon name={action.icon as never} size={22} color={theme.primary} />
              <ThemedText type="caption" numberOfLines={1} style={{ color: theme.text }}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.impactSection}>
          <SectionHeader title="Our impact" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.impactList}
          >
            {IMPACT_STATS.map((stat) => (
              <View
                key={stat.value}
                accessibilityLabel={`${stat.value} ${stat.label}`}
                style={[styles.impactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <ThemedText type="h2">{stat.value}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {stat.label}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        <HomeFeedSection
          title="Featured wildlife"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/explore?category=wildlife')}
          query={wildlife}
          skeleton={{ count: 3, width: 200, height: 250 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {(wildlife.data ?? []).map((w) => (
              <WildlifeCard
                key={w.id}
                name={w.name}
                scientificName={w.scientificName}
                imageUrl={w.imageUrl}
                conservationStatus={w.conservationStatus}
                variant="compact"
                onPress={() => router.push(`/wildlife/${w.id}`)}
              />
            ))}
          </ScrollView>
        </HomeFeedSection>

        <HomeFeedSection
          title="Popular experiences"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/explore?category=tourism')}
          query={tourism}
          skeleton={{ count: 2, width: 260, height: 220 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {(tourism.data ?? []).map((t) => (
              <TourismCard
                key={t.id}
                title={t.title}
                category={t.category}
                imageUrl={t.imageUrl}
                price={t.price}
                currency={t.currency}
                durationLabel={t.durationLabel}
                variant="compact"
                onPress={() => router.push(`/tourism/${t.id}`)}
              />
            ))}
          </ScrollView>
        </HomeFeedSection>

        <HomeFeedSection
          title="Upcoming events"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/explore?category=events')}
          query={events}
          isEmpty={(events.data ?? []).slice(0, 3).length === 0}
          layout="stack"
          skeleton={{ count: 2, width: '100%', height: 88 }}
        >
          <View style={styles.stackList}>
            {(events.data ?? []).slice(0, 3).map((e) => (
              <EventCard
                key={e.id}
                title={e.title}
                isoDate={e.startAt}
                location={e.location ?? 'Lewa'}
                variant="row"
                bordered={false}
                onPress={() => router.push(`/events/${e.id}`)}
              />
            ))}
          </View>
        </HomeFeedSection>

        <HomeFeedSection
          title="Support conservation"
          actionLabel="All campaigns"
          onAction={() => router.push('/donations')}
          query={campaigns}
          isEmpty={(campaigns.data ?? []).slice(0, 1).length === 0}
          layout="stack"
          skeleton={{ count: 1, width: '100%', height: 180 }}
        >
          {(campaigns.data ?? []).slice(0, 1).map((c) => (
            <DonationCard
              key={c.id}
              title={c.title}
              imageUrl={c.coverImage}
              goal={c.goalAmount}
              raised={c.amountRaised}
              currency={c.currency}
              variant="band"
              onPress={() => router.push(`/donations/${c.id}`)}
            />
          ))}
        </HomeFeedSection>

        <HomeFeedSection
          title="Latest updates"
          query={announcements}
          layout="stack"
          skeleton={{ count: 2, width: '100%', height: 56 }}
        >
          <View style={styles.stackList}>
            {(announcements.data ?? []).map((a) => (
              <AnnouncementCard
                key={a.id}
                title={a.title}
                body={a.body}
                isoDate={a.publishAt}
                tone={a.tone}
                variant="row"
              />
            ))}
          </View>
        </HomeFeedSection>
      </ScrollView>
    </View>
  );
}

function HomeFeedSection<T>({
  title,
  subtitle,
  actionLabel,
  onAction,
  query,
  isEmpty,
  layout = 'carousel',
  skeleton,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  query: UseQueryResult<T[]>;
  isEmpty?: boolean;
  layout?: 'carousel' | 'stack';
  skeleton: { count: number; width: number | `${number}%`; height: number };
  children: ReactNode;
}) {
  const empty = isEmpty ?? (query.data ?? []).length === 0;
  if (!query.isLoading && !query.isError && empty) return null;

  const stacked = layout === 'stack';

  return (
    <View style={stacked ? styles.sectionPadded : styles.section}>
      <View style={stacked ? undefined : styles.sectionHeader}>
        <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} onAction={onAction} />
      </View>
      {query.isLoading ? (
        <SectionSkeletons title={title} layout={layout} skeleton={skeleton} />
      ) : query.isError ? (
        <View style={stacked ? undefined : styles.sectionHeader}>
          <ErrorState
            title={`Could not load ${title.toLowerCase()}`}
            message={query.error instanceof Error ? query.error.message : 'Check your connection and try again.'}
            onRetry={() => {
              void query.refetch();
            }}
            style={styles.sectionError}
          />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

function SectionSkeletons({
  title,
  layout,
  skeleton,
}: {
  title: string;
  layout: 'carousel' | 'stack';
  skeleton: { count: number; width: number | `${number}%`; height: number };
}) {
  const cards = Array.from({ length: skeleton.count }, (_, index) => (
    <SkeletonCard key={index} style={{ width: skeleton.width, height: skeleton.height }} />
  ));

  const a11y = {
    accessibilityLabel: `Loading ${title}`,
    accessibilityState: { busy: true as const },
  };

  if (layout === 'carousel') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        {...a11y}
      >
        {cards}
      </ScrollView>
    );
  }

  return (
    <View style={styles.stackList} {...a11y}>
      {cards}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Spacing.huge, flexGrow: 1 },
  hero: { height: 360, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xxl, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: '#F5F1E8', letterSpacing: 4, textTransform: 'uppercase' },
  brandKicker: { color: 'rgba(245, 241, 232, 0.85)', letterSpacing: 2 },
  heroBottom: { gap: Spacing.lg },
  heroCopy: { gap: Spacing.md, maxWidth: 460 },
  heroHeadline: { color: '#FFFFFF' },
  heroSearch: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'transparent',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  impactSection: { marginTop: Spacing.huge, gap: Spacing.lg },
  impactList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  impactCard: {
    width: 168,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  section: { marginTop: Spacing.huge, gap: Spacing.lg },
  sectionHeader: { paddingHorizontal: Spacing.xl },
  sectionPadded: { marginTop: Spacing.huge, gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  sectionError: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md },
  hList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  stackList: { gap: Spacing.sm },
});
