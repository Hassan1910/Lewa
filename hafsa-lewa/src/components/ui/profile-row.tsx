import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ProfileRowProps = {
  icon: string;
  label: string;
  hint?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
};

export function ProfileRow({ icon, label, hint, onPress, trailing, destructive = false }: ProfileRowProps) {
  const theme = useTheme();
  const color = destructive ? theme.error : theme.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: destructive ? '#F5DADA' : theme.primaryLight }]}>
        <Icon name={icon as never} size={18} color={destructive ? theme.error : theme.primary} />
      </View>
      <View style={styles.body}>
        <ThemedText type="bodyMedium" style={{ color }}>
          {label}
        </ThemedText>
        {hint ? (
          <ThemedText type="caption" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron.right" size={16} color={theme.textSecondary} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
