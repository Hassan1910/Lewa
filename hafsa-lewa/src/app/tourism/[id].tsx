import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader, StatusBadge, StickyActionBar, stickyActionBarScrollPadding, useStickyActionBarInset } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { authHref } from '@/lib/auth-redirect';
import { useAuth } from '@/lib/auth-context';
import { getTourismById, getTourismPriceCaption } from '@/services/tourism';
import { formatCurrency } from '@/utils/format';
import { shareLewaItem } from '@/utils/share';

export default function TourismDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const bottomInset = useStickyActionBarInset();
  const { data: service, isLoading, error, refetch } = useQuery({
    queryKey: ['tourism', id],
    queryFn: () => getTourismById(id!),
    enabled: Boolean(id),
  });
  const refreshService = useCallback(() => refetch(), [refetch]);
  const { refreshControl } = usePullToRefresh(refreshService, { tintColor: '#FFFFFF' });

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
  if (!service) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="binoculars.fill"
          title="Experience unavailable"
          message="Head back and browse other tourism services at Lewa."
          actionLabel="Back to Tourism"
          onAction={() => router.replace('/(tabs)/explore?category=tourism')}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: stickyActionBarScrollPadding(bottomInset), flexGrow: 1 }}
        refreshControl={refreshControl}
      >
        <View style={styles.hero}>
          <ImageWithFallback
            uri={service.heroImageUrl ?? service.imageUrl}
            style={StyleSheet.absoluteFill}
            fallbackIcon="binoculars.fill"
          />
          <LinearGradient
            colors={['rgba(15,23,17,0.4)', 'rgba(15,23,17,0)', 'rgba(15,23,17,0.9)']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroActions}>
              <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
                <Icon name="chevron.left" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => void shareLewaItem(service.title, service.summary)}
                style={styles.backButton}
                hitSlop={12}
                accessibilityLabel={`Share ${service.title}`}
              >
                <Icon name="square.and.arrow.up" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.heroBottom}>
              <StatusBadge label={service.category} tone="primary" />
              <ThemedText type="display" style={styles.heroTitle}>
                {service.title}
              </ThemedText>
              <View style={styles.metaRow}>
                {service.durationLabel ? (
                  <View style={styles.meta}>
                    <Icon name="clock" size={14} color="#F5F1E8" />
                    <ThemedText type="bodySmall" style={styles.metaText}>
                      {service.durationLabel}
                    </ThemedText>
                  </View>
                ) : null}
                <View style={styles.meta}>
                  <Icon name="person.2.fill" size={14} color="#F5F1E8" />
                  <ThemedText type="bodySmall" style={styles.metaText}>
                    Up to {service.capacity}
                  </ThemedText>
                </View>
                {service.meetingPoint ? (
                  <View style={styles.meta}>
                    <Icon name="mappin.and.ellipse" size={14} color="#F5F1E8" />
                    <ThemedText type="bodySmall" style={styles.metaText}>
                      {service.meetingPoint}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {service.description ? <ThemedText type="body">{service.description}</ThemedText> : null}
          {service.highlights.length > 0 ? (
            <>
              <SectionHeader title="Highlights" />
              <View style={{ gap: Spacing.md }}>
                {service.highlights.map((h, i) => (
                  <View key={i} style={styles.item}>
                    <Icon name="star.fill" size={14} color={Colors.light.accent} />
                    <ThemedText type="body" style={styles.itemText}>
                      {h}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}
          {service.includes.length > 0 ? (
            <>
              <SectionHeader title="What’s included" />
              <View style={{ gap: Spacing.md }}>
                {service.includes.map((inc, i) => (
                  <View key={i} style={styles.item}>
                    <Icon name="checkmark.circle.fill" size={16} color={Colors.light.primary} />
                    <ThemedText type="body" style={styles.itemText}>
                      {inc}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <StickyActionBar>
        <View>
          <ThemedText type="caption" themeColor="textSecondary">
            From
          </ThemedText>
          <ThemedText type="h2" themeColor="primary">
            {formatCurrency(service.price, { currency: service.currency })}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {getTourismPriceCaption(service)}
          </ThemedText>
        </View>
        <Button
          label="Book now"
          onPress={() =>
            session
              ? router.push(`/booking/${service.id}`)
              : router.push(authHref('sign-in', `/booking/${service.id}`))
          }
          trailingIcon={<Icon name="arrow.right" size={16} color="#FFFFFF" />}
        />
      </StickyActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
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
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { color: '#F5F1E8' },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  item: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  itemText: { flex: 1 },
});
