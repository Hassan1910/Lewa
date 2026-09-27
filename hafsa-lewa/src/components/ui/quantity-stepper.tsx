import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, min = 1, max = 20 }: QuantityStepperProps) {
  const theme = useTheme();
  const disabledMinus = value <= min;
  const disabledPlus = value >= max;
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabledMinus}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.button, disabledMinus && styles.disabled]}
      >
        <Icon name="minus" size={18} color={theme.primary} />
      </Pressable>
      <ThemedText type="h3" style={styles.value}>
        {value}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        disabled={disabledPlus}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.button, disabledPlus && styles.disabled]}
      >
        <Icon name="plus" size={18} color={theme.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
    gap: Spacing.lg,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
  },
});
