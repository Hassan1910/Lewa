import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

/**
 * Entry point. Waits for the auth session to hydrate, then redirects into
 * the tabs if signed in or to the welcome screen otherwise.
 */
export default function Index() {
  const { loading, session } = useAuth();
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.primary} />
      </View>
    );
  }
  return <Redirect href={session ? '/(tabs)' : '/(auth)/welcome'} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
});
