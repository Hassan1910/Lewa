import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon, InputField, ScrollScreen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authHref, destinationAfterAuth, safeReturnTo } from '@/lib/auth-redirect';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAccountScreen() {
  const theme = useTheme();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const resumeAt = safeReturnTo(returnTo);
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { hasSession } = await signUp(values.email.trim(), values.password, values.fullName.trim());
      if (hasSession) {
        router.replace(destinationAfterAuth(returnTo));
        return;
      }
      // Email confirmation is required, so there is no session yet. Send them
      // to sign-in with the same return path so the booking is still waiting.
      Alert.alert(
        'Account created',
        'Check your inbox to verify your address, then sign in to continue.',
        [{ text: 'Continue', onPress: () => router.replace(authHref('sign-in', resumeAt)) }],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-up failed';
      Alert.alert('Create account', message);
    } finally {
      setSubmitting(false);
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
          <ThemedText type="h1">Create your account</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Join a global community protecting northern Kenya’s wildlife and communities.
          </ThemedText>
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Full name"
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Amira Osman"
              error={errors.fullName?.message}
              leadingIcon={<Icon name="person.crop.circle" size={18} color={theme.textSecondary} />}
            />
          )}
        />

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
              autoComplete="password-new"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              helper="Use a mix of letters, numbers and symbols."
              leadingIcon={<Icon name="lock" size={18} color={theme.textSecondary} />}
            />
          )}
        />

        <Button label="Create account" fullWidth loading={submitting} onPress={handleSubmit(onSubmit)} />

        <ThemedText type="caption" themeColor="textSecondary" style={styles.legal}>
          By continuing you agree to Lewa’s Terms of Service and Privacy Policy.
        </ThemedText>

        <View style={styles.footer}>
          <ThemedText type="bodySmall" themeColor="textSecondary">
            Already have an account?{' '}
          </ThemedText>
          <Link href={authHref('sign-in', resumeAt)} replace>
            <ThemedText type="bodySmall" themeColor="primary">
              Sign in
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
  form: { gap: Spacing.lg },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  legal: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
