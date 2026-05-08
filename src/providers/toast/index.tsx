import React, { createContext, FC, ReactNode, useContext, useCallback, useState, useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { BaseToast, BaseToastVariant } from '@/components';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { BounceInUp, SlideOutUp, runOnJS } from 'react-native-reanimated';

const {
  animation: { duration },
  headerBar
} = config;

interface OpenToastProps {
  onOpen?: () => Promise<void> | void;
  onClose?: () => Promise<void> | void;
  title?: string;
  titleIcon?: ReactNode;
  desc?: string;
  descIcon?: ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descStyle?: TextStyle;
  center?: boolean;
  type?: BaseToastVariant;
}

type ToastContextInterface = {
  openToast: ({
    onOpen,
    onClose,
    title,
    titleIcon,
    desc,
    descIcon,
    style,
    titleStyle,
    descStyle,
    center,
    type
  }: OpenToastProps) => void;
  closeToast: () => void;
};

type Props = {
  children?: ReactNode;
};

const ToastContext = createContext<ToastContextInterface>({
  openToast: () => {},
  closeToast: () => {}
});

export const ToastProvider: FC<Props> = ({ children }) => {
  if (!children) {
    return null;
  }

  const [toastActive, setToastActive] = useState<OpenToastProps | undefined>(undefined);

  const closeToast = useCallback(() => {
    const { onClose } = toastActive || {};

    runOnJS(setToastActive)(undefined);

    if (onClose && typeof onClose === 'function') {
      runOnJS(onClose)();
    }
  }, [setToastActive, toastActive]);

  const pan = Gesture.Pan().onStart(closeToast).onEnd(closeToast);
  const tap = Gesture.Tap().onStart(closeToast).onEnd(closeToast);

  const gesture = Gesture.Race(pan, tap);

  const theme = useTheme();
  const styles = useStyles(theme);

  const openToast = useCallback(
    ({ type = BaseToastVariant.info, title, desc, ...rest }: OpenToastProps) => {
      if ((!title && !desc) || toastActive) {
        return;
      }

      runOnJS(setToastActive)({
        title,
        desc,
        type,
        ...rest
      });
    },
    [setToastActive, toastActive]
  );

  const toastMessage = useMemo(() => {
    if (toastActive === undefined) {
      return null;
    }

    const { onOpen, title, titleIcon, desc, descIcon, style, titleStyle, descStyle, center, type } = toastActive || {};

    if (onOpen && typeof onOpen === 'function') {
      runOnJS(onOpen)();
    }

    if (!title && !desc) {
      return null;
    }

    return (
      <GestureDetector gesture={gesture}>
        <View style={styles.screen}>
          <Animated.View
            key={'toast-message'}
            entering={BounceInUp.duration(duration)}
            exiting={SlideOutUp.duration(duration)}
            style={styles.container}
          >
            <BaseToast
              title={title}
              titleIcon={titleIcon}
              desc={desc}
              descIcon={descIcon}
              style={style}
              titleStyle={titleStyle}
              descStyle={descStyle}
              center={center}
              variant={type}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }, [toastActive]);

  return (
    <ToastContext.Provider
      value={{
        openToast,
        closeToast
      }}
    >
      {children}
      {toastMessage}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export { BaseToastVariant as ToastType };

interface Styles {
  screen: ViewStyle;
  container: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { top = 0 } = useSafeAreaInsets();

  return StyleSheet.create<Styles>({
    screen: {
      zIndex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    container: {
      zIndex: 1,
      position: 'absolute',
      top: headerBar.height + top,
      left: 0,
      right: 0,
      paddingHorizontal: 20
    }
  });
};
