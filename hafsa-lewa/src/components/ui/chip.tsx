import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText
        type="bodySmall"
        style={{ color: selected ? theme.textOnPrimary : theme.text }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
