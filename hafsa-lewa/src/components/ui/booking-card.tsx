import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusBadge, type StatusBadgeTone } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookingStatus } from '@/services/types';
import { formatCurrency, formatDate } from '@/utils/format';

import { ImageWithFallback } from './image-with-fallback';

export type BookingCardProps = {
  serviceTitle: string;
  imageUrl?: string | null;
  isoDate: string;
  guests: number;
  status: BookingStatus;
  reference: string;
  amount?: number;
  currency?: string;
  onPress?: () => void;
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending_payment: 'Awaiting payment',
  payment_verification: 'Verifying payment',
  pending_review: 'Under review',
  cancelled: 'Cancelled',
  completed: 'Completed',
  refunded: 'Refunded',
  draft: 'Draft',
};

const STATUS_TONE: Record<BookingStatus, StatusBadgeTone> = {
  confirmed: 'success',
  pending_payment: 'warning',
  payment_verification: 'warning',
  pending_review: 'info',
  cancelled: 'error',
  completed: 'neutral',
  refunded: 'neutral',
  draft: 'neutral',
};

export function BookingCard({
  serviceTitle,
  imageUrl,
  isoDate,
  guests,
  status,
  reference,
  amount,
  currency = 'KES',
  onPress,
}: BookingCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      {imageUrl ? (
        <ImageWithFallback uri={imageUrl} style={styles.image} fallbackIcon="binoculars.fill" />
      ) : null}
      <View style={styles.body}>
        <StatusBadge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
        <ThemedText type="h3" numberOfLines={2}>
          {serviceTitle}
        </ThemedText>
        <View style={styles.metaRow}>
          <Icon name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" themeColor="textSecondary">
            {formatDate(isoDate)}
          </ThemedText>
          <View style={styles.dot} />
          <Icon name="person.2.fill" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" themeColor="textSecondary">
            {guests} {guests === 1 ? 'guest' : 'guests'}
          </ThemedText>
        </View>
        <View style={styles.footerRow}>
          <ThemedText type="caption" themeColor="textSecondary">
            Ref {reference}
          </ThemedText>
          {typeof amount === 'number' ? (
            <ThemedText type="bodyMedium" themeColor="primary">
              {formatCurrency(amount, { currency })}
            </ThemedText>
          ) : null}
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#B0B4BA',
    marginHorizontal: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
