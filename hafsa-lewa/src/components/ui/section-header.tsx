import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  trailing?: ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  trailing,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <ThemedText type="h2">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="bodySmall" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailing ??
        (actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <ThemedText type="caption" themeColor="textSecondary">
              {actionLabel}
            </ThemedText>
          </Pressable>
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
    gap: Spacing.xxs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
});
