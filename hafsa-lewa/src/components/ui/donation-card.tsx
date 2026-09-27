import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

import { ImageWithFallback } from './image-with-fallback';

export type DonationCardProps = {
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  goal: number;
  raised: number;
  currency?: string;
  onPress?: () => void;
};

export function DonationCard({
  title,
  summary,
  imageUrl,
  goal,
  raised,
  currency = 'KES',
  onPress,
}: DonationCardProps) {
  const theme = useTheme();
  const progress = goal > 0 ? Math.min(1, raised / goal) : 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <ImageWithFallback uri={imageUrl} style={styles.image} fallbackIcon="heart.fill" />
      <View style={styles.body}>
        <ThemedText type="h3">{title}</ThemedText>
        {summary ? (
          <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={2}>
            {summary}
          </ThemedText>
        ) : null}
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>
        <View style={styles.metaRow}>
          <ThemedText type="bodyMedium" themeColor="primary">
            {formatCurrency(raised, { currency })}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            of {formatCurrency(goal, { currency })} goal
          </ThemedText>
        </View>
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
    aspectRatio: 16 / 9,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
