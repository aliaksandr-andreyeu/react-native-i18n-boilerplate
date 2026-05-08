import React from 'react';
import { StyleSheet, ViewProps, ViewStyle, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';

interface BaseErrorMessageProps extends ViewProps {
  error: string;
}

const BaseErrorMessage = ({ style, error }: BaseErrorMessageProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  if (!error) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BaseText variant={BaseTextVariant.small}>{error}</BaseText>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
}

const useStyles = ({ palette: { red } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      borderWidth: 1,
      borderColor: red['600'],
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12
    }
  });

export default BaseErrorMessage;
