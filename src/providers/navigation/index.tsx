import { getActiveRouteName } from '@/helpers';
import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigationState,
  ParamListBase
} from '@react-navigation/native';
import { createContext, useContext, useRef } from 'react';
import deeplinks from '@/constants/deeplinks';
import { theme } from '@/constants';
import { useColorScheme } from 'react-native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export const navigate = (name: string, params: object | undefined) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

interface NavigationHistory {
  prev: string;
  current: string;
}

const NavigationHistoryContext = createContext<NavigationHistory>({
  prev: '',
  current: ''
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const historyRef = useRef<NavigationHistory>({
    prev: '',
    current: ''
  });

  const { lightTheme, darkTheme } = theme;
  const scheme = useColorScheme();

  const currentTheme = scheme === 'dark' ? darkTheme : lightTheme;

  const handleStateChange = (state: NavigationState | undefined) => {
    if (!state) return;
    const currentRouteName = getActiveRouteName(state);
    if (!currentRouteName) return;
    if (currentRouteName !== historyRef.current.current) {
      historyRef.current.prev = historyRef.current.current;
      historyRef.current.current = currentRouteName;
    }
  };

  if (!children) {
    return null;
  }

  return (
    <NavigationHistoryContext.Provider value={historyRef.current}>
      <NavigationContainer
        onStateChange={handleStateChange}
        ref={navigationRef}
        linking={deeplinks}
        theme={currentTheme}
      >
        {children}
      </NavigationContainer>
    </NavigationHistoryContext.Provider>
  );
};

export const useScreenHistory = () => useContext(NavigationHistoryContext);
