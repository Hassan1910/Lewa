import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorState, FilterChip, LoadingState, NotificationItem } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { listNotifications, markNotificationRead } from '@/services/notifications';
import type { AppNotification } from '@/services/types';

type Filter = 'all' | 'unread';

function groupNotifications(items: AppNotification[], now: number) {
  const byGroup: { label: string; items: AppNotification[] }[] = [
    { label: 'Today', items: [] },
    { label: 'This week', items: [] },
    { label: 'Earlier', items: [] },
  ];
  for (const n of items) {
    const age = now - new Date(n.createdAt).getTime();
    if (age < 24 * 60 * 60 * 1000) byGroup[0].items.push(n);
    else if (age < 7 * 24 * 60 * 60 * 1000) byGroup[1].items.push(n);
    else byGroup[2].items.push(n);
  }
  return byGroup.filter((g) => g.items.length > 0);
}

export default function NotificationsTab() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', session?.user.id ?? 'guest'],
    queryFn: listNotifications,
  });
  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const items = filter === 'unread' ? data.filter((n) => !n.readAt) : data;
  const grouped = useMemo(() => groupNotifications(items, Date.now()), [items]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <ThemedText type="h1">Notifications</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Sightings, booking updates and conservation news.
        </ThemedText>
        <View style={styles.filters}>
          <FilterChip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="Unread" selected={filter === 'unread'} onPress={() => setFilter('unread')} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.push('/settings/notification-preferences')} style={styles.settingsLink}>
            <ThemedText type="bodySmall" themeColor="primary">
              Preferences
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : null}
        {!isLoading && items.length === 0 ? (
          <EmptyState icon="bell" title="You’re all caught up" message="No notifications match this filter." />
        ) : (
          grouped.map((group) => (
            <View key={group.label} style={{ gap: Spacing.md }}>
              <ThemedText type="overline" themeColor="textSecondary">
                {group.label}
              </ThemedText>
              {group.items.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  body={n.body}
                  type={n.type}
                  isoDate={n.createdAt}
                  unread={!n.readAt}
                  onPress={() => {
                    if (!n.readAt) markRead.mutate(n.id);
                    if (n.deepLink) router.push(n.deepLink as never);
                  }}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.md },
  filters: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  settingsLink: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.xl },
});
