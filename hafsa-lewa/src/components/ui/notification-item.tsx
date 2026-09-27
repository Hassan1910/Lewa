import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { NotificationType } from '@/services/types';
import { formatRelativeTime } from '@/utils/format';

const ICON: Record<NotificationType, string> = {
  wildlife_sighting: 'binoculars.fill',
  conservation_announcement: 'leaf.fill',
  event_reminder: 'calendar',
  booking_status: 'checkmark.circle.fill',
  payment_confirmation: 'creditcard.fill',
  donation_confirmation: 'heart.fill',
  general_announcement: 'bell',
};

export type NotificationItemProps = {
  title: string;
  body: string;
  type: NotificationType;
  isoDate: string;
  unread?: boolean;
  onPress?: () => void;
};

export function NotificationItem({
  title,
  body,
  type,
  isoDate,
  unread = false,
  onPress,
}: NotificationItemProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: unread ? theme.primaryLight : theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
        <Icon name={ICON[type] as never} size={20} color={theme.primary} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <ThemedText type="bodyMedium" numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {formatRelativeTime(isoDate)}
          </ThemedText>
        </View>
        <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={2}>
          {body}
        </ThemedText>
      </View>
      {unread ? <View style={[styles.dot, { backgroundColor: theme.primary }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.xxs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
