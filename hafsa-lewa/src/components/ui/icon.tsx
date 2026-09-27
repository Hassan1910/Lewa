import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * SF Symbol name -> ASCII fallback glyph used on Android and web where SF
 * Symbols aren't available. The fallback keeps the app usable without pulling
 * in another icon library. Add entries here as new icons are used.
 */
const FALLBACK: Record<string, string> = {
  magnifyingglass: '⌕',
  house: '⌂',
  'safari.fill': '◈',
  'calendar': '▤',
  'bell': '◔',
  'person.crop.circle': '◉',
  'chevron.right': '›',
  'chevron.left': '‹',
  'chevron.down': '⌄',
  'chevron.up': '⌃',
  'arrow.right': '→',
  'arrow.up.right': '↗',
  'heart.fill': '♥',
  'heart': '♡',
  'leaf.fill': '❊',
  'binoculars.fill': '◐◑',
  'tree': '⯒',
  'pawprint.fill': '❈',
  'bookmark': '⚑',
  'square.and.arrow.up': '↑',
  'checkmark.circle.fill': '✓',
  'exclamationmark.triangle.fill': '⚠',
  'xmark': '✕',
  'plus': '+',
  'minus': '−',
  'mappin.and.ellipse': '⌾',
  'clock': '⏱',
  'creditcard.fill': '▭',
  'envelope': '✉',
  'lock': '🔒',
  'gearshape.fill': '⚙',
  'questionmark.circle': '?',
  'info.circle': 'ⓘ',
  'star.fill': '★',
  'star': '☆',
  'line.3.horizontal.decrease': '≡',
  'ellipsis': '⋯',
  'photo': '▣',
  'person.2.fill': '☻',
  'building.columns': '⛪',
  'sparkles': '✨',
};

export type IconProps = {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color, style }: IconProps) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }
  const glyph = FALLBACK[name as string] ?? '•';
  return (
    <View
      style={[
        styles.fallback,
        { width: size + 4, height: size + 4 },
        style,
      ]}
    >
      <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
