import { Colors } from '@/constants/theme';

/**
 * v1 of the Lewa shell forces the light brand palette so photography-first
 * screens stay legible on every device. Dark tokens are still exported and
 * can be re-enabled by wiring `useColorScheme()` here once dark visuals are
 * designed for every screen.
 */
export function useTheme() {
  return Colors.light;
}
