import { forwardRef, ReactNode, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type InputFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export const InputField = forwardRef<TextInput, InputFieldProps>(function InputField(
  {
    label,
    helper,
    error,
    leadingIcon,
    trailingIcon,
    containerStyle,
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.error : focused ? theme.primary : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: theme.surface,
          },
        ]}
      >
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
      </View>
      {error ? (
        <ThemedText type="caption" themeColor="error" style={styles.helper}>
          {error}
        </ThemedText>
      ) : helper ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.helper}>
          {helper}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    paddingHorizontal: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    paddingVertical: Spacing.md,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    paddingHorizontal: Spacing.xs,
  },
});
