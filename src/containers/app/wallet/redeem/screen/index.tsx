import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransferAccount, { TYPE_TRANSFER_ACCOUNT } from '@/components/atoms/transfer-account';
import useStyles from './styles';
import { View, Keyboard, FlatList } from 'react-native';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { NewTransfer, UserAccount } from '@/store/slices/wallet/types';
import { useCheckTransferMutation, useGetAccountsMutation, useTransferMutation } from '@/store/api';
import getCurrency, { Currencies } from '@/helpers/currency';
import { getAccountColor, getAccountName } from '@/helpers/accounts';
import { formatTwoDecimals } from '@/helpers';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { useAppSelector } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { actions } from '@/store';
import {
  BaseText,
  BaseBackButton,
  BaseTextVariant,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseInput,
  BaseOptionList
} from '@/components';

const {
  application: { openModal: openPopUp }
} = actions;

interface AccountBody {
  category: Categories;
  scope: Scopes;
}

let timeout: NodeJS.Timeout;

type Scopes = 'transferFrom' | 'transferTo';
type Categories = 'live' | 'wallet' | 'cashback_wallet' | 'ib_wallet';

type RedeemScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.Redeem>;

const RedeemScreen: React.FC<RedeemScreenProps> = ({ route, navigation }) => {
  const [error, setError] = useState<string>('');
  const [amount, setAmount] = useState<string>('$0.00');
  const [loading, setLoading] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<boolean>(false);
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

  const bottomSheetRef = useRef<IBaseOptionList>(null);
  const lastTransferCheck = useRef({ abort: () => {} });

  const { t } = useTranslation();

  const config = useAppSelector((state) => state.common.config);
  const { trading: tradingAccounts, cashback: chachbackTypeId } = config || {};
  const { walletTypeIds, accountTypeIds } = tradingAccounts || {};

  const liveAccountTypeIds = useMemo(() => accountTypeIds, [accountTypeIds]);
  const walletTypeId = walletTypeIds.find((el) => el);

  const wallet = useAppSelector((state) => state.wallet);
  const { accountConfigs = [] } = wallet || {};
  const lastSelectedAccount = useRef<string>('');
  const canSelect = useRef<boolean>(true);
  const lastOpenedField = useRef<Scopes>('transferFrom');

  const [getAccounts] = useGetAccountsMutation();

  const [transfer, { isLoading: isTransferLoading }] = useTransferMutation();

  const [checkTransfer, { error: checkError, isError: hasCheckError, isLoading: isChecking }] =
    useCheckTransferMutation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const onPressRedeem = () => false;

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

  const onContinue = useCallback(() => (canSelect.current = false), []);

  const onInputChange = (value: string) => {
    setAmount(value);
    //Please enter a valid amount
  };

  const changeListAccount = (field: Scopes | undefined, value: string) =>
    field && setListSelected((prev) => ({ ...prev, [field]: value }));

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

  const toggleTrigger = () => setTrigger((prev) => !prev);

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

  useEffect(() => {
    getWallets();
  }, [accountConfigs]);

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
    [styles]
  );

  return (
    <SafeAreaView>
      <View style={styles.head}>
        <BaseBackButton isChevron={false} />
        <View style={styles.headerTitle}>
          <BaseText style={styles.primaryText} variant={BaseTextVariant.caption}>
            {t('screens.redeem.title')}
          </BaseText>
        </View>
      </View>
      <View style={styles.contentBox}>
        <BaseText style={[styles.primaryText, styles.title]} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.redeem.title')}
        </BaseText>
        <View style={styles.accounts}>
          <TransferAccount
            style={styles.box}
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
            disable={true}
            title={loading ? '...' : accountFromName}
            type={TYPE_TRANSFER_ACCOUNT.redeem}
          />
          <View style={styles.icon}>
            <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
          </View>
          <TransferAccount
            style={styles.box}
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
            type={TYPE_TRANSFER_ACCOUNT.redeem}
          />
        </View>
        <BaseText style={[styles.primaryText, styles.title]} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.redeem.amount')}
        </BaseText>
        <View style={styles.inputBox}>
          <BaseInput
            keyboardType='numeric'
            value={amount}
            error={!!error}
            onChange={onInputChange}
            inputContainerStyle={styles.inputContainer}
            style={styles.input}
            hideClearButton
          />
          {!!error?.length && (
            <BaseText variant={BaseTextVariant.extraSmall} style={styles.errorText}>
              {error}
            </BaseText>
          )}
        </View>
        <BaseButton
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          label={t('screens.redeem.title')}
          style={styles.button}
          labelStyle={styles.primaryText}
          onPress={onPressRedeem}
        />
        <BaseText style={[styles.tertiaryText, styles.description]} variant={BaseTextVariant.extraSmall}>
          {t('screens.redeem.transactions-secured')}
        </BaseText>
      </View>
      <BaseOptionList
        title={t('screens.redeem.select-account')}
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

export default RedeemScreen;
