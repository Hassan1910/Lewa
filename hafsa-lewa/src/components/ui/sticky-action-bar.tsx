import { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

/** Bottom system-navigation inset the sticky bar clears. */
export function useStickyActionBarInset(): number {
  return useSafeAreaInsets().bottom;
}

/** Scroll padding that keeps the last row above the sticky bar and the system navigation. */
export function stickyActionBarScrollPadding(bottomInset: number): number {
  return Spacing.huge * 2 + bottomInset;
}

type StickyActionBarProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Row places a price beside a button. Column is for a single full-width button. */
  direction?: 'row' | 'column';
};

export function StickyActionBar({ children, style, direction = 'row' }: StickyActionBarProps) {
  const bottomInset = useStickyActionBarInset();

  return (
    <View
      style={[
        styles.bar,
        direction === 'column' ? styles.column : styles.row,
        { paddingBottom: Spacing.xxl + bottomInset, borderColor: Colors.light.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  column: {
    flexDirection: 'column',
  },
});
