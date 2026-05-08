import React, { FC, useMemo, ReactNode } from 'react';
import { StyleSheet, Pressable, ViewStyle, ViewProps, TextStyle, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import { useCommonStyles } from '@/hooks';

export enum BaseToastVariant {
  success = 'success',
  error = 'error',
  info = 'info',
  regular = 'regular'
}

interface BaseToastProps extends ViewProps {
  variant?: BaseToastVariant;
  title?: string;
  titleIcon?: ReactNode;
  desc?: string;
  descIcon?: ReactNode;
  titleStyle?: TextStyle;
  descStyle?: TextStyle;
  center?: boolean;
}

const BaseToast: FC<BaseToastProps> = ({
  variant = BaseToastVariant.info,
  title = '',
  titleIcon,
  desc = '',
  descIcon,
  style,
  titleStyle,
  descStyle,
  center = false
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const containerStyle = useMemo(() => {
    switch (variant) {
      case BaseToastVariant.success:
        return styles.success;
      case BaseToastVariant.error:
        return styles.error;
      case BaseToastVariant.info:
        return styles.info;
      case BaseToastVariant.regular:
        return styles.regular;
      default:
        return;
    }
  }, [styles, variant]);

  if (!title && !desc) {
    return null;
  }

  return (
    <Pressable style={[styles.container, center && styles.centerContainer, containerStyle, style]}>
      {title ? (
        <View style={styles.row}>
          {titleIcon ? titleIcon : null}
          <BaseText variant={BaseTextVariant.textSemiBold} style={titleStyle}>
            {title}
          </BaseText>
        </View>
      ) : null}
      {desc ? (
        <View style={styles.row}>
          {descIcon ? descIcon : null}
          <BaseText variant={BaseTextVariant.small} style={descStyle}>
            {desc}
          </BaseText>
        </View>
      ) : null}
    </Pressable>
  );
};

interface Styles {
  container: ViewStyle;
  success: ViewStyle;
  error: ViewStyle;
  info: ViewStyle;
  regular: ViewStyle;
  centerContainer: ViewStyle;
  row: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { base, background, border } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      backgroundColor: base.white,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderColor: base.black,
      gap: 8,
      padding: 16,
      width: '100%',
      ...shadow6Style
    },
    success: {
      backgroundColor: background.tag.base.positive,
      borderColor: border.base.positive.strong
    },
    error: {
      backgroundColor: background.tag.base.negative,
      borderColor: border.base.negative
    },
    info: {
      backgroundColor: background.interaction.context.rewards.subtle,
      borderColor: border.base['in-progress']
    },
    regular: {
      backgroundColor: background.card.primary,
      borderColor: border.interaction.input
    },
    centerContainer: {
      width: undefined,
      alignSelf: 'center'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    }
  });
};

export default BaseToast;
