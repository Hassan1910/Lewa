import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { router, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { PushRegistration } from '@/components/push-registration';
import { AuthProvider, useAuth } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

function InactiveAccountGuard() {
  const { accountNotice, clearAccountNotice } = useAuth();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!accountNotice) {
      shown.current = null;
      return;
    }
    if (shown.current === accountNotice) return;
    shown.current = accountNotice;
    Alert.alert('Account unavailable', accountNotice, [
      { text: 'OK', onPress: () => clearAccountNotice() },
    ]);
    router.replace('/(auth)/sign-in');
  }, [accountNotice, clearAccountNotice]);

  return null;
}

const LewaTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
  fonts: {
    regular: { fontFamily: 'Manrope_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Manrope_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' },
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <InactiveAccountGuard />
            <PushRegistration />
            <ThemeProvider value={LewaTheme}>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.light.background },
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="wildlife/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="tourism/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="events/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="donations/index" />
                <Stack.Screen name="donations/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="donations/success" options={{ presentation: 'modal' }} />
                <Stack.Screen name="donations/history" />
                <Stack.Screen name="donations/record/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="booking/[serviceId]" options={{ presentation: 'card' }} />
                <Stack.Screen name="bookings/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="booking/status" options={{ presentation: 'card' }} />
                <Stack.Screen name="booking/confirmation" options={{ presentation: 'modal' }} />
                <Stack.Screen name="search" options={{ presentation: 'modal' }} />
                <Stack.Screen name="help" />
                <Stack.Screen name="feedback" />
                <Stack.Screen name="about" />
                <Stack.Screen name="conservation" />
                <Stack.Screen name="education" />
                <Stack.Screen name="education/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="community" />
                <Stack.Screen name="settings/notification-preferences" />
                <Stack.Screen name="settings/edit-profile" />
                <Stack.Screen name="settings/payments" />
                <Stack.Screen name="legal/privacy" />
                <Stack.Screen name="legal/terms" />
              </Stack>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
