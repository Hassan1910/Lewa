import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorState, Icon, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { listCommunityPrograms } from '@/services/content';

export default function CommunityScreen() {
  const { data: programs = [], isLoading, error } = useQuery({
    queryKey: ['community'],
    queryFn: listCommunityPrograms,
  });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="h1">Community</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Conservation is a shared endeavour — with the people who share this landscape with wildlife.
        </ThemedText>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Programmes" />
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={(error as Error).message} /> : null}
        <View style={{ gap: Spacing.md }}>
          {programs.map((p) => (
            <View key={p.id} style={[styles.card, { borderColor: Colors.light.border }]}>
              <ThemedText type="h3">{p.title}</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {p.summary ?? p.description}
              </ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.cta}>
          <ThemedText type="h3">Have a partnership idea?</ThemedText>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Get in touch with our community team.
          </ThemedText>
          <Button label="Contact community team" onPress={() => router.push('/feedback')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
    gap: Spacing.xs,
  },
  cta: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    backgroundColor: Colors.light.primaryLight,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
});
