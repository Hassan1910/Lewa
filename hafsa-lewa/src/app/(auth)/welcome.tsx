import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon } from '@/components/ui';
import { LEWA_LANDSCAPE_URL } from '@/constants/imagery';
import { Colors, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: LEWA_LANDSCAPE_URL,
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(15, 23, 17, 0.05)', 'rgba(15, 23, 17, 0.85)']}
        locations={[0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Icon name="leaf.fill" size={22} color={Colors.light.primaryDark} />
          </View>
          <View>
            <ThemedText type="overline" style={styles.brandKicker}>
              Est. 1995
            </ThemedText>
            <ThemedText type="h3" style={styles.brand}>
              Lewa
            </ThemedText>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <ThemedText type="display" style={styles.headline}>
            Every visit protects{'\n'}a wild place.
          </ThemedText>
          <ThemedText type="body" style={styles.subhead}>
            Discover Lewa Wildlife Conservancy — a UNESCO World Heritage Site in northern Kenya
            protecting endangered species and empowering neighbouring communities.
          </ThemedText>
          <View style={styles.actions}>
            <Button
              label="Create account"
              variant="primary"
              fullWidth
              onPress={() => router.push('/(auth)/create-account')}
            />
            <Button
              label="Sign in"
              variant="tertiary"
              fullWidth
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.transparentButton}
            />
            <Link href="/(tabs)" replace asChild>
              <ThemedText type="button" style={styles.guest}>
                Continue as guest
              </ThemedText>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E140F' },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: '#F5F1E8',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  brandKicker: {
    color: 'rgba(245, 241, 232, 0.75)',
    letterSpacing: 2,
  },
  copyBlock: {
    gap: Spacing.xl,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 46,
  },
  subhead: {
    color: 'rgba(255,255,255,0.86)',
    maxWidth: 460,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  transparentButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  guest: {
    color: '#F5F1E8',
    textAlign: 'center',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
});
