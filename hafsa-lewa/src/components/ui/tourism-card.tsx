import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusBadge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

import { ImageWithFallback } from './image-with-fallback';

export type TourismCardProps = {
  title: string;
  category: string;
  imageUrl?: string | null;
  price: number;
  currency?: string;
  durationLabel?: string | null;
  onPress?: () => void;
  variant?: 'default' | 'compact';
};

export function TourismCard({
  title,
  category,
  imageUrl,
  price,
  currency = 'KES',
  durationLabel,
  onPress,
  variant = 'default',
}: TourismCardProps) {
  const theme = useTheme();
  const compact = variant === 'compact';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          width: compact ? 260 : '100%',
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <ImageWithFallback
        uri={imageUrl}
        style={[styles.image, { aspectRatio: compact ? 16 / 10 : 16 / 9 }]}
        fallbackIcon="binoculars.fill"
      />
      <View style={styles.body}>
        <StatusBadge label={category} tone="primary" />
        <ThemedText type="h3" numberOfLines={2}>
          {title}
        </ThemedText>
        <View style={styles.metaRow}>
          {durationLabel ? (
            <View style={styles.metaItem}>
              <Icon name="clock" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" themeColor="textSecondary">
                {durationLabel}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText type="bodyMedium" themeColor="primary">
            {formatCurrency(price, { currency })}
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
  image: { width: '100%' },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
