import React, {
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { View, StyleSheet, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseTextVariant } from '@/components/atoms';

export interface OtpInputRefMethods {
  getValue(): string;
  setValue(text: string): void;
  clear(): void;
}

interface IOtpInput {
  onChange?(text: string): void;
  hasError: boolean;
}

const selection = { start: 1, end: 1 };
const inputs = new Array(6).fill(null);
const OtpInput = forwardRef<OtpInputRefMethods, IOtpInput>(function OtpInput({ onChange, hasError }, ref) {
  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);
  const ref5 = useRef<TextInput>(null);
  const inputValues = useRef<Record<number, string>>({});
  const prevLength = useRef<number>(0);

  const refs = useMemo(
    (): Record<number, RefObject<TextInput>> => ({
      0: ref0,
      1: ref1,
      2: ref2,
      3: ref3,
      4: ref4,
      5: ref5
    }),
    []
  );

  useEffect(() => {
    ref0.current?.focus();
  }, []);

  const value = () => Object.values(inputValues.current).join('');

  useImperativeHandle(
    ref,
    () => ({
      setValue(text: string) {
        for (let i = 0; i < text.length; i++) {
          const l = text[i];
          inputValues.current[i] = l;
          refs[i]?.current?.setNativeProps({ text: l });
          refs[i]?.current?.blur();
        }
        prevLength.current = text.length;
      },
      clear() {
        for (let i = 0; i < 6; i++) {
          inputValues.current[i] = '';
          refs[i]?.current?.setNativeProps({ text: '' });
        }
        prevLength.current = 0;
      },
      getValue() {
        return value();
      }
    }),
    []
  );

  const theme = useTheme();
  const styles = useStyles(theme);

  const onChangeText = (index: number, key?: string | undefined, val?: string | undefined) => {
    const currentText = inputValues.current[index];
    const isTextChange = key === 'changeText';

    if ([',', '.', ' ', '-'].includes(key || '')) return refs[index]?.current?.clear();

    prevLength.current = Object.values(inputValues.current).filter((i) => i.length).length || 0;

    const deleteMethod = () => {
      if (currentText) inputValues.current[index] = '';
      else refs?.[index - 1]?.current?.focus?.();
    };

    const addMethod = (s: string | undefined) => {
      if (currentText) {
        if (!isNaN(s as never as number)) {
          inputValues.current[index] = s || '';
          refs[index]?.current?.setNativeProps({ text: s });
        }
        refs[index + 1]?.current?.focus();
      } else {
        inputValues.current[index] = s || '';
        refs[index + 1]?.current?.focus();
      }
    };

    if (isTextChange) {
      if (!val) deleteMethod();
      else addMethod(val);
    } else {
      if (key === 'Backspace') deleteMethod();
      else addMethod(key);
    }

    onChange && onChange(value());
  };

  const _renderInput = useCallback(
    (_: null, index: number) => {
      const ref = refs[index];
      const isLast = index === 5;

      const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
        onChangeText(index, e.nativeEvent.key);
      const onChange = (value: string) => onChangeText(index, 'changeText', value);
      const onFocus = () => !hasError && ref.current?.setNativeProps({ style: { borderColor: 'purple' } });
      const onBlur = () => !hasError && ref.current?.setNativeProps({ style: { borderColor: 'transparent' } });
      const onSubmitEditing = () => (isLast ? refs[index]?.current?.blur() : refs[index + 1]?.current?.focus());
      const onSelectionChange = () => ref.current?.setNativeProps({ text: inputValues.current[index] });

      return (
        <TextInput
          testID={`otp-input-${index}`}
          ref={ref}
          key={`${index}-otp`}
          returnKeyType={isLast ? 'done' : 'next'}
          onFocus={onFocus}
          keyboardType='numeric'
          onBlur={onBlur}
          blurOnSubmit={false}
          onChangeText={onChange}
          selection={selection}
          onSelectionChange={onSelectionChange}
          onSubmitEditing={onSubmitEditing}
          onKeyPress={onKeyPress}
          maxLength={1}
          cursorColor={theme.palette.graphite['900']}
          textAlign='center'
          textAlignVertical='center'
          style={[styles.input, { borderColor: hasError ? theme.palette.red['600'] : 'transparent' }]}
        />
      );
    },
    [hasError, theme.dark]
  );

  return <View style={styles.container}>{inputs.map(_renderInput)}</View>;
});

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    },
    input: {
      width: 40,
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: base.white,
      padding: 0,
      ...BaseTextVariant.authSubTitle,
      ...shadow6Style
    }
  });
};

export default OtpInput;
