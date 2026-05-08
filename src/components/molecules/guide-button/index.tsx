import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { UserTheme, config, testIDs } from '@/constants';
import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacityProps, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCommonStyles } from '@/hooks';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { BaseTextVariantValue } from '@/components/atoms/text';

interface IBaseGuideButton extends TouchableOpacityProps {
  leftIcon?: SvgXmlIconNames;
  onPress?: TouchableOpacityProps['onPress'];
  title: string;
  rightIcon?: SvgXmlIconNames;
  containerStyle?: ViewStyle;
  rightIconColor?: string;
  hasRightIcon?: boolean;
  variant?: BaseTextVariantValue;
  leftIconColor?: string,
  testID?: string;
}

const {
  buttons: { activeOpacity }
} = config;

const BaseGuideButton: React.FC<IBaseGuideButton> = ({
  leftIcon,
  onPress,
  rightIcon,
  title,
  containerStyle,
  rightIconColor,
  hasRightIcon = true,
  variant = BaseTextVariant.titleXXS,
  leftIconColor,
  testID,
  ...rest
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.container, containerStyle]}
      testID={testID || testIDs.components.molecules.guideButton.container}
      {...rest}
    >
      <View style={styles.left}>
        <SvgIcon name={leftIcon || SvgXmlIconNames.glasses} size={IconSize.md} color={leftIconColor || theme.palette.purple[800]} />
        <BaseText variant={variant}>{title}</BaseText>
      </View>
      {hasRightIcon && <SvgIcon
        name={rightIcon || SvgXmlIconNames.questionCircle}
        size={IconSize.sm}
        color={rightIconColor || theme.palette.graphite['900']}
      />}
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: base.white,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadow6Style
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      marginRight: 40
    }
  });
};

export default memo(BaseGuideButton);
