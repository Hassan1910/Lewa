import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatMonthDay } from '@/utils/format';

import { ImageWithFallback } from './image-with-fallback';

export type EventCardProps = {
  title: string;
  isoDate: string;
  location: string;
  imageUrl?: string | null;
  onPress?: () => void;
  variant?: 'default' | 'row';
  bordered?: boolean;
};

export function EventCard({
  title,
  isoDate,
  location,
  imageUrl,
  onPress,
  variant = 'default',
  bordered = true,
}: EventCardProps) {
  const theme = useTheme();
  const isRow = variant === 'row';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isRow ? styles.row : styles.stack,
        {
          backgroundColor: bordered ? theme.surface : 'transparent',
          borderColor: theme.border,
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      {imageUrl ? (
        <ImageWithFallback
          uri={imageUrl}
          style={isRow ? styles.rowImage : styles.stackImage}
          fallbackIcon="calendar"
        />
      ) : (
        <View style={[isRow ? styles.rowImage : styles.stackImage, styles.dateBadge, { backgroundColor: theme.primaryLight }]}>
          <ThemedText type="h1" themeColor="primaryDark">
            {formatMonthDay(isoDate).day}
          </ThemedText>
          <ThemedText type="caption" themeColor="primaryDark">
            {formatMonthDay(isoDate).month}
          </ThemedText>
        </View>
      )}
      <View style={[styles.body, isRow && styles.rowBody]}>
        <ThemedText type="h3" numberOfLines={2}>
          {title}
        </ThemedText>
        <View style={styles.meta}>
          <Icon name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" themeColor="textSecondary">
            {formatDate(isoDate)}
          </ThemedText>
        </View>
        <View style={styles.meta}>
          <Icon name="mappin.and.ellipse" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {location}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  stack: {
    width: 260,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stackImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  rowImage: {
    width: 96,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  rowBody: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
