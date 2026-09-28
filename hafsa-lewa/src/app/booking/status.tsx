import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { LoadingState } from '@/components/ui';
import { openBookingRecord, searchParam } from '@/lib/record-navigation';

/** Older alerts used this route. Open the same booking on the detail screen. */
export default function BookingStatusRedirect() {
  const bookingId = searchParam(useLocalSearchParams().bookingId);

  useEffect(() => {
    if (bookingId) openBookingRecord(bookingId, 'replace');
    else router.replace('/(tabs)/bookings');
  }, [bookingId]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LoadingState label="Opening booking" />
    </View>
  );
}
