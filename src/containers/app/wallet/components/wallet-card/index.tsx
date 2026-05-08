import React, { useCallback, useMemo, useState } from 'react';
import { ImageStyle, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme, testIDs } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseImage, BaseText, BaseTextVariant, SimpleCountDown } from '@/components';
import { useCommonStyles } from '@/hooks';
import { useTranslation } from 'react-i18next';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import { detectDateFormat, formatTwoDecimals } from '@/helpers';

interface MainWalletProps {
  title: string;
  amount: string;
  icon: SvgXmlIconNames | string;
  iconWrapColor?: string;
  iconColor?: string;
  onArrowPressed?: () => void;
  style?: ViewStyle;
  isTrading?: boolean;
  isDefault?: boolean;
  accountNumber?: string | number;
  onlyAccount?: boolean;
  marginLevel?: number;
  expire?: string | undefined;
  unbounded?: boolean;
  dynamicImage?: boolean;
  testID?: string;
}

const {
  components: {
    buttons: { hitSlop }
  }
} = config;

const WalletCard = ({
  title,
  amount,
  icon,
  iconWrapColor,
  iconColor,
  onArrowPressed,
  style,
  isTrading = false,
  isDefault = false,
  accountNumber,
  onlyAccount = false,
  marginLevel = 0,
  expire,
  unbounded = false,
  dynamicImage = false,
  testID
}: MainWalletProps) => {
  const [isLessThanADay, setIsLessThanADay] = useState<boolean>(false);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { palette } = theme;

  const hasExpire = useMemo(() => !!expire?.length, [expire]);

  const DefaultComponent = useCallback(() => {
    return (
      <View style={styles.defaultContainer}>
        <SvgIcon size={IconSize.xsm} name={SvgXmlIconNames.checkThin} color={theme.palette.base.white} />
        <BaseText style={styles.whiteText} variant={BaseTextVariant.extraSmall}>
          {t('screens.wallet.default')}
        </BaseText>
      </View>
    );
  }, [theme.dark, t]);

  const handledMargin = useMemo(() => {
    let sign = '+';
    if (marginLevel < 0) sign = '-';
    const absMargin = Math.abs(marginLevel).toFixed(2);
    return `${sign}${absMargin}%`;
  }, [marginLevel]);

  const until = useMemo(() => {
    if (!hasExpire) return 0;

    const format = detectDateFormat(expire);

    return dateHelper.diff(dayjs(), expire, format);
  }, [expire, hasExpire]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isTrading && styles.trading,
        isDefault && isTrading && !onlyAccount && styles.defaultTrading,
        style
      ]}
      activeOpacity={1}
      hitSlop={hitSlop}
      onPress={onArrowPressed}
      testID={testID || testIDs.wallet.screen.walletCard.container}
    >
      {isDefault && isTrading && !onlyAccount && <DefaultComponent />}
      <View style={[styles.topLeft, isTrading && styles.tradingPadding, isTrading && styles.tradingTop]}>
        <View style={[styles.svgWrap, { backgroundColor: iconWrapColor || palette.icon.base.strong }]}>
          {dynamicImage ? (
            <BaseImage source={{ uri: icon }} resizeMode='contain' style={styles.img} />
          ) : (
            <SvgIcon name={icon as SvgXmlIconNames} size={IconSize.md} color={iconColor} />
          )}
        </View>
        <View style={styles.textContainer}>
          <BaseText variant={BaseTextVariant.subTitleSemiBold} style={styles.title}>
            {title}
          </BaseText>
          <View style={styles.infoContainer}>
            {hasExpire && (
              <View style={styles.expireContainer}>
                <BaseText
                  style={isLessThanADay ? styles.redText : styles.grayText}
                  variant={BaseTextVariant.extraSmall}
                >
                  {t('components.simple-countdown.expires-in')}
                </BaseText>
                <SimpleCountDown onLessThanADay={setIsLessThanADay} lastDate={expire} until={until} />
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={[styles.row, isTrading && styles.tradingPadding]}>
        <BaseText
          style={styles.amount}
          variant={
            isTrading
              ? BaseTextVariant.amountSubTitle
              : unbounded
                ? BaseTextVariant.authSubTitle
                : BaseTextVariant.widgetTitle
          }
        >
          {formatTwoDecimals(amount)}
        </BaseText>
        {onArrowPressed && (
          <View style={[styles.arrowButton, isTrading && styles.tradingPadding]}>
            <View style={styles.arrowWrap}>
              <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.md} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface Styles {
  container: ViewStyle;
  svgWrap: ViewStyle;
  topLeft: ViewStyle;
  arrowWrap: ViewStyle;
  arrowButton: ViewStyle;
  row: ViewStyle;
  title: TextStyle;
  amount: TextStyle;
  defaultContainer: ViewStyle;
  whiteText: TextStyle;
  defaultTrading: ViewStyle;
  trading: ViewStyle;
  tradingPadding: ViewStyle;
  grayText: TextStyle;
  textContainer: ViewStyle;
  tradingTop: ViewStyle;
  marginContainer: ViewStyle;
  numberContainer: ViewStyle;
  margin: TextStyle;
  infoContainer: ViewStyle;
  redText: TextStyle;
  expireContainer: ViewStyle;
  img: ImageStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      height: '100%',
      backgroundColor: palette.base.white,
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 16,
      ...shadow6Style
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16
    },
    title: {
      fontWeight: '600',
      fontSize: 15,
      color: palette.graphite['900']
    },
    svgWrap: {
      padding: 7,
      borderRadius: 8,
      backgroundColor: palette.purple[800]
    },
    amount: {
      color: palette.graphite['900']
    },
    row: {
      marginTop: 42,
      paddingLeft: 16,
      paddingRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    arrowButton: {
      paddingHorizontal: 8
    },
    arrowWrap: {
      transform: [{ rotate: '135deg' }]
    },
    defaultTrading: {
      borderWidth: 1.5,
      borderColor: palette.graphite[900],
      borderTopRightRadius: 8,
      ...shadow6Style
    },
    defaultContainer: {
      backgroundColor: palette.graphite[900],
      borderBottomLeftRadius: 8,
      gap: 6,
      paddingVertical: 3,
      paddingRight: 6,
      paddingLeft: 8,
      position: 'absolute',
      top: 0,
      right: 0,
      alignItems: 'center',
      flexDirection: 'row',
      borderTopRightRadius: 4
    },
    whiteText: {
      color: palette.base.white
    },
    trading: {
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 16,
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: 'transparent'
    },
    tradingPadding: {
      paddingLeft: 0,
      paddingRight: 0
    },
    grayText: { color: palette.graphite['600'] },
    textContainer: {
      marginLeft: 8,
      gap: 4,
      flex: 1
    },
    tradingTop: { top: 4 },
    marginContainer: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      backgroundColor: '#BBF5C9', //TODO:FIX COLOR
      borderRadius: 4,
      alignSelf: 'flex-start'
    },
    numberContainer: {
      gap: 4,
      alignItems: 'flex-start'
    },
    margin: {
      color: palette.green[700]
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    redText: {
      color: palette.red['600']
    },
    expireContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    img: {
      width: 20,
      height: 20
    }
  });
};

export default WalletCard;
