import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CommonProps = {
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon = 'sparkles',
  title,
  message,
  actionLabel,
  onAction,
  style,
}: CommonProps & {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon as never} size={36} color={theme.primary} />
      <ThemedText type="h3" style={styles.center}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: CommonProps & { title?: string; message?: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Icon name="exclamationmark.triangle.fill" size={36} color={theme.error} />
      <ThemedText type="h3" style={styles.center}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
      ) : null}
      {onRetry ? <Button label="Try again" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

export function LoadingState({ style, label }: CommonProps & { label?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator color={theme.primary} />
      {label ? (
        <ThemedText type="bodySmall" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function SkeletonCard({ style }: CommonProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  skeleton: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    height: 180,
    width: '100%',
  },
});
