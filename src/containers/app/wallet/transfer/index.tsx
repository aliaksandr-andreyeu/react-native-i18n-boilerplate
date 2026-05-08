import { BaseBackButton, BaseButton, BaseButtonType, BaseOptionList, BaseText, BaseTextVariant } from '@/components';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Keyboard, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import TransferAccount from '@/components/atoms/transfer-account';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import getCurrency, { Currencies } from '@/helpers/currency';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { useCheckTransferMutation, useGetAccountsMutation, useTransferMutation } from '@/store/api';
import { NewTransfer, UserAccount } from '@/store/slices/wallet/types';
import { useAppDispatch, useAppSelector, useCallAccountWallets, useCommonStyles } from '@/hooks';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { actions } from '@/store';
import { FlatList } from 'react-native-gesture-handler';
import { getAccountColor, getAccountName } from '@/helpers/accounts';
import { useTranslation } from 'react-i18next';
import { BaseError } from '@/store/slices';
import { formatTwoDecimals } from '@/helpers';

type TransferScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Transfer>;
type Scopes = 'transferFrom' | 'transferTo';
type Categories = 'live' | 'wallet' | 'cashback_wallet' | 'ib_wallet';

interface AccountBody {
  category: Categories;
  scope: Scopes;
}

const { isIOS } = config;

const {
  application: { openModal: openPopUp }
} = actions;

let timeout: NodeJS.Timeout;
let transferTimeout: NodeJS.Timeout;
const TransferScreen: React.FC<TransferScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState<string>();
  const [error, setError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Record<Scopes, UserAccount[]>>({
    transferFrom: [],
    transferTo: []
  });
  const [listSelected, setListSelected] = useState<Record<Scopes, string>>({
    transferFrom: '',
    transferTo: ''
  });
  const [selectedAccounts, setSelectedAccounts] = useState<Record<Scopes, string>>({
    transferFrom: '',
    transferTo: ''
  });
  const [minimum, setMinimum] = useState<number>();

  const [trigger, setTrigger] = useState<boolean>(false);
  const lastAmount = useRef<string>();
  const bottomSheetRef = useRef<IBaseOptionList>(null);
  const lastSelectedAccount = useRef<string>('');
  const lastOpenedField = useRef<Scopes>('transferFrom');
  const canSelect = useRef<boolean>(true);
  const lastTransferCheck = useRef({ abort: () => {} });
  const scrollViewRef = useRef<ScrollView>(null);

  const wallet = useAppSelector((state) => state.wallet);
  const { accountConfigs = [] } = wallet || {};

  const config = useAppSelector((state) => state.common.config);
  const { trading: tradingAccounts, cashback: chachbackTypeId } = config || {};
  const { walletTypeIds, accountTypeIds } = tradingAccounts || {};

  const liveAccountTypeIds = useMemo(() => accountTypeIds, [accountTypeIds]);
  const walletTypeId = walletTypeIds.find((el) => el);

  const { t } = useTranslation();
  const theme = useTheme();
  const { palette } = theme;
  const styles = useStyles(theme);

  const dispatch = useAppDispatch();

  const callWallets = useCallAccountWallets();
  const [getAccounts] = useGetAccountsMutation();
  const [transfer, { isLoading: isTransferLoading }] = useTransferMutation();
  const [checkTransfer, { error: checkError, isError: hasCheckError, isLoading: isChecking }] =
    useCheckTransferMutation();

  const showPopUp = useCallback(
    ({ title = '', subTitle, button, secondaryButton, closeTime, icon, iconSize }: Partial<DefaultModalConfig>) => {
      dispatch(
        openPopUp({
          title,
          subTitle,
          icon,
          iconSize,
          button,
          secondaryButton,
          closeTime
        })
      );
    },
    []
  );

  const createWallet = (args: AccountBody) => getAccounts(args).unwrap;

  const getWallets = async () => {
    if (accountConfigs?.length === 0) {
      return;
    }
    try {
      setLoading(true);
      const categories: Categories[] = ['wallet', 'cashback_wallet', 'ib_wallet', 'live'];
      const scopes: Scopes[] = ['transferFrom', 'transferTo'];
      const wallets = [];
      for (let i = 0; i < scopes.length; i++) {
        const scope = scopes[i];
        for (let j = 0; j < categories.length; j++) {
          const category = categories[j];
          const walletCaller = createWallet({ category, scope });
          wallets.push(walletCaller);
        }
      }
      const responses = await Promise.all(wallets);

      const res: Record<Scopes, UserAccount[]> = { transferFrom: [], transferTo: [] };

      let firstLiveAccount: any = null;

      const mappedConfigs = new Map(accountConfigs.map((item) => [`${item.systemTypeId}`, item]));

      const transformer = (item: UserAccount, isFrom: boolean, isLive: boolean) => {
        const accountConfig = mappedConfigs.get(`${item.typeId}`);
        const newItem = {
          ...item,
          ...(!!accountConfig && accountConfig)
        };

        if (isLive && !firstLiveAccount) firstLiveAccount = newItem;
        if (isFrom) res.transferFrom.push(newItem);
        else res.transferTo.push(newItem);
      };

      await new Promise(async (res): Promise<any> => {
        for (let r = 0; r < responses?.length; r++) {
          const req = responses[r];
          const response: UserAccount[] = await req();

          const filteredResponse = response.filter((el) => {
            const { typeId, type } = el || {};
            const { category } = type || {};

            if (category !== 'wallet' && category !== 'live' && category !== 'cashback_wallet') {
              return true;
            } else if (
              (category === 'wallet' && typeId === walletTypeId) ||
              (category === 'live' && liveAccountTypeIds.includes(typeId)) ||
              (category === 'cashback_wallet' && typeId === chachbackTypeId)
            ) {
              return true;
            }
            return false;
          });

          for (let a = 0; a < filteredResponse?.length; a++) {
            const ua = filteredResponse[a];
            transformer(ua, r <= 3, r >= 7);
          }
        }
        res('');
      });

      const firstFrom = res.transferFrom[0]?.loginSid;
      const firstTo = firstLiveAccount?.loginSid || res.transferTo[0]?.loginSid;

      const body: NewTransfer = {
        amount: 0,
        // currency: res.transferFrom?.[0]?.currency || 'USD',
        fromLoginSid: firstFrom,
        toLoginSid: firstTo
      };
      await checkTransfer(body);
      setSelectedAccounts({ transferFrom: firstFrom, transferTo: firstTo });
      setAccounts(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      scrollViewRef.current?.scrollToEnd();
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    getWallets();
  }, [accountConfigs]);

  const selectedTransfers = useMemo((): { from: Partial<UserAccount>; to: Partial<UserAccount> } => {
    const from = accounts.transferFrom.find((item) => item.loginSid === selectedAccounts.transferFrom) || {};
    const to = accounts.transferTo.find((item) => item.loginSid === selectedAccounts.transferTo) || {};

    return {
      from,
      to
    };
  }, [selectedAccounts, accounts]);

  const accountFromName = useMemo(() => {
    return (
      selectedTransfers?.from?.typeDisplayName ||
      getAccountName(selectedTransfers.from?.type?.title, selectedTransfers.from?.type?.title || '')
    );
  }, [selectedTransfers.from?.type?.title, selectedTransfers?.from?.typeDisplayName]);

  const accountToName = useMemo(() => {
    return (
      selectedTransfers?.to?.typeDisplayName ||
      getAccountName(selectedTransfers.to?.type?.title, selectedTransfers.to?.type?.title || '')
    );
  }, [selectedTransfers?.to?.typeDisplayName, selectedTransfers.to?.type?.title]);

  const changeError = (field: string, value: string) => setError((prev) => ({ ...prev, [field]: value }));
  const changeListAccount = (field: Scopes | undefined, value: string) =>
    field && setListSelected((prev) => ({ ...prev, [field]: value }));
  const toggleTrigger = () => setTrigger((prev) => !prev);

  const checkTransferLimit = ({
    value,
    transferFrom = undefined,
    transferTo = undefined
  }: {
    value?: string;
    transferFrom: string | undefined;
    transferTo: string | undefined;
  }) => {
    try {
      lastTransferCheck.current.abort();
      const transferAmount = +(value || 0);
      const body: NewTransfer = {
        amount: transferAmount,
        // currency: selectedTransfers.from?.currency || 'USD',
        fromLoginSid: transferFrom || selectedAccounts.transferFrom,
        toLoginSid: transferTo || selectedAccounts.transferTo
      };
      lastTransferCheck.current = checkTransfer(body);
    } catch (error) {
      console.log(error);
    }
  };

  const onAmountChange = useCallback(
    (val: string) => {
      if (error['amount']?.length > 0) changeError('amount', '');

      let newVal = val
        .replaceAll(',', '.')
        .replace(/[^\d.]/g, '')
        .trim();

      if (val === lastAmount.current) newVal = newVal.slice(0, -1);
      lastAmount.current = newVal;
      setAmount(newVal);
      if (!newVal?.length) return changeError('amount', '');
    },
    [error]
  );

  const openModal = (field: Scopes) => {
    lastOpenedField.current = field;
    toggleTrigger();
    bottomSheetRef.current?.open?.();
  };

  const open = (field: Scopes) => () => {
    lastSelectedAccount.current = selectedAccounts[field];
    if (!canSelect.current) return;
    timeout && clearTimeout(timeout);
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      timeout = setTimeout(() => openModal(field), 350);
    } else openModal(field);
  };

  const Accounts = useCallback(
    ({
      selectedAccounts,
      trigger,
      listSelected,
      accounts
    }: {
      trigger: boolean;
      selectedAccounts: Record<Scopes, string>;
      listSelected: Record<Scopes, string>;
      accounts: Record<Scopes, UserAccount[]>;
    }) => {
      trigger;
      const isOpen = bottomSheetRef.current?.isOpen();

      const selected = (isOpen ? listSelected : selectedAccounts)[lastOpenedField.current || 'transferFrom'];
      const data: ArrayLike<UserAccount> = accounts[lastOpenedField.current || 'transferFrom'];

      const _keyExtractor = ({ item, index }: any) => `${item?.loginSid}-${index}-${Math.random()}-item`;

      return (
        <FlatList
          data={data}
          keyExtractor={_keyExtractor}
          contentContainerStyle={{
            gap: 12,
            paddingTop: 6,
            paddingBottom: !!selected?.length ? 42 : 10
          }}
          renderItem={({ item }) => {
            const acc = item as UserAccount;
            const id = acc.loginSid;
            const onPress = () => {
              lastSelectedAccount.current = id;
              changeListAccount(lastOpenedField.current, id);
            };

            return (
              <TransferAccount
                balance={getCurrency((acc.currency as Currencies) || 'USD').text(acc.availableForWithdrawal)}
                color={item.colour || getAccountColor(acc.type.category, theme, acc.typeId)}
                onPress={onPress}
                title={item.typeDisplayName || getAccountName(acc.type.title, acc.type.title || '')}
                selectable
                isSelected={selected === id}
              />
            );
          }}
        />
      );
    },
    [theme.dark]
  );

  const onContinue = useCallback(() => (canSelect.current = false), []);

  const onSelect = useCallback(() => {
    lastTransferCheck.current.abort();

    setSelectedAccounts((prev) => {
      const checkBody = {
        value: '0',
        ...prev,
        [lastOpenedField.current]: lastSelectedAccount.current
      };
      checkTransferLimit(checkBody);
      return {
        ...prev,
        [lastOpenedField.current]: lastSelectedAccount.current
      };
    });

    toggleTrigger();
    canSelect.current = true;
  }, []);

  const maxLimitError = useMemo(() => {
    const value = Number(selectedTransfers.from?.availableForWithdrawal) || 0;

    const selectedCurrency = (selectedTransfers.from.currency as Currencies) || 'USD';
    const currency = getCurrency(selectedCurrency);

    const transferAmount = +(amount || 0);
    if (isChecking || loading) return false;

    if ((selectedTransfers.from?.availableForWithdrawal && value === 0) || transferAmount > value) {
      const amountValue = currency.text(value);
      changeError(
        'amount',
        t('screens.transfer.available-transfer-amount', { amount: formatTwoDecimals(amountValue) })
      );
      return true;
    } else if (!['', undefined].includes(amount) && minimum !== undefined && transferAmount < minimum) {
      const amountValue = currency.text(minimum);
      changeError('amount', t('screens.transfer.min-transfer-amount', { amount: formatTwoDecimals(amountValue) }));
      return true;
    }
    changeError('amount', '');
    return false;
  }, [selectedTransfers.from, selectedTransfers.to, amount, minimum, loading, isChecking, t]);

  useEffect(() => {
    if (hasCheckError) {
      const baseError = checkError as BaseError;
      const errorText = baseError?.data?.errors?.children?.amount?.errors?.[0] || '';
      if (errorText && errorText.includes('Minimum')) setMinimum(+(errorText?.match?.(/-?\d*\.?\d+/g)?.join('') || ''));
    }
  }, [checkError, hasCheckError]);

  const infoText = useMemo(() => {
    if (isChecking || loading) return '...';
    const maxAvailable = +(selectedTransfers.from?.availableForWithdrawal || 0);

    const minValueAvailable = minimum !== undefined && +(maxAvailable || 0) !== 0;
    const maxValueAvailable = maxAvailable && +maxAvailable >= +(minimum || 0);

    const maxLimit = getCurrency((selectedTransfers.from?.currency as Currencies) || 'USD').text(
      formatTwoDecimals(maxAvailable)
    );
    const minLimit = getCurrency((selectedTransfers.from?.currency as Currencies) || 'USD').text(
      formatTwoDecimals(minimum)
    );
    if (!minValueAvailable && !maxValueAvailable) return t('screens.deposit.any-amount');
    else if (maxValueAvailable && !minValueAvailable) return t('screens.deposit.any-amount-to', { max: maxLimit });
    else if (!maxValueAvailable && minValueAvailable) return t('screens.deposit.any-amount-from', { min: minLimit });
    else return t('screens.deposit.any-amount-from-to', { min: minLimit, max: maxLimit });
  }, [selectedTransfers.from, selectedTransfers.to, minimum, loading, isChecking, t]);

  const isDisabled = useMemo(() => {
    const value = +(selectedTransfers.from.availableForWithdrawal || 0);
    if (isChecking || isTransferLoading || loading || value === 0 || +(amount || 0) === 0) return true;
    const errorValues = Object.values(error);
    const hasError = errorValues.some((item) => item?.length > 0);

    if (hasError) return true;

    return false;
  }, [error, loading, selectedTransfers.from.availableForWithdrawal, amount, isTransferLoading, isChecking]);

  const sameWalletError = useMemo(() => {
    if (!(selectedAccounts.transferFrom?.length > 0 && selectedAccounts.transferTo?.length > 0)) return false;
    if (selectedAccounts.transferFrom === selectedAccounts.transferTo) {
      changeError('same-wallets', 'true');
      return true;
    } else {
      changeError('same-wallets', '');
      return false;
    }
  }, [selectedAccounts]);

  const onTransfer = useCallback(async () => {
    try {
      transferTimeout && clearTimeout(transferTimeout);
      const transferAmount = +(amount || 0);
      if (!transferAmount || isTransferLoading || isChecking || (minimum !== undefined && transferAmount < minimum))
        return;
      const sendData = async () => {
        try {
          const body: NewTransfer = {
            amount: transferAmount,
            // currency: selectedTransfers.from?.currency || 'USD', //TODO: disabled because of API response.
            fromLoginSid: selectedAccounts.transferFrom,
            toLoginSid: selectedAccounts.transferTo
          };

          await checkTransfer(body).unwrap();

          const res = await transfer(body).unwrap();
          if (navigation.isFocused() && navigation.canGoBack()) {
            setTimeout(() => {
              if (res?.status === 'approved') {
                showPopUp({
                  title: t('screens.transfer.transfer-success'),
                  subTitle: t('screens.transfer.transfer-info', { from: accountFromName, to: accountToName }),
                  closeTime: 5,
                  icon: images.depositSuccess,
                  iconSize: {
                    width: 96,
                    height: 90
                  }
                });
              } else {
                showPopUp({
                  title: t('errors.modal-error-title'),
                  subTitle: t('errors.wait-a-moment'),
                  closeTime: 5,
                  icon: images.depositError,
                  iconSize: {
                    width: 96,
                    height: 90
                  }
                });
              }
            }, 375);
            await callWallets();
            navigation.goBack();
          }
        } catch (error: any) {
          const errorText = error?.data?.errors?.children?.amount?.errors?.[0];

          if (errorText) return changeError('amount', errorText);

          const waitError = error?.data?.errors?.children?.fromLoginSid?.errors?.[0];

          if (navigation.isFocused() && navigation.canGoBack()) {
            setTimeout(() => {
              showPopUp({
                title: t('errors.modal-error-title'),
                subTitle: waitError || t('errors.wait-a-moment'),
                closeTime: 5,
                icon: images.depositError,
                iconSize: {
                  width: 96,
                  height: 90
                }
              });
            }, 375);
            await callWallets();
            navigation.goBack();
          }

        }
        console.error(error);

      };

      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        transferTimeout = setTimeout(sendData, 350);
      } else sendData();
    } catch (error) {
      console.log(error);
    }
  }, [selectedAccounts, amount, selectedTransfers.from, isTransferLoading, t, isChecking]);

  return (
    <SafeAreaView style={styles.container}>
      <BaseBackButton isChevron={false} />
      <BaseText style={styles.title} variant={BaseTextVariant.title}>
        {t('screens.transfer.transfer-money')}
      </BaseText>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.avoidView}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.accounts}>
            <TransferAccount
              balance={
                selectedTransfers.from?.availableForWithdrawal &&
                selectedTransfers.from?.availableForWithdrawal?.length > 0
                  ? getCurrency((selectedTransfers.from?.currency as Currencies) || 'USD').text(
                      formatTwoDecimals(selectedTransfers.from?.availableForWithdrawal) || ''
                    )
                  : ''
              }
              color={
                selectedTransfers.from?.colour ||
                getAccountColor(selectedTransfers.from?.type?.category || '', theme, selectedTransfers?.from?.typeId)
              }
              disable={loading || isTransferLoading}
              onPress={open('transferFrom')}
              title={loading ? '...' : accountFromName}
              isDropDown
            />
            <View style={styles.iconContainer}>
              <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
            </View>
            <TransferAccount
              onPress={open('transferTo')}
              balance={
                selectedTransfers.to?.availableForWithdrawal && selectedTransfers.to?.availableForWithdrawal?.length > 0
                  ? getCurrency((selectedTransfers.to?.currency as Currencies) || 'USD').text(
                      formatTwoDecimals(selectedTransfers.to?.availableForWithdrawal) || ''
                    )
                  : ''
              }
              color={
                selectedTransfers.to?.colour ||
                getAccountColor(selectedTransfers.to?.type?.category || '', theme, selectedTransfers?.to?.typeId)
              }
              disable={loading || isTransferLoading}
              title={loading ? '...' : accountToName}
              isDropDown
            />
          </View>
          {sameWalletError && (
            <Animated.View style={styles.limit}>
              <BaseText variant={BaseTextVariant.small} style={styles.error}>
                {t('screens.transfer.should-not-be-same')}
              </BaseText>
            </Animated.View>
          )}
          <View style={styles.middle}>
            <Animated.View layout={CurvedTransition} style={styles.card}>
              <View style={styles.top}>
                <View style={styles.horizontal}>
                  <SvgIcon name={SvgXmlIconNames.bankCard} />
                  <BaseText style={styles.currency}>{selectedTransfers.from?.currency || 'USD'}</BaseText>
                </View>
                <View style={styles.inputContainerStyle}>
                  <TextInput
                    value={`${
                      amount
                        ? `${getCurrency((selectedTransfers.from?.currency as Currencies) || 'USD').text(amount)}`
                        : ''
                    }`}
                    selectionColor={palette.purple[300]}
                    keyboardType='numeric'
                    onChangeText={onAmountChange}
                    cursorColor={palette.purple[300]}
                    textAlign='right'
                    style={styles.input}
                    placeholder={'$0.00'}
                    placeholderTextColor={'#8fa6ae'}
                  />
                </View>
              </View>
              <View style={styles.bottom}>
                <Animated.View layout={CurvedTransition}>
                  <BaseText variant={BaseTextVariant.authSmall}>{t('screens.transfer.enter-amount')}</BaseText>
                </Animated.View>
              </View>
            </Animated.View>
            <Animated.View layout={CurvedTransition} style={styles.limit}>
              <BaseText variant={BaseTextVariant.small} style={[styles.info, maxLimitError && styles.error]}>
                {error?.['amount'] || infoText}
              </BaseText>
            </Animated.View>
          </View>
        </ScrollView>
        <View>
          {isTransferLoading || isChecking ? (
            <ActivityIndicator style={styles.indicator} size={'small'} color={palette.graphite['900']} />
          ) : (
            <BaseButton
              style={styles.button}
              disabled={isDisabled}
              type={BaseButtonType.primary}
              label={t('screens.transfer.transfer')}
              onPress={onTransfer}
            />
          )}
          <BaseText style={[styles.grayText, styles.secured]} variant={BaseTextVariant.small}>
            {t('screens.common.fully-secured')}
          </BaseText>
        </View>
      </KeyboardAvoidingView>
      <BaseOptionList
        title='Select account'
        renderContent={
          <Accounts
            trigger={trigger}
            selectedAccounts={selectedAccounts}
            listSelected={listSelected}
            accounts={accounts}
          />
        }
        onSelect={onSelect}
        onContinue={onContinue}
        selected={!!listSelected[lastOpenedField.current || 'transferFrom']}
        hasSearch={false}
        ref={bottomSheetRef}
      />
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { base, graphite, red } = palette || {};

  const { shadow0Style, shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      flex: 1
    },
    title: {
      marginLeft: 20,
      marginVertical: 12
    },
    button: {
      marginHorizontal: 20,
      marginBottom: 12
    },
    avoidView: {
      flex: 1
    },
    currency: {
      marginLeft: 4
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    inputContainerStyle: {
      flex: 1,
      borderWidth: 0,
      alignItems: 'flex-end',
      marginLeft: 10,
      ...shadow0Style
    },
    card: {
      padding: 16,
      gap: 12,
      marginTop: 44,
      backgroundColor: base.white,
      borderRadius: 12,
      marginHorizontal: 20,
      zIndex: 0,
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },

    input: {
      ...BaseTextVariant.captionSemiBold,
      color: graphite['900'],
      margin: 0,
      padding: 0,
      width: '100%'
    },

    bottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    grayText: {
      color: '#5D7278'
    },
    secured: {
      alignSelf: 'center',
      marginBottom: 20,
      marginTop: 4
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5ff',
      position: 'absolute',
      alignSelf: 'center',
      marginTop: 51,
      zIndex: 2,
      transform: [{ rotate: '-90deg' }]
    },
    accounts: {
      gap: 12,
      marginTop: 12
    },

    middle: {
      flex: 1,
      marginBottom: 15
    },
    info: {
      color: '#5D7278',
      textAlign: 'left'
    },
    error: {
      color: red['600']
    },
    limit: {
      marginHorizontal: 20,
      marginTop: 8
    },
    indicator: {
      marginBottom: 20
    }
  });
};

export default TransferScreen;
