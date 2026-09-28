import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

export function LegalDocument({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">{title}</ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {paragraphs.map((paragraph) => (
          <ThemedText key={paragraph} type="body">
            {paragraph}
          </ThemedText>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl, gap: Spacing.sm },
  back: { width: 32, height: 32, justifyContent: 'center' },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.lg },
});
