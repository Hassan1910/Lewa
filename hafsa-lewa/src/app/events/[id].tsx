import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader, StatusBadge, StickyActionBar, stickyActionBarScrollPadding, useStickyActionBarInset } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getEventById, getMyEventRegistration, registerForEvent } from '@/services/events';
import { formatDate } from '@/utils/format';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, profile } = useAuth();
  const bottomInset = useStickyActionBarInset();
  const queryClient = useQueryClient();
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
    enabled: Boolean(id),
  });
  const registered = useQuery({
    queryKey: ['event-reg', id, session?.user.id],
    queryFn: () => getMyEventRegistration(id!, session!.user.id),
    enabled: Boolean(id && session?.user.id),
  });
  const register = useMutation({
    mutationFn: () =>
      registerForEvent({
        eventId: id!,
        userId: session!.user.id,
        fullName: profile?.full_name || session!.user.email || 'Guest',
        email: session!.user.email,
        phone: profile?.phone,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['event-reg', id] });
      Alert.alert('Registered', 'You are on the list for this event.');
    },
    onError: (err) => Alert.alert('Registration', err instanceof Error ? err.message : 'Could not register'),
  });

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
  if (!event) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="calendar"
          title="Event unavailable"
          message="Head back and browse other events at Lewa."
          actionLabel="Back to events"
          onAction={() => router.replace('/(tabs)/explore?category=events')}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: stickyActionBarScrollPadding(bottomInset) }}
      >
        <View style={styles.hero}>
          <ImageWithFallback uri={event.imageUrl} style={StyleSheet.absoluteFill} fallbackIcon="calendar" />
          <LinearGradient
            colors={['rgba(15,23,17,0.35)', 'rgba(15,23,17,0)', 'rgba(15,23,17,0.9)']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
              <Icon name="chevron.left" size={20} color="#FFFFFF" />
            </Pressable>
            <View style={styles.heroBottom}>
              <StatusBadge label={event.eventType ?? 'Event'} tone="primary" />
              <ThemedText type="display" style={styles.heroTitle}>
                {event.title}
              </ThemedText>
              <View style={styles.meta}>
                <Icon name="calendar" size={14} color="#F5F1E8" />
                <ThemedText type="bodySmall" style={styles.metaText}>
                  {formatDate(event.startAt)}
                </ThemedText>
              </View>
              <View style={styles.meta}>
                <Icon name="mappin.and.ellipse" size={14} color="#F5F1E8" />
                <ThemedText type="bodySmall" style={styles.metaText}>
                  {event.location ?? 'Lewa'}
                </ThemedText>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {event.description ? <ThemedText type="body">{event.description}</ThemedText> : null}
          <SectionHeader title="Organiser" />
          <ThemedText type="body">{event.organiser ?? 'Lewa Wildlife Conservancy'}</ThemedText>
          {event.registrationRequired ? (
            <View style={styles.note}>
              <Icon name="info.circle" size={16} color={Colors.light.info} />
              <ThemedText type="bodySmall" themeColor="textSecondary">
                Registration is required for this event. Places are limited.
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <StickyActionBar direction="column">
        <Button
          label={
            registered.data
              ? 'You’re registered'
              : !session
                ? 'Sign in to register'
                : event.registrationRequired
                  ? 'Register'
                  : 'I’m attending'
          }
          fullWidth
          disabled={registered.data}
          loading={register.isPending}
          onPress={() => {
            if (!session) {
              router.push('/(auth)/sign-in');
              return;
            }
            register.mutate();
          }}
        />
      </StickyActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  hero: { height: 360, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,17,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: Spacing.sm },
  heroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 36 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { color: '#F5F1E8' },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
  },
});
