import { createElement, useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Options = {
  tintColor?: string;
};

export function usePullToRefresh(refresh: () => Promise<unknown>, options?: Options) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const tint = options?.tintColor ?? theme.primary;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const refreshControl = createElement(RefreshControl, {
    refreshing,
    onRefresh,
    tintColor: tint,
    colors: [tint],
  });

  return { refreshing, onRefresh, refreshControl };
}
