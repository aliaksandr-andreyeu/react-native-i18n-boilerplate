import React, { forwardRef, useRef, useState, useMemo, useLayoutEffect, useCallback, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  GestureResponderEvent,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import Animated, { CurvedTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCommonStyles } from '@/hooks';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedSheetTextInput = Animated.createAnimatedComponent(BottomSheetTextInput);

const {
  isIOS,
  isRTL,
  fonts: { generalSans },
  animation: { duration },
  components: {
    inputs: {
      buttons: { activeOpacity, hitSlop }
    }
  }
} = config;

interface BaseInputProps extends Omit<TextInputProps, 'onChange'> {
  onChange?: (...event: any[]) => void;
  error?: boolean;
  hideClearButton?: boolean;
  inputContainerStyle?: ViewStyle;
  title?: string;
  isBottomSheet?: boolean;
  required?: boolean;
  dropdown?: boolean;
  focusedBorderColor?: string;
  rightIcon?: ReactNode;
  buttonsStyle?: ViewStyle;
  enableButtonsAnimation?: boolean;
}

const BaseInput = forwardRef<TextInput, BaseInputProps>(
  (
    {
      style,
      error = false,
      placeholder,
      title,
      multiline,
      secureTextEntry,
      onChange,
      onBlur,
      value,
      inputContainerStyle,
      hideClearButton,
      isBottomSheet = false,
      required = false,
      dropdown = false,
      focusedBorderColor,
      rightIcon = null,
      buttonsStyle = {},
      enableButtonsAnimation = false,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setFocused] = useState<boolean>(false);
    const [isSecureText, setSecureText] = useState(false);

    const inputRef = useRef<TextInput>(null);

    const theme = useTheme();
    const styles = useStyles(theme);

    const {
      palette: { red, base, graphite }
    } = theme;

    useLayoutEffect(() => {
      if (value && !isFocused) {
        setFocused(true);
      }
    }, [value]);

    useLayoutEffect(() => {
      if (!secureTextEntry || multiline) {
        return;
      }
      setSecureText(secureTextEntry);
    }, [secureTextEntry, multiline]);

    const changeSecureMode = () => {
      setSecureText(!isSecureText);
    };

    const onChangeHandler = (val: string) => {
      onChange && typeof onChange === 'function' && onChange(val);
    };

    const onFocusHandler = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      inputRef?.current?.focus();
      setFocused(true);
    };

    const onBlurHandler = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (!value) {
        inputRef?.current?.blur();
        setFocused(false);
      }

      onBlur && typeof onBlur === 'function' && onBlur(event);
    };

    const onClearHandler = (event: GestureResponderEvent) => {
      inputRef?.current?.blur();
      setFocused(false);

      onChange && typeof onChange === 'function' && onChange('');
    };

    const containerStyle = useAnimatedStyle(() => {
      let borderColor = base.white;

      if (error) {
        borderColor = red['600'];
      } else if (focusedBorderColor && isFocused) {
        borderColor = focusedBorderColor;
      }

      return {
        borderColor: withTiming(borderColor, { duration })
      };
    });

    const labelStyle = useAnimatedStyle(() => {
      return {
        fontSize: withTiming(isFocused ? 10 : 14, { duration }),
        top: withTiming(isFocused ? 2 : 12, { duration })
      };
    });

    const inputStyle = useAnimatedStyle(() => {
      let color = graphite['900'];

      if (error) {
        color = red['600'];
      } else if (focusedBorderColor && isFocused) {
        color = focusedBorderColor;
      }

      if (multiline) {
        return {
          paddingTop: withTiming(isFocused ? 24 : 14, { duration }),
          color: withTiming(color, { duration })
        };
      }
      return {
        paddingTop: withTiming(isFocused ? 14 : 0, { duration }),
        color: withTiming(color, { duration })
      };
    });

    const clearButton = useMemo(() => {
      if (!value || multiline) {
        return null;
      }
      return (
        <TouchableOpacity
          testID='base-input-clear-button'
          style={[styles.inputBtn, { ...(!secureTextEntry && styles.secureBtn) }, styles.inputBtnWithValue]}
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={onClearHandler}
        >
          <SvgIcon name={SvgXmlIconNames.closeCircle} size={IconSize.xs} color={'#8fa6ae'} />
        </TouchableOpacity>
      );
    }, [styles, secureTextEntry, graphite, isSecureText, changeSecureMode, onClearHandler, multiline, value]);

    const dropDown = useMemo(() => {
      if (!dropdown) return null;

      return (
        <View testID='base-input-dropdown' style={[styles.inputBtn, styles.secureBtn]}>
          <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} color={'#8fa6ae'} />
        </View>
      );
    }, [dropdown]);

    const secureButton = useMemo(() => {
      if (!secureTextEntry || multiline) {
        return null;
      }
      const iconName = isSecureText ? SvgXmlIconNames.eyeSlash : SvgXmlIconNames.eye;
      return (
        <AnimatedTouchableOpacity
          style={[styles.inputBtn, styles.secureBtn]}
          activeOpacity={activeOpacity}
          testID='toggle-secure-text'
          hitSlop={hitSlop}
          onPress={changeSecureMode}
        >
          <SvgIcon name={iconName} size={IconSize.sm} color={'#8fa6ae'} />
        </AnimatedTouchableOpacity>
      );
    }, [styles, secureTextEntry, isSecureText, changeSecureMode, multiline]);

    const label = useMemo(() => {
      if (!title) {
        return null;
      }
      return (
        <Animated.Text testID='base-input-title' style={[styles.label, labelStyle]}>
          {title}
          {required && (
            <Animated.Text testID='base-input-required' style={[styles.label, styles.required, labelStyle]}>
              {' '}
              *
            </Animated.Text>
          )}
        </Animated.Text>
      );
    }, [labelStyle, styles, title, required]);

    const Input = useCallback(
      ({
        isFocused,
        isSecureText,
        value,
        ...props
      }: { isFocused: boolean; isSecureText: boolean } & TextInputProps) => {
        return (
          <AnimatedSheetTextInput
            testID='base-input-field-bottom-sheet'
            value={value}
            secureTextEntry={isSecureText}
            ref={inputRef as any}
            placeholder={isFocused ? placeholder : ''}
            {...props}
          />
        );
      },
      []
    );

    return (
      <Animated.View
        testID='base-input'
        style={[styles.container, { ...(multiline && styles.containerMultiline) }, containerStyle, inputContainerStyle]}
      >
        {label}
        {isBottomSheet ? (
          <Input
            testID='base-input-field'
            multiline={multiline}
            isSecureText={isSecureText}
            onChangeText={onChangeHandler}
            blurOnSubmit={true}
            placeholderTextColor={theme.palette.text.base.mask}
            style={[
              styles.input,
              { ...(multiline && styles.multiline) },
              { ...(secureTextEntry && !multiline && styles.secureTextEntry) },
              inputStyle,
              style
            ]}
            onFocus={onFocusHandler}
            isFocused={isFocused}
            onBlur={onBlurHandler}
            value={value}
            {...rest}
          />
        ) : (
          <AnimatedTextInput
            testID='base-input-field'
            ref={inputRef}
            multiline={multiline}
            secureTextEntry={isSecureText}
            onChangeText={onChangeHandler}
            placeholderTextColor={theme.palette.text.base.mask}
            blurOnSubmit={true}
            style={[
              styles.input,
              { ...(multiline && styles.multiline) },
              { ...(secureTextEntry && !multiline && styles.secureTextEntry) },
              inputStyle,
              style
            ]}
            onFocus={onFocusHandler}
            placeholder={isFocused ? placeholder : ''}
            onBlur={onBlurHandler}
            value={value}
            {...rest}
          />
        )}
        <Animated.View
          layout={enableButtonsAnimation ? CurvedTransition : undefined}
          style={[styles.buttons, buttonsStyle]}
        >
          {hideClearButton ? null : clearButton}
          {secureButton}
          {dropDown}
          {rightIcon}
        </Animated.View>
      </Animated.View>
    );
  }
);

interface Styles {
  container: ViewStyle;
  containerMultiline: ViewStyle;
  secureTextEntry: ViewStyle;
  inputBtn: ViewStyle;
  inputBtnWithValue: ViewStyle;
  secureBtn: ViewStyle;
  buttons: ViewStyle;
  multiline: TextStyle;
  input: TextStyle;
  label: TextStyle;
  required: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      borderWidth: 1,
      borderColor: palette.base.white,
      borderRadius: 8,
      gap: 0,
      flexDirection: 'row',
      height: 44,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    containerMultiline: {
      height: 'auto'
    },
    secureTextEntry: {
      paddingRight: 8
    },
    buttons: {
      flexDirection: 'row',
      gap: 8,
      borderRadius: 8
    },
    inputBtn: {
      marginTop: 8,
      height: 24,
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4
    },
    inputBtnWithValue: {
      marginTop: 9
    },
    secureBtn: {
      marginRight: 8
    },
    multiline: {
      textAlignVertical: 'top',
      height: 'auto',
      minHeight: 160,
      paddingVertical: 8
    },
    input: {
      borderRadius: 8,
      flexGrow: 1,
      flexShrink: 1,
      paddingHorizontal: 16,
      paddingVertical: 0,
      fontSize: 14,
      fontFamily: generalSans.medium,
      color: palette.graphite['900'],
      textAlignVertical: 'center',
      textAlign: isRTL ? 'right' : 'left',
      height: 44
    },
    label: {
      position: 'absolute',
      top: 12,
      left: 16,
      fontSize: 14,
      fontFamily: generalSans.medium,
      color: '#8fa6ae'
    },
    required: {
      color: '#8050F1'
    }
  });
};

export default BaseInput;
