import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search wildlife, tours, events…',
  onSubmit,
  style,
  editable = true,
}: SearchBarProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      <Icon name="magnifyingglass" color={theme.textSecondary} size={18} />
      <TextInput
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
});
