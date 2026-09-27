import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  AnnouncementCard,
  DonationCard,
  ErrorState,
  EventCard,
  Icon,
  ImageWithFallback,
  LoadingState,
  SearchBar,
  SectionHeader,
  TourismCard,
  WildlifeCard,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { listAnnouncements } from '@/services/content';
import { listActiveCampaigns } from '@/services/donations';
import { listUpcomingEvents } from '@/services/events';
import { listFeaturedTourism } from '@/services/tourism';
import { listFeaturedWildlife } from '@/services/wildlife';

const QUICK_ACTIONS: { label: string; icon: string; href: string }[] = [
  { label: 'Book a tour', icon: 'binoculars.fill', href: '/(tabs)/explore?category=tourism' },
  { label: 'Wildlife', icon: 'pawprint.fill', href: '/(tabs)/explore?category=wildlife' },
  { label: 'Events', icon: 'calendar', href: '/(tabs)/explore?category=events' },
  { label: 'Donate', icon: 'heart.fill', href: '/donations' },
];

export default function HomeTab() {
  const wildlife = useQuery({ queryKey: ['wildlife', 'featured'], queryFn: listFeaturedWildlife });
  const tourism = useQuery({ queryKey: ['tourism', 'featured'], queryFn: listFeaturedTourism });
  const events = useQuery({ queryKey: ['events', 'upcoming'], queryFn: listUpcomingEvents });
  const campaigns = useQuery({ queryKey: ['donations', 'active'], queryFn: listActiveCampaigns });
  const announcements = useQuery({ queryKey: ['announcements'], queryFn: () => listAnnouncements(2) });

  const loading =
    wildlife.isLoading || tourism.isLoading || events.isLoading || campaigns.isLoading || announcements.isLoading;
  const error =
    wildlife.error || tourism.error || events.error || campaigns.error || announcements.error;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <ImageWithFallback
            uri="https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1400&q=80"
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
              <View style={styles.logoMark}>
                <Icon name="leaf.fill" size={18} color={Colors.light.primaryDark} />
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
            <View style={styles.heroCopy}>
              <ThemedText type="display" style={styles.heroHeadline}>
                Where wildlife{'\n'}thrives.
              </ThemedText>
              <ThemedText type="body" style={styles.heroSub}>
                Book a safari, learn about the species we protect, and support conservation from
                anywhere in the world.
              </ThemedText>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.searchWrap}>
          <Pressable onPress={() => router.push('/search')}>
            <View pointerEvents="none">
              <SearchBar editable={false} placeholder="Search wildlife, tours, events…" />
            </View>
          </Pressable>
        </View>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.quickAction,
                {
                  backgroundColor: Colors.light.surface,
                  borderColor: Colors.light.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              onPress={() => router.push(action.href as never)}
            >
              <View style={[styles.quickIcon, { backgroundColor: Colors.light.primaryLight }]}>
                <Icon name={action.icon as never} size={18} color={Colors.light.primaryDark} />
              </View>
              <ThemedText type="caption">{action.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {loading ? <LoadingState label="Loading Lewa…" /> : null}
        {error ? (
          <ErrorState
            title="Could not load home"
            message={error instanceof Error ? error.message : 'Check your connection and try again.'}
            onRetry={() => {
              void wildlife.refetch();
              void tourism.refetch();
              void events.refetch();
              void campaigns.refetch();
              void announcements.refetch();
            }}
          />
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader
              title="Featured wildlife"
              subtitle="Species you can find at Lewa"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/explore?category=wildlife')}
            />
          </View>
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader
              title="Popular experiences"
              subtitle="Guided by Lewa specialists"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/explore?category=tourism')}
            />
          </View>
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader
              title="Upcoming events"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/explore?category=events')}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {(events.data ?? []).slice(0, 3).map((e) => (
              <EventCard
                key={e.id}
                title={e.title}
                isoDate={e.startAt}
                location={e.location ?? 'Lewa'}
                imageUrl={e.imageUrl}
                onPress={() => router.push(`/events/${e.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {(campaigns.data ?? []).slice(0, 1).map((c) => (
          <View key={c.id} style={styles.sectionPadded}>
            <SectionHeader
              title="Support conservation"
              subtitle="Your donation goes directly to the field"
              actionLabel="All campaigns"
              onAction={() => router.push('/donations')}
            />
            <DonationCard
              title={c.title}
              summary={c.summary}
              imageUrl={c.coverImage}
              goal={c.goalAmount}
              raised={c.amountRaised}
              currency={c.currency}
              onPress={() => router.push(`/donations/${c.id}`)}
            />
          </View>
        ))}

        <View style={styles.sectionPadded}>
          <SectionHeader title="Latest updates" subtitle="News from the field" />
          <View style={{ gap: Spacing.md }}>
            {(announcements.data ?? []).map((a) => (
              <AnnouncementCard
                key={a.id}
                title={a.title}
                body={a.body}
                isoDate={a.publishAt}
                tone={a.tone}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingBottom: Spacing.huge },
  hero: { height: 420, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xxl, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: '#F5F1E8', letterSpacing: 4, textTransform: 'uppercase' },
  brandKicker: { color: 'rgba(245, 241, 232, 0.85)', letterSpacing: 2 },
  heroCopy: { gap: Spacing.md, maxWidth: 460 },
  heroHeadline: { color: '#FFFFFF', fontSize: 42, lineHeight: 46 },
  heroSub: { color: 'rgba(255,255,255,0.9)' },
  searchWrap: { paddingHorizontal: Spacing.xl, marginTop: -Spacing.xxl },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  quickAction: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: Spacing.xxl, gap: Spacing.lg },
  sectionHeader: { paddingHorizontal: Spacing.xl },
  sectionPadded: { marginTop: Spacing.xxl, gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  hList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
});
