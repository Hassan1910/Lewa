import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatusBadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const theme = useTheme();
  const palette: Record<StatusBadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: theme.backgroundElement, fg: theme.textSecondary },
    primary: { bg: theme.primaryLight, fg: theme.primaryDark },
    success: { bg: '#DCEFE3', fg: theme.success },
    warning: { bg: '#F7EAD1', fg: theme.warning },
    error: { bg: '#F5DADA', fg: theme.error },
    info: { bg: '#D9E7F0', fg: theme.info },
  };
  const { bg, fg } = palette[tone];
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ThemedText type="caption" style={{ color: fg }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
});
