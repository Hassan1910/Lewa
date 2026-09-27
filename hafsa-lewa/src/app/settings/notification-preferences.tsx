import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { EmptyState, Icon, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getNotificationPreferences, upsertNotificationPreferences } from '@/services/notifications';
import type { NotificationPreferences } from '@/services/types';

type Preference = { key: string; label: string; hint: string; initial: boolean };

const CATEGORIES: Preference[] = [
  {
    key: 'wildlife_sightings',
    label: 'Wildlife sightings',
    hint: 'Notable species spotted by our field teams.',
    initial: true,
  },
  {
    key: 'booking_updates',
    label: 'Booking updates',
    hint: 'Status changes for your upcoming bookings.',
    initial: true,
  },
  {
    key: 'event_reminders',
    label: 'Event reminders',
    hint: 'Registration windows and event day reminders.',
    initial: true,
  },
  {
    key: 'donation_receipts',
    label: 'Donation receipts',
    hint: 'Confirmations and impact updates for your gifts.',
    initial: true,
  },
  {
    key: 'general_news',
    label: 'Conservation news',
    hint: 'Announcements, stories and campaign launches.',
    initial: false,
  },
];

export default function NotificationPreferencesScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notif-prefs', session?.user.id],
    queryFn: () => getNotificationPreferences(session!.user.id),
    enabled: Boolean(session?.user.id),
  });
  const save = useMutation({
    mutationFn: upsertNotificationPreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notif-prefs'] }),
  });

  const update = (patch: Partial<NotificationPreferences>) => {
    if (!data) return;
    save.mutate({ ...data, ...patch });
  };

  if (!session) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="bell"
          title="Sign in to manage alerts"
          message="Notification preferences are saved to your account."
          actionLabel="Sign in"
          onAction={() => router.push('/(auth)/sign-in')}
        />
      </View>
    );
  }

  const prefsMap: Record<string, boolean> = {
    wildlife_sightings: data?.wildlifeSightings ?? true,
    booking_updates: data?.bookingUpdates ?? true,
    event_reminders: data?.eventReminders ?? true,
    donation_receipts: data?.donationReceipts ?? true,
    general_news: data?.conservationNews ?? false,
  };
  const push = data?.pushEnabled ?? true;
  const email = data?.emailEnabled ?? true;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Notifications</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Choose what you want to hear about, and how.
        </ThemedText>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading || !data ? <LoadingState /> : (
          <>
        <SectionHeader title="Channels" />
        <View style={[styles.group, { borderColor: Colors.light.border }]}>
          <PrefRow label="Push" hint="On this device" value={push} onChange={(v) => update({ pushEnabled: v })} />
          <PrefRow label="Email" hint="Delivered to your account" value={email} onChange={(v) => update({ emailEnabled: v })} />
        </View>

        <SectionHeader title="Categories" />
        <View style={[styles.group, { borderColor: Colors.light.border }]}>
          {CATEGORIES.map((c) => (
            <PrefRow
              key={c.key}
              label={c.label}
              hint={c.hint}
              value={prefsMap[c.key]}
              onChange={(v) => {
                if (c.key === 'wildlife_sightings') update({ wildlifeSightings: v });
                if (c.key === 'booking_updates') update({ bookingUpdates: v });
                if (c.key === 'event_reminders') update({ eventReminders: v });
                if (c.key === 'donation_receipts') update({ donationReceipts: v });
                if (c.key === 'general_news') update({ conservationNews: v });
              }}
            />
          ))}
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PrefRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: Colors.light.border }]}>
      <View style={styles.rowText}>
        <ThemedText type="bodyMedium">{label}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {hint}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.light.primary, false: Colors.light.border }}
        thumbColor="#FFFFFF"
      />
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
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  group: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
