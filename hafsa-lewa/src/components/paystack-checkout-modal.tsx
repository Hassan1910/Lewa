import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

export const PAYSTACK_CALLBACK_PREFIX = 'hafsalewa://paystack-callback';

export type PaystackCheckoutResult =
  | { status: 'completed'; reference: string | null }
  | { status: 'cancelled' };

/** Paystack appends `reference` and `trxref` when it redirects to the callback URL. */
export function paystackCallbackReference(url: string): string | null {
  if (!url.toLowerCase().startsWith(PAYSTACK_CALLBACK_PREFIX)) return null;
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const params = new URLSearchParams(query);
  const reference = params.get('reference') || params.get('trxref');
  return reference && reference.trim() ? reference : null;
}

type PaystackCheckoutModalProps = {
  authorizationUrl: string | null;
  onComplete: (result: PaystackCheckoutResult) => void;
};

export function PaystackCheckoutModal({ authorizationUrl, onComplete }: PaystackCheckoutModalProps) {
  const [loading, setLoading] = useState(true);
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;
    setLoading(true);
  }, [authorizationUrl]);

  const finish = (result: PaystackCheckoutResult) => {
    if (settled.current) return;
    settled.current = true;
    onComplete(result);
  };

  const handleUrl = (url: string): boolean => {
    if (!url.toLowerCase().startsWith(PAYSTACK_CALLBACK_PREFIX)) return false;
    finish({ status: 'completed', reference: paystackCallbackReference(url) });
    return true;
  };

  return (
    <Modal
      visible={authorizationUrl != null}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => finish({ status: 'cancelled' })}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.bar}>
          <ThemedText type="h3">Pay with Paystack</ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close payment"
            hitSlop={12}
            onPress={() => finish({ status: 'cancelled' })}
            style={styles.close}>
            <Icon name="xmark" size={18} color={Colors.light.text} />
          </Pressable>
        </View>
        {authorizationUrl ? (
          <View style={styles.web}>
            <WebView
              source={{ uri: authorizationUrl }}
              originWhitelist={['*']}
              setSupportMultipleWindows={false}
              startInLoadingState
              onLoadEnd={() => setLoading(false)}
              onShouldStartLoadWithRequest={(request) => !handleUrl(request.url)}
              onNavigationStateChange={(nav: WebViewNavigation) => {
                handleUrl(nav.url);
              }}
              onError={(event) => {
                handleUrl(event.nativeEvent.url);
              }}
            />
            {loading ? (
              <View style={styles.loader} pointerEvents="none">
                <ActivityIndicator color={Colors.light.primary} />
              </View>
            ) : null}
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.surface },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundElement,
  },
  web: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
  },
});
