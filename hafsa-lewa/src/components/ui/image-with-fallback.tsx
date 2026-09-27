import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ImageStyle, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

export type ImageWithFallbackProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
};

/**
 * expo-image loader with graceful fallback to a themed placeholder when the
 * uri is missing or fails to load. Every content surface in the app should
 * use this instead of expo-image directly so broken URLs never render blank.
 */
export function ImageWithFallback({
  uri,
  style,
  containerStyle,
  fallbackIcon = 'photo',
  contentFit = 'cover',
  transition = 200,
}: ImageWithFallbackProps) {
  const theme = useTheme();
  const [errored, setErrored] = useState(false);

  if (!uri || errored) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          style as StyleProp<ViewStyle>,
          containerStyle,
        ]}
      >
        <Icon name={fallbackIcon as never} size={28} color={theme.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      transition={transition}
      onError={() => setErrored(true)}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
