import React, { FC, Dispatch, SetStateAction, useRef, useCallback, useLayoutEffect } from 'react';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { BackHandler, View, ActivityIndicator, Pressable, Text, TextStyle } from 'react-native';
import { BaseText, BaseTextVariant, SheetBackdrop } from '@/components';
import { StyleSheet, ViewStyle } from 'react-native';
import { testIDs, UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@gorhom/bottom-sheet';
import { actions } from '@/store';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { UserAccount } from '@/store/slices/wallet/types';

const {
  portfolio: { setSelectedAccount },
  wallet: { useGetTradingAccountsMutation }
} = actions;

interface CreatePositionProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  title?: string;
  onPress?: (item: UserAccount, index: number) => void;
  selectedAccountId: number | null;
}

interface AccountItemProps {
  onPress: () => void;
  data: UserAccount | undefined;
  index?: number;
  isSelected?: boolean;
  showChevronIcon?: boolean;
  testID?: string
}

const getAccountBorderColor = (index: number) => {
  if (index % 3 === 0) {
    return '#CC3DAB';
  }
  if (index % 3 === 1) {
    return '#EEDDFF';
  }
  if (index % 3 === 2) {
    return '#8050F1';
  }
};

export const AccountItem: FC<AccountItemProps> = ({ onPress, data, index, isSelected, showChevronIcon, testID }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      key={data?.login}
      style={[styles.accountsOption, { borderLeftColor: getAccountBorderColor(index || 0) }]}
    >
      <View testID={testID + '_optionRow'} style={styles.accountOptionRow}>
        <View testID={testID + '_optionLeftPart'} style={styles.accountsOptionLeftPart}>
          <BaseText testID={testID + '_login'} variant={BaseTextVariant.textSemiBold}>№{data?.login}</BaseText>
        </View>
        {showChevronIcon && <SvgIcon color={'#8fa6ae'} name={SvgXmlIconNames.chevronBottom} size={IconSize.xs} />}
        {isSelected && (
          <View testID={testID + '_selected_container'} style={styles.checkIconWrap}>
            <SvgIcon testID={testID + '_selected_icon'} name={SvgXmlIconNames.check} size={IconSize.xxs} />
          </View>
        )}
      </View>
      <View style={styles.accountOptionRow}>
        <View style={styles.accountsOptionLeftPart}>
          <BaseText testID={testID + '_option_marginFree'} variant={BaseTextVariant.extraSmall}>
            <Text style={styles.accountSum}>{t('screens.portfolio.available-to-invest')}:</Text> ${data?.marginFree}
          </BaseText>
        </View>
        <BaseText testID={testID + '_option_leverage'} variant={BaseTextVariant.extraSmall}>
          <Text style={styles.accountSum}>{t('screens.portfolio.leverage')}:</Text> {data?.leverage}
        </BaseText>
      </View>
    </Pressable>
  );
};

const AccountsList: FC<CreatePositionProps> = ({ setVisible, visible, title, onPress, selectedAccountId }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { t } = useTranslation();

  const [getTradingAccounts, tradingAccountsResponse] = useGetTradingAccountsMutation({});

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const BottomSheetRef = useRef<BottomSheet>(null);
  const sheetState = useRef<boolean>(false);
  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }
    getTradingAccounts();
    onEntryButtonPress();
  }, [visible]);

  useLayoutEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetState.current) BottomSheetRef.current?.close();
      else navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  const onEntryButtonPress = useCallback(() => {
    BottomSheetRef.current?.[sheetState.current ? 'expand' : 'collapse']();
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
    sheetState.current = false;
  }, []);
  const onOpen = useCallback(() => (sheetState.current = true), []);

  const Accounts = useCallback((): JSX.Element => {
    return (
      <>
        {tradingAccounts?.map((item, index) => {
          const handlePress = () => {
            if (onPress) {
              onPress(item, index);
            } else {
              dispatch(setSelectedAccount(parseInt(item.login)));
            }
            BottomSheetRef.current?.close();
          };

          return (
            <AccountItem
              data={item}
              key={index}
              index={index}
              onPress={handlePress}
              isSelected={parseInt(item.login) === selectedAccountId}
              testID={testIDs.components.templates.app.accountsList.accountItem(item.login)}
            />
          );
        })}
      </>
    );
  }, [tradingAccounts, selectedAccountId, onPress]);

  return (
    <BottomSheet
      ref={BottomSheetRef}
      index={-1}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      onChange={onOpen}
      onClose={onClose}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBgStyle}
      enablePanDownToClose
      snapPoints={[380]}
      backdropComponent={SheetBackdrop}
    >
      <View style={styles.sheetContainer}>
        <BaseText variant={BaseTextVariant.title}>{title || t('screens.portfolio.select-account')}</BaseText>
        {tradingAccountsResponse.isLoading ? (
          <ActivityIndicator color={graphite['900']} size={'small'} animating={true} />
        ) : (
          <Accounts />
        )}
      </View>
    </BottomSheet>
  );
};

interface Styles {
  sheetContainer: ViewStyle;
  sheetBgStyle: ViewStyle;
  accountsOption: ViewStyle;
  accountOptionRow: ViewStyle;
  accountsOptionLeftPart: ViewStyle;
  accountSum: TextStyle;
  checkIconWrap: ViewStyle;
  indicator: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, purple, graphite, icon }
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
    accountsOption: {
      borderLeftWidth: 8,
      paddingRight: 16,
      borderRadius: 8,
      paddingLeft: 16,
      paddingBottom: 12,
      marginTop: 12,
      backgroundColor: base.white,
      ...shadow6Style
    },
    accountOptionRow: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    accountsOptionLeftPart: {
      flex: 0.7
    },
    accountSum: {
      color: '#8fa6ae'
    },
    checkIconWrap: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: purple['100']
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    }
  });
};

export default AccountsList;
