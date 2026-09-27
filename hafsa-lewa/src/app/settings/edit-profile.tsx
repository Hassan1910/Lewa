import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button, Icon, InputField } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { updateProfile } from '@/services/profile';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name ?? '',
      email: profile?.email ?? session?.user.email ?? '',
      phone: profile?.phone ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!session) {
      Alert.alert('Profile', 'Sign in to update your profile.');
      return;
    }
    await updateProfile(session.user.id, { fullName: values.fullName, phone: values.phone || null });
    await refreshProfile();
    router.back();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Icon name="chevron.left" size={22} color={Colors.light.text} />
          </Pressable>
          <ThemedText type="h1">Edit profile</ThemedText>
        </View>

        <View style={styles.body}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                autoCapitalize="words"
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Phone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                placeholder="Optional"
              />
            )}
          />
          <Button
            label="Save changes"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  flex: { flex: 1 },
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
  body: {
    padding: Spacing.xl,
    paddingTop: 0,
    gap: Spacing.lg,
  },
});
