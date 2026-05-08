import React, { FC, Dispatch, SetStateAction, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { TextStyle, TouchableOpacity, View } from 'react-native';
import { BaseText, BaseTextVariant, SheetBackdrop } from '@/components';
import { StyleSheet, ViewStyle } from 'react-native';
import { testIDs, UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';

interface CreatePositionProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onSelect: (orderType: string) => void;
  orderType: string;
  entry?: boolean;
}

const OrderTypeSelector: FC<CreatePositionProps> = ({ setVisible, visible, onSelect, orderType, entry }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { palette } = theme;

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }
    onEntryButtonPress();
  }, [visible]);

  const onEntryButtonPress = useCallback(() => {
    BottomSheetRef.current?.[sheetState.current ? 'dismiss' : 'present']();
  }, []);

  const onClose = useCallback(() => {
    sheetState.current = false;
    setVisible(false);
  }, []);

  const onAnimate = useCallback(() => (sheetState.current = true), []);

  const list = useMemo(() => {
    return [
      {
        key: 'market_order',
        title: t('screens.create-position.market-order'),
        buy_subTitle: t('screens.create-position.market-order-buy-subtitle'),
        sell_subTitle: t('screens.create-position.market-order-sell-subtitle'),
        icon: SvgXmlIconNames.lineChart
      },
      {
        key: 'pending_order',
        title: t('screens.create-position.pending-order'),
        buy_subTitle: t('screens.create-position.pending-order-buy-subtitle'),
        sell_subTitle: t('screens.create-position.pending-order-sell-subtitle'),
        icon: SvgXmlIconNames.lineChartUp
      }
    ];
  }, [t]);

  return (
    <BottomSheetModal
      ref={BottomSheetRef}
      keyboardBehavior='interactive'
      stackBehavior='push'
      keyboardBlurBehavior='restore'
      onAnimate={onAnimate}
      handleIndicatorStyle={styles.indicator}
      onDismiss={onClose}
      backgroundStyle={styles.sheetBgStyle}
      enablePanDownToClose
      snapPoints={[250]}
      backdropComponent={SheetBackdrop}
    >
      <View style={styles.sheetContainer}>
        <BaseText variant={BaseTextVariant.title}>{t('screens.portfolio.select-order-type')}</BaseText>
        {list.map((item) => {
          const isSelected = orderType === item.key;
          return (
            <TouchableOpacity
              testID={testIDs.components.templates.app.orderTypeSelector.button(item.key)}
              key={item.key}
              style={styles.option}
              onPress={() => {
                onSelect(item.key);
                onEntryButtonPress();
              }}
            >
              <View style={styles.horizontal}>
                <View style={styles.iconWrap}>
                  <SvgIcon
                    name={item.icon}
                    size={item.key === 'pending_order' ? IconSize.sm : IconSize.xsm}
                    color={palette.graphite['900']}
                  />
                </View>
                <View style={styles.textWrap}>
                  <BaseText style={styles.title}>{item.title}</BaseText>
                  <BaseText style={styles.subTitle}>{entry ? item.buy_subTitle : item.sell_subTitle}</BaseText>
                </View>
              </View>
              {isSelected ? (
                <View style={styles.checkIconWrap}>
                  <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xs} />
                </View>
              ) : (
                <View style={[styles.checkIconWrap, styles.checkIcon]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheetModal>
  );
};

interface Styles {
  sheetContainer: ViewStyle;
  sheetBgStyle: ViewStyle;
  checkIconWrap: ViewStyle;
  checkIcon: ViewStyle;
  option: ViewStyle;
  iconWrap: ViewStyle;
  horizontal: ViewStyle;
  textWrap: ViewStyle;
  title: TextStyle;
  subTitle: TextStyle;
  indicator: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, graphite, base, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    sheetContainer: {
      paddingTop: 12,
      paddingHorizontal: 20
    },
    sheetBgStyle: {
      backgroundColor: graphite['050']
    },
    checkIconWrap: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: purple['100']
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: base.white,
      marginTop: 12,
      borderRadius: 8,
      ...shadow6Style
    },
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: purple[100],
      marginRight: 12
    },
    checkIcon: {
      borderWidth: 1,
      backgroundColor: base.white,
      borderColor: '#8fa6ae'
    },
    horizontal: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    title: {
      fontWeight: '500',
      fontSize: 14,
      color: graphite['900']
    },
    subTitle: {
      fontSize: 13,
      color: '#4E5F64'
    },
    textWrap: {
      flex: 1
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    }
  });
};

export default OrderTypeSelector;
