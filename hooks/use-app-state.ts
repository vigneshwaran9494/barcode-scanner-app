import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateOptions {
  onForeground?: () => void;
}

export const useAppState = (options?: UseAppStateOptions) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState<AppStateStatus>(
    appState.current,
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        options?.onForeground?.();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [options?.onForeground]);

  return appStateVisible;
};

