import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaystackCheckoutModal, type PaystackCheckoutResult } from '@/components/paystack-checkout-modal';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorState, Icon, ImageWithFallback, LoadingState, SectionHeader } from '@/components/ui';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { createDonationIntent, getCampaignById } from '@/services/donations';
import { confirmCheckout, initializePayment, type PaymentInitResult } from '@/services/payments';
import { formatCurrency } from '@/utils/format';

export default function DonationCampaignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, profile } = useAuth();
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['donations', id],
    queryFn: () => getCampaignById(id!),
    enabled: Boolean(id),
  });
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<PaymentInitResult | null>(null);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={(error as Error).message} />
      </View>
    );
  }
  if (!campaign) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="heart.fill"
          title="Campaign unavailable"
          message="Browse other conservation campaigns."
          actionLabel="All campaigns"
          onAction={() => router.replace('/donations')}
        />
      </View>
    );
  }

  const suggested = campaign.suggestedAmounts;
  const selectedDefault = amount ?? suggested[0] ?? 2500;
  const finalAmount = customAmount ? Number(customAmount) || 0 : selectedDefault;
  const progress = Math.min(1, campaign.amountRaised / campaign.goalAmount);

  const donate = async () => {
    if (!session) {
      router.push('/(auth)/sign-in');
      return;
    }
    if (finalAmount < 100) {
      Alert.alert('Donation', 'Minimum gift is KSh 100.');
      return;
    }
    setSubmitting(true);
    try {
      const intent = await createDonationIntent({
        campaignId: campaign.id,
        userId: session.user.id,
        amount: finalAmount,
        currency: campaign.currency,
        donorEmail: session.user.email,
        donorName: profile?.full_name,
      });
      const init = await initializePayment({
        purpose: 'donation',
        donationId: intent.id,
        email: session.user.email ?? '',
      });
      setCheckout(init);
    } catch (err) {
      Alert.alert('Donation', err instanceof Error ? err.message : 'Could not start payment');
    } finally {
      setSubmitting(false);
    }
  };

  const onCheckout = async (result: PaystackCheckoutResult) => {
    const current = checkout;
    setCheckout(null);
    if (!current || result.status === 'cancelled') return;
    setSubmitting(true);
    try {
      const status = await confirmCheckout({
        paymentId: current.paymentId,
        reference: result.reference ?? current.reference,
      });
      router.replace({
        pathname: '/donations/success',
        params: {
          amount: String(current.amount || finalAmount),
          campaign: campaign.title,
          status,
        },
      });
    } catch (err) {
      Alert.alert('Donation', err instanceof Error ? err.message : 'Could not confirm payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <ImageWithFallback uri={campaign.coverImage} style={StyleSheet.absoluteFill} fallbackIcon="heart.fill" />
          <LinearGradient
            colors={['rgba(15,23,17,0.4)', 'rgba(15,23,17,0)', 'rgba(15,23,17,0.85)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
              <Icon name="chevron.left" size={20} color="#FFFFFF" />
            </Pressable>
            <View style={styles.heroBottom}>
              <ThemedText type="display" style={styles.heroTitle}>
                {campaign.title}
              </ThemedText>
              <ThemedText type="body" style={styles.heroSub}>
                {campaign.summary}
              </ThemedText>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.progressCard}>
            <View style={[styles.progressTrack, { backgroundColor: Colors.light.backgroundElement }]}>
              <View style={[styles.progressBar, { backgroundColor: Colors.light.primary, width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.progressMeta}>
              <ThemedText type="h2" themeColor="primary">
                {formatCurrency(campaign.amountRaised, { currency: campaign.currency })}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                of {formatCurrency(campaign.goalAmount, { currency: campaign.currency })} goal
              </ThemedText>
            </View>
          </View>

          {campaign.storyParagraphs.map((p, i) => (
            <ThemedText type="body" key={i}>
              {p}
            </ThemedText>
          ))}

          <SectionHeader title="Your impact" />
          <View style={{ gap: Spacing.md }}>
            {campaign.impact.map((i) => (
              <View key={`${i.amount}-${i.description}`} style={[styles.impactRow, { borderColor: Colors.light.border }]}>
                <View style={[styles.impactBadge, { backgroundColor: Colors.light.primaryLight }]}>
                  <ThemedText type="bodyMedium" themeColor="primaryDark">
                    {formatCurrency(i.amount, { currency: campaign.currency })}
                  </ThemedText>
                </View>
                <ThemedText type="bodySmall" style={styles.impactText}>
                  {i.description}
                </ThemedText>
              </View>
            ))}
          </View>

          <SectionHeader title="Choose your gift" />
          <View style={styles.amounts}>
            {suggested.map((a) => {
              const active = selectedDefault === a && !customAmount;
              return (
                <Pressable
                  key={a}
                  onPress={() => {
                    setAmount(a);
                    setCustomAmount('');
                  }}
                  style={[
                    styles.amountChip,
                    {
                      backgroundColor: active ? Colors.light.primary : Colors.light.surface,
                      borderColor: active ? Colors.light.primary : Colors.light.border,
                    },
                  ]}
                >
                  <ThemedText type="bodyMedium" style={{ color: active ? '#FFFFFF' : Colors.light.text }}>
                    {formatCurrency(a, { currency: campaign.currency })}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.customField, { borderColor: Colors.light.border }]}>
            <ThemedText type="body" themeColor="textSecondary">
              KSh
            </ThemedText>
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="number-pad"
              placeholder="Enter a custom amount"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.customInput}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderColor: Colors.light.border }]}>
        <View>
          <ThemedText type="caption" themeColor="textSecondary">
            Giving
          </ThemedText>
          <ThemedText type="h3" themeColor="primary">
            {formatCurrency(finalAmount, { currency: campaign.currency })}
          </ThemedText>
        </View>
        <Button
          label={session ? 'Donate with Paystack' : 'Sign in to donate'}
          disabled={finalAmount < 1}
          loading={submitting}
          onPress={() => void donate()}
          trailingIcon={<Icon name="heart.fill" size={16} color="#FFFFFF" />}
        />
      </View>
      <PaystackCheckoutModal authorizationUrl={checkout?.authorizationUrl ?? null} onComplete={(result) => void onCheckout(result)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { paddingBottom: Spacing.huge * 2 },
  hero: { height: 360, overflow: 'hidden' },
  heroSafe: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,17,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: Spacing.sm },
  heroTitle: { color: '#FFFFFF', fontSize: 32, lineHeight: 38 },
  heroSub: { color: 'rgba(255,255,255,0.9)' },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  progressCard: {
    padding: Spacing.lg,
    borderRadius: Radius.large,
    backgroundColor: Colors.light.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border,
    gap: Spacing.md,
  },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 999 },
  progressMeta: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.medium,
    borderWidth: 1,
    backgroundColor: Colors.light.surface,
  },
  impactBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 999 },
  impactText: { flex: 1 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amountChip: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.pill, borderWidth: 1 },
  customField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    minHeight: 52,
    backgroundColor: Colors.light.surface,
  },
  customInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: Spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
