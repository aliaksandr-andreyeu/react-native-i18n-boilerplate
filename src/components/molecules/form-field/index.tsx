import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, View, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseInput } from '@/components';

interface BaseFormFieldProps extends TextInputProps {
  title?: string;
  label?: string;
  error?: string;
  inputContainerStyle?: ViewStyle;
  hideClearButton?: boolean;
  isBottomSheet?: boolean;
  required?: boolean;
  focusedBorderColor?: string;
  dropdown?: boolean;
  rightIcon?: ReactNode;
  enableButtonsAnimation?: boolean
  inputStyle?: ViewStyle;
}
const BaseFormField = ({ style, label, error, dropdown = false, inputStyle, ...rest }: BaseFormFieldProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const labelItem = useMemo(() => {
    if (!label) {
      return null;
    }
    return <BaseText style={styles.label}>{String(label)}</BaseText>;
  }, [styles, label]);

  const errorItem = useMemo(() => {
    if (!error) {
      return null;
    }
    return <BaseText style={styles.error}>{String(error)}</BaseText>;
  }, [styles, error]);

  return (
    <View style={[styles.container, style]}>
      {labelItem}
      <BaseInput dropdown={dropdown}  {...rest} error={Boolean(error)} />
      {errorItem}
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  error: TextStyle;
}

const useStyles = ({ palette: { graphite, red } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      width: '100%',
      marginBottom: 16
    },
    label: {
      fontSize: 14,
      color: graphite['900'],
      marginBottom: 8
    },
    error: {
      marginTop: 8,
      fontSize: 12,
      color: red['600']
    }
  });

export default BaseFormField;
