import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/utils/format';

export type AnnouncementCardProps = {
  title: string;
  body: string;
  isoDate: string;
  tone?: 'default' | 'urgent';
  onPress?: () => void;
  variant?: 'default' | 'row';
};

export function AnnouncementCard({
  title,
  body,
  isoDate,
  tone = 'default',
  onPress,
  variant = 'default',
}: AnnouncementCardProps) {
  const theme = useTheme();
  const urgent = tone === 'urgent';
  const accent = urgent ? theme.error : theme.primary;

  if (variant === 'row') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      >
        <ThemedText type="caption" style={{ color: urgent ? accent : theme.textSecondary }}>
          {formatRelativeTime(isoDate)}
        </ThemedText>
        <ThemedText type="bodyMedium" numberOfLines={2}>
          {title}
        </ThemedText>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Icon
            name={urgent ? 'exclamationmark.triangle.fill' : 'leaf.fill'}
            size={16}
            color={accent}
          />
          <ThemedText type="overline" themeColor="textSecondary">
            {urgent ? 'Alert' : 'Announcement'} · {formatRelativeTime(isoDate)}
          </ThemedText>
        </View>
        <ThemedText type="h3">{title}</ThemedText>
        <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={3}>
          {body}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  row: {
    gap: Spacing.xxs,
    paddingVertical: Spacing.sm,
  },
});
