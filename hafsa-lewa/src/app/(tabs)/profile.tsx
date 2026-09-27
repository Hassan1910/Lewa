import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, ProfileRow, SectionHeader } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function ProfileTab() {
  const { session, profile, signOut } = useAuth();
  const name = profile?.full_name || session?.user.email?.split('@')[0] || 'Guest';
  const email = profile?.email || session?.user.email || 'Browse as guest';
  const since = profile
    ? `Member · ${profile.role.replace('_', ' ')}`
    : 'Sign in to save bookings and donations';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <ThemedText type="h1">Profile</ThemedText>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderColor: Colors.light.border }]}>
          <View style={[styles.avatar, { backgroundColor: Colors.light.primaryLight }]}>
            <ThemedText type="h1" themeColor="primaryDark">
              {name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.cardBody}>
            <ThemedText type="h3">{name}</ThemedText>
            <ThemedText type="bodySmall" themeColor="textSecondary">
              {email}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {since}
            </ThemedText>
          </View>
          {session ? (
            <Button label="Edit" variant="tertiary" size="sm" onPress={() => router.push('/settings/edit-profile')} />
          ) : (
            <Button label="Sign in" variant="tertiary" size="sm" onPress={() => router.push('/(auth)/sign-in')} />
          )}
        </View>

        <SectionHeader title="Activity" />
        <View style={styles.group}>
          <ProfileRow icon="calendar" label="My bookings" hint="Upcoming and past" onPress={() => router.push('/(tabs)/bookings')} />
          <ProfileRow icon="heart.fill" label="Donations" hint="Campaigns you support" onPress={() => router.push('/donations')} />
          <ProfileRow
            icon="creditcard.fill"
            label="Payments"
            hint="Paystack receipts in KSh"
            onPress={() => router.push('/settings/payments')}
          />
        </View>

        <SectionHeader title="Preferences" />
        <View style={styles.group}>
          <ProfileRow
            icon="bell"
            label="Notification preferences"
            onPress={() => router.push('/settings/notification-preferences')}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.group}>
          <ProfileRow icon="questionmark.circle" label="Help & FAQ" onPress={() => router.push('/help')} />
          <ProfileRow icon="envelope" label="Send feedback" onPress={() => router.push('/feedback')} />
          <ProfileRow icon="info.circle" label="About Lewa" hint="Our story and impact" onPress={() => router.push('/about')} />
        </View>

        {session ? (
          <View style={styles.signOut}>
            <ProfileRow
              icon="xmark"
              label="Sign out"
              destructive
              onPress={() => {
                Alert.alert('Sign out', 'Sign out of your Lewa account?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: () => {
                      void signOut().then(() => router.replace('/(auth)/welcome'));
                    },
                  },
                ]);
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.xl },
  content: { padding: Spacing.xl, paddingTop: 0, paddingBottom: Spacing.huge, gap: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 2 },
  group: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
  },
  signOut: {
    marginTop: Spacing.md,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
  },
});
