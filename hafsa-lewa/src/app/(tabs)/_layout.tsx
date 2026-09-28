import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { unreadNotificationCount } from '@/services/notifications';

type TabConfig = {
  name: string;
  label: string;
  icon: string;
};

const TABS: TabConfig[] = [
  { name: 'index', label: 'Home', icon: 'house' },
  { name: 'explore', label: 'Explore', icon: 'safari.fill' },
  { name: 'bookings', label: 'Bookings', icon: 'calendar' },
  { name: 'notifications', label: 'Alerts', icon: 'bell' },
  { name: 'profile', label: 'Profile', icon: 'person.crop.circle' },
];

const TAB_CONTENT_HEIGHT = 56;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? Spacing.sm : 0);
  const { session } = useAuth();
  const { data: badges = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count', session?.user.id ?? 'guest'],
    queryFn: unreadNotificationCount,
    enabled: Boolean(session),
    refetchInterval: 60_000,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          borderTopColor: Colors.light.border,
          backgroundColor: Colors.light.surface,
          paddingTop: Spacing.sm,
          paddingBottom,
          height: TAB_CONTENT_HEIGHT + paddingBottom,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 11,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrap}>
                <Icon name={tab.icon as never} size={22} color={typeof color === 'string' ? color : undefined} />
                {tab.name === 'notifications' && badges > 0 ? (
                  <View style={styles.badge}>
                    <ThemedText type="caption" style={styles.badgeText}>
                      {badges}
                    </ThemedText>
                  </View>
                ) : null}
                {focused ? (
                  <View style={[styles.activeDot, typeof color === 'string' ? { backgroundColor: color } : undefined]} />
                ) : null}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
