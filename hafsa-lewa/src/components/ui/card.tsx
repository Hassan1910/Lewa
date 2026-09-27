import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  bare?: boolean;
};

/**
 * Neutral surface container. Cards are used sparingly — usually only when the
 * content is interactive (tappable rows, list items). Set `bare` for content
 * that only needs alignment/padding without a border/background.
 */
export function Card({ children, onPress, padded = true, style, bare = false }: CardProps) {
  const theme = useTheme();
  const base: StyleProp<ViewStyle> = [
    styles.base,
    !bare && {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: StyleSheet.hairlineWidth,
    },
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
});
