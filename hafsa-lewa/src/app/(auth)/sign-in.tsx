import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon, InputField, ScrollScreen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const theme = useTheme();
  const { signIn, resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await signIn(values.email.trim(), values.password);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      Alert.alert('Sign in', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onForgot = async () => {
    const email = getValues('email').trim();
    if (!email) {
      Alert.alert('Reset password', 'Enter your email above first, then tap Forgot password.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Reset password', 'Check your email for a reset link.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send reset email';
      Alert.alert('Reset password', message);
    }
  };

  return (
    <ScrollScreen contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron.left" size={22} color={theme.text} />
        </Pressable>

        <View style={styles.header}>
          <ThemedText type="h1">Welcome back</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Sign in to your Lewa account to manage bookings and support conservation.
          </ThemedText>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="you@example.com"
              error={errors.email?.message}
              leadingIcon={<Icon name="envelope" size={18} color={theme.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Password"
              secureTextEntry
              autoComplete="password"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              leadingIcon={<Icon name="lock" size={18} color={theme.textSecondary} />}
            />
          )}
        />

        <Pressable style={styles.forgot} onPress={onForgot}>
          <ThemedText type="bodySmall" themeColor="primary">
            Forgot password?
          </ThemedText>
        </Pressable>

        <Button label="Sign in" fullWidth loading={submitting} onPress={handleSubmit(onSubmit)} />

        <View style={styles.footer}>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Don’t have an account?{' '}
          </ThemedText>
          <Link href="/(auth)/create-account">
            <ThemedText type="bodySmall" themeColor="primary">
              Create one
            </ThemedText>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
});
