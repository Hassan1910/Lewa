import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button, FilterChip, Icon, InputField } from '@/components/ui';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { submitFeedback } from '@/services/feedback';

const CATEGORIES = ['General', 'Booking', 'Payment', 'Bug report', 'Suggestion'] as const;

const schema = z.object({
  category: z.enum(CATEGORIES),
  subject: z.string().min(4, 'Give it a short subject'),
  message: z.string().min(10, 'Please share a little more detail'),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function FeedbackScreen() {
  const { session } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'General', subject: '', message: '', reference: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await submitFeedback({
      userId: session?.user.id ?? null,
      category: values.category,
      subject: values.subject,
      message: values.message,
      reference: values.reference || null,
    });
  };

  if (isSubmitSuccessful) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="checkmark.circle.fill" size={48} color={Colors.light.primary} />
          </View>
          <ThemedText type="h1" style={styles.center}>
            Thanks for sharing
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.center}>
            We read every message. If you asked a question, we’ll reply by email within two working
            days.
          </ThemedText>
          <Button label="Back to app" fullWidth onPress={() => router.replace('/(tabs)/profile')} />
        </View>
      </SafeAreaView>
    );
  }

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
          <ThemedText type="h1">Send feedback</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Ideas, questions or bugs — we read every message.
          </ThemedText>
        </View>

        <View style={styles.body}>
          <ThemedText type="caption" themeColor="textSecondary">
            Category
          </ThemedText>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <FilterChip key={c} label={c} selected={value === c} onPress={() => onChange(c)} />
                ))}
              </View>
            )}
          />

          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Subject"
                placeholder="Short summary"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.subject?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="reference"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Booking reference (optional)"
                placeholder="e.g. LW-4KPZ8Q"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <View>
            <ThemedText type="caption" themeColor="textSecondary" style={styles.messageLabel}>
              Message
            </ThemedText>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
                    multiline
                    numberOfLines={6}
                    placeholder="Tell us more"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.message?.message}
                    style={styles.textarea}
                  />
                </View>
              )}
            />
          </View>

          <Button
            label="Send feedback"
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  messageLabel: {
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: FontFamily.regular,
  },
  successContainer: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  center: { textAlign: 'center' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.lg,
  },
});
