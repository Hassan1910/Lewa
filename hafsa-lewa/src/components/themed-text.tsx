import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'button'
  // Legacy aliases (kept so pre-existing template files still compile).
  | 'default'
  | 'title'
  | 'subtitle'
  | 'small'
  | 'smallBold'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextVariant;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? 'text'];

  return <Text style={[{ color }, variantStyle(type), style]} {...rest} />;
}

function variantStyle(type: ThemedTextVariant): TextStyle {
  switch (type) {
    case 'display':
      return Typography.display;
    case 'h1':
    case 'title':
      return Typography.h1;
    case 'h2':
    case 'subtitle':
      return Typography.h2;
    case 'h3':
      return Typography.h3;
    case 'bodyMedium':
      return Typography.bodyMedium;
    case 'bodySmall':
    case 'small':
      return Typography.bodySmall;
    case 'smallBold':
      return { ...Typography.bodySmall, fontFamily: Typography.button.fontFamily };
    case 'caption':
      return Typography.caption;
    case 'overline':
      return Typography.overline;
    case 'button':
      return Typography.button;
    case 'link':
      return Typography.bodySmall;
    case 'linkPrimary':
      return { ...Typography.bodySmall, color: '#2F5D3A' };
    case 'code':
      return styles.code;
    case 'default':
    case 'body':
    default:
      return Typography.body;
  }
}

const styles = StyleSheet.create({
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
