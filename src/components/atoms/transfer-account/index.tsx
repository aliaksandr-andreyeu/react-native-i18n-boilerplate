import { config, UserTheme } from '@/constants';
import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewProps } from 'react-native';
import BaseText, { BaseTextVariant } from '../text';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import Animated, { CurvedTransition, FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { formatTwoDecimals } from '@/helpers';

export enum TYPE_TRANSFER_ACCOUNT {
  transfer = 'transfer',
  redeem = 'redeem'
}

interface IBaseTransferAccount extends ViewProps {
  isDropDown?: boolean;
  selectable?: boolean;
  balance: string;
  title: string;
  color: string;
  isSelected?: boolean;
  onPress?(): void;
  disable?: boolean;
  type?: TYPE_TRANSFER_ACCOUNT;
  category?: string;
}

const {
  headerBar: {
    buttons: { activeOpacity }
  }
} = config;
const BaseTransferAccount: React.FC<IBaseTransferAccount> = ({
  isDropDown = false,
  selectable = false,
  balance = 0,
  title = '',
  color,
  isSelected = false,
  onPress,
  disable,
  type = TYPE_TRANSFER_ACCOUNT.transfer,
  style
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const styleContainer = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.transfer:
        return styles.container;
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return styles.containerRedeem;
    }
  };

  const styleRight = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.transfer:
        return styles.right;
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return styles.rightRedeem;
    }
  };

  const styleRightTop = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.transfer:
        return styles.rightTop;
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return styles.rightTopRedeem;
    }
  };

  const styleTitle = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return styles.titleRedeem;
    }
  };

  const styleBalance = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return styles.balanceRedeem;
    }
  };

  const variantTitle = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.transfer:
        return BaseTextVariant.text;
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return BaseTextVariant.textSemiBold;
    }
  };

  const variantBalance = () => {
    switch (type) {
      case TYPE_TRANSFER_ACCOUNT.transfer:
        return BaseTextVariant.tiny;
      case TYPE_TRANSFER_ACCOUNT.redeem:
        return BaseTextVariant.rewardExtraSmall;
    }
  };

  const variantIcon = () => {
    if (title.toLocaleLowerCase().includes('islamic')) {
      return SvgXmlIconNames.halfMoon;
    } else if (title.toLocaleLowerCase().includes('prime')) {
      return SvgXmlIconNames.primeWallet;
    } else if (title.toLocaleLowerCase().includes('bonus wallet')) {
      return SvgXmlIconNames.bonusWallet;
    } else {
      return SvgXmlIconNames.mainWallet;
    }
  };

  return (
    <TouchableOpacity
      testID='transfer-account-touchable'
      disabled={disable}
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styleContainer(), { borderLeftColor: color }, style]}
    >
      <View style={styleRight()}>
        <View style={styleRightTop()}>
          {type === TYPE_TRANSFER_ACCOUNT.redeem && (
            <Animated.View
              layout={CurvedTransition}
              key={`${title}-icon`}
              entering={selectable ? undefined : FadeInUp}
              exiting={selectable ? undefined : FadeOutDown}
            >
              <SvgIcon name={variantIcon()} size={IconSize.xsm} color={color} />
            </Animated.View>
          )}
          <Animated.View
            testID='transfer-account-title'
            key={`${title}-title`}
            entering={selectable ? undefined : FadeInUp}
            exiting={selectable ? undefined : FadeOutDown}
            style={styleTitle()}
          >
            <BaseText
              style={type === TYPE_TRANSFER_ACCOUNT.redeem && styles.secondaryColor}
              variant={variantTitle()}
              numberOfLines={1}
            >
              {title}
            </BaseText>
          </Animated.View>
          {isDropDown ? (
            <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} />
          ) : (
            (selectable && isSelected && (
              <View testID='transfer-account-checkmark' style={styles.check}>
                <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xxs} />
              </View>
            )) ||
            null
          )}
        </View>
        <Animated.View
          layout={CurvedTransition}
          key={`${balance}-balance`}
          testID='transfer-account-balance'
          entering={selectable ? undefined : FadeInUp}
          exiting={selectable ? undefined : FadeOutDown}
          style={styleBalance()}
        >
          <BaseText variant={variantBalance()}>{formatTwoDecimals(balance)}</BaseText>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, purple, text }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      marginHorizontal: 20,
      borderLeftWidth: 6,
      backgroundColor: base.white,
      height: 69,
      flexDirection: 'row',
      ...shadow6Style
    },
    disableColor: {
      backgroundColor: '#D9DDE566'
    },
    containerRedeem: {
      backgroundColor: base.white,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      flexDirection: 'row',
      overflow: 'hidden',
      width: 132,
      borderColor: '#58616C'
    },
    titleRedeem: {
      flex: 1,
      alignItems: 'flex-start'
    },
    check: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: purple['100']
    },
    right: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flex: 1,
      gap: 12
    },
    rightRedeem: {
      flex: 1,
      gap: 2
    },
    rightTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    rightTopRedeem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4
    },
    balanceRedeem: {
      paddingLeft: 18
    },
    grayText: {
      color: '#8fa6ae'
    },
    secondaryColor: {
      color: text.base.secondary
    }
  });
};

export default memo(BaseTransferAccount);
