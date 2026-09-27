import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenBaseProps = {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  background?: 'app' | 'surface' | 'transparent';
};

function bgColor(theme: ReturnType<typeof useTheme>, background: 'app' | 'surface' | 'transparent') {
  if (background === 'surface') return theme.surface;
  if (background === 'transparent') return 'transparent';
  return theme.background;
}

export function Screen({
  children,
  edges = ['top', 'left', 'right'],
  style,
  background = 'app',
}: ScreenBaseProps) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: bgColor(theme, background) }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

export function ScrollScreen({
  children,
  edges,
  style,
  background = 'app',
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  bottomInset = Spacing.xxxl,
}: ScreenBaseProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  bottomInset?: number;
}) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges ?? ['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: bgColor(theme, background) }, style]}
    >
      <ScrollView
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenPadding({
  children,
  style,
  horizontal = Spacing.xl,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  horizontal?: number;
}) {
  return <View style={[{ paddingHorizontal: horizontal }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
});
