import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();
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
          <Pressable onPress={onAction} style={styles.action} hitSlop={8}>
            <ThemedText type="bodySmall" themeColor="primary">
              {actionLabel}
            </ThemedText>
            <Icon name="chevron.right" size={14} color={theme.primary} />
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
