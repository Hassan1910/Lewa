import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, InputField, ScrollScreen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

function recoveryTokens(url: string): { accessToken: string; refreshToken: string } | null {
  const fragment = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '';
  const params = new URLSearchParams(fragment || query);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const applyUrl = async (url: string | null) => {
      if (!url) return;
      const tokens = recoveryTokens(url);
      if (!tokens) return;
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      if (!error) setReady(true);
    };

    void Linking.getInitialURL().then(applyUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void applyUrl(url);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => {
      subscription.remove();
      authSub.subscription.unsubscribe();
    };
  }, []);

  const save = async () => {
    if (password.length < 8) {
      Alert.alert('Reset password', 'Use at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert('Password updated', 'You can continue with your new password.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err) {
      Alert.alert('Reset password', err instanceof Error ? err.message : 'Could not update your password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollScreen contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <ThemedText type="h1">Choose a new password</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          {ready
            ? 'This recovery link is valid. Set a password for your Lewa account.'
            : 'Open the reset link from your email on this device, then set a new password here.'}
        </ThemedText>
      </View>
      <InputField
        label="New password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button label="Update password" fullWidth loading={saving} disabled={!ready} onPress={() => void save()} />
      <Button label="Back to sign in" variant="tertiary" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, gap: Spacing.lg, flexGrow: 1 },
  header: { gap: Spacing.sm, marginTop: Spacing.huge },
});
