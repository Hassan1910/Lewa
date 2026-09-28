import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusBadge, type StatusBadgeTone } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ImageWithFallback } from './image-with-fallback';

export type WildlifeCardProps = {
  name: string;
  scientificName?: string | null;
  imageUrl?: string | null;
  conservationStatus?: string | null;
  onPress?: () => void;
  variant?: 'default' | 'compact';
};

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  'Least Concern': 'success',
  'Near Threatened': 'warning',
  Vulnerable: 'warning',
  Endangered: 'error',
  'Critically Endangered': 'error',
};

export function WildlifeCard({
  name,
  scientificName,
  imageUrl,
  conservationStatus,
  onPress,
  variant = 'default',
}: WildlifeCardProps) {
  const theme = useTheme();
  const compact = variant === 'compact';

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={name}
        style={({ pressed }) => [styles.compact, { opacity: pressed ? 0.92 : 1 }]}
      >
        <ImageWithFallback uri={imageUrl} style={styles.compactImage} fallbackIcon="pawprint.fill" />
        <LinearGradient
          colors={['rgba(15, 23, 17, 0)', 'rgba(15, 23, 17, 0.72)']}
          locations={[0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ThemedText type="h3" numberOfLines={2} style={styles.compactName}>
          {name}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          width: '100%',
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <ImageWithFallback uri={imageUrl} style={styles.image} fallbackIcon="pawprint.fill" />
      <View style={styles.body}>
        <ThemedText type="h2" numberOfLines={1}>
          {name}
        </ThemedText>
        {scientificName ? (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {scientificName}
          </ThemedText>
        ) : null}
        {conservationStatus ? (
          <View style={styles.badgeRow}>
            <StatusBadge label={conservationStatus} tone={STATUS_TONE[conservationStatus] ?? 'neutral'} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  compact: {
    width: 200,
    aspectRatio: 4 / 5,
    borderRadius: Radius.large,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  compactImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  compactName: {
    color: '#FFFFFF',
    padding: Spacing.lg,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.xxs,
  },
  badgeRow: {
    marginTop: Spacing.sm,
  },
});
