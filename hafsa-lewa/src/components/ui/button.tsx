import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled,
  style,
  ...pressable
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === 'primary'
      ? theme.primary
      : variant === 'destructive'
        ? theme.error
        : variant === 'secondary'
          ? theme.primaryLight
          : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'destructive'
      ? theme.textOnPrimary
      : variant === 'secondary'
        ? theme.primaryDark
        : theme.primary;

  const borderColor =
    variant === 'tertiary' ? theme.border : variant === 'secondary' ? theme.primaryLight : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: background,
          borderColor,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...pressable}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {leadingIcon}
          <ThemedText style={[Typography.button, { color: textColor }]}>{label}</ThemedText>
          {trailingIcon}
        </View>
      )}
    </Pressable>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 40,
  },
  md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
  },
  lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    minHeight: 56,
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
