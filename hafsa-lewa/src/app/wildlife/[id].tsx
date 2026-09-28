import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader, StatusBadge } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { getWildlifeById } from '@/services/wildlife';
import { shareLewaItem } from '@/utils/share';

export default function WildlifeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: species, isLoading, error, refetch } = useQuery({
    queryKey: ['wildlife', id],
    queryFn: () => getWildlifeById(id!),
    enabled: Boolean(id),
  });
  const refreshSpecies = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshSpecies, { tintColor: '#FFFFFF' });

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
        <ErrorState message={(error as Error).message} />
      </View>
    );
  }

  if (!species) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="pawprint.fill"
          title="Species not found"
          message="This species is no longer available. Head back to explore other wildlife."
          actionLabel="Back to Explore"
          onAction={() => router.replace('/(tabs)/explore?category=wildlife')}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={refreshControl}
      >
        <View style={styles.hero}>
          <ImageWithFallback
            uri={species.imageUrl ?? species.heroImageUrl}
            style={StyleSheet.absoluteFill}
            fallbackIcon="pawprint.fill"
          />
          <LinearGradient
            colors={['rgba(15,23,17,0.55)', 'rgba(15,23,17,0)', 'rgba(15,23,17,0.9)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroActions}>
              <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
                <Icon name="chevron.left" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => void shareLewaItem(species.name, species.scientificName)}
                style={styles.backButton}
                hitSlop={12}
                accessibilityLabel={`Share ${species.name}`}
              >
                <Icon name="square.and.arrow.up" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.heroBottom}>
              {species.conservationStatus ? <StatusBadge label={species.conservationStatus} tone="warning" /> : null}
              <ThemedText type="display" style={styles.heroTitle}>
                {species.name}
              </ThemedText>
              <ThemedText type="body" style={styles.heroSub}>
                {species.scientificName}
              </ThemedText>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.chipRow}>
            <StatusBadge label={species.category} tone="primary" />
          </View>
          {species.description ? <ThemedText type="body">{species.description}</ThemedText> : null}
          {species.habitat ? (
            <>
              <SectionHeader title="Habitat" />
              <ThemedText type="body">{species.habitat}</ThemedText>
            </>
          ) : null}
          {species.behavior ? (
            <>
              <SectionHeader title="Behaviour" />
              <ThemedText type="body">{species.behavior}</ThemedText>
            </>
          ) : null}
          {species.facts.length > 0 ? (
            <>
              <SectionHeader title="Facts" />
              <View style={{ gap: Spacing.md }}>
                {species.facts.map((f, i) => (
                  <View key={i} style={styles.fact}>
                    <View style={styles.factBullet}>
                      <Icon name="leaf.fill" size={12} color={Colors.light.primaryDark} />
                    </View>
                    <ThemedText type="body" style={styles.factText}>
                      {f}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingBottom: Spacing.huge, flexGrow: 1 },
  hero: { height: 380, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,17,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: Spacing.sm },
  heroTitle: { color: '#FFFFFF', fontSize: 34, lineHeight: 40 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  fact: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  factBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  factText: { flex: 1 },
});
