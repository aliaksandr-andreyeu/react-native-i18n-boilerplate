import React, { FC, useCallback, useLayoutEffect, useState, useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { useAppSelector } from '@/hooks';
import RecentActivityDetailsScreen from './screen';
import { BaseLoader } from '@/components';
import { actions } from '@/store';
import { TransactionColumnTitle, TransferColumnTitle, HistoryDataItem } from '@/containers/app/wallet/recent-activity';
import { transactionsParser, transfersParser } from '@/helpers';

const {
  wallet: { useGetTransactionsMutation, useGetTransfersMutation }
} = actions;

type RecentActivityDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.RecentActivityDetails>;

export interface RecentActivityData extends HistoryDataItem {
  isTransfer?: boolean;
  isTrading?: boolean;
  isCashback?: boolean;
  isContest?: boolean;
  closeTime?: Date;
}

const RecentActivityDetails: FC<RecentActivityDetailsProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { activityId, id, isTransfer } = params || {};

  const [isLoading, setLoading] = useState<boolean>(Boolean(activityId));
  const [activityKey, setActivityKey] = useState<undefined | string>(undefined);
  const [activityData, setActivityData] = useState<undefined | HistoryDataItem>(undefined);

  const [getTransactionsKeys, transactionsKeysResponse] = useGetTransactionsMutation({});
  const [getTransactionsById, transactionsByIdResponse] = useGetTransactionsMutation({});

  const [getTransfersKeys, transfersKeysResponse] = useGetTransfersMutation({});
  const [getTransfersById, transfersByIdResponse] = useGetTransfersMutation({});

  const wallet = useAppSelector((state) => state.wallet);
  const { accounts, tradingAccounts, paymentMethods } = wallet || {};
  const { wallet: walletAccount, cashback: cashbackAccount, rewards: rewardsAccount } = accounts || {};

  const setInitialState = () => {
    setLoading(Boolean(activityId));
    setActivityKey(undefined);
    setActivityData(undefined);
  };

  const clearParams = () => {
    if (!activityId) {
      return;
    }
    navigation.setParams({
      activityId: undefined
    });
  };

  const goToIdeasHub = useCallback(() => {
    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const onGoBack = () => {
    if (!navigation.canGoBack()) {
      return goToIdeasHub();
    }
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      if (id || activityId || !navigation.isFocused()) {
        return;
      }
      onGoBack();
    }, [route, navigation, id, activityId])
  );

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
        clearParams();
      };
    }, [route, navigation])
  );

  const getActivityKeysHandler = async () => {
    if (activityKey || !activityId) {
      return;
    }

    const func = isTransfer ? getTransfersKeys : getTransactionsKeys;

    try {
      await func({
        limit: 1
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getActivityByIdHandler = async () => {
    if (!activityKey || !activityId) {
      return;
    }

    const func = isTransfer ? getTransfersById : getTransactionsById;

    try {
      await func({
        limit: 1,
        filtersField: activityKey,
        filtersValue: [activityId]
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getActivityKey = () => {
    if (activityKey || !activityId) {
      return;
    }

    const { data } = (isTransfer ? transfersKeysResponse : transactionsKeysResponse) || {};
    const { columns = [], rows = [] } = data || {};

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return;
    }

    const titleId = isTransfer ? TransferColumnTitle.id : TransactionColumnTitle.id;

    const idData = columns.filter((column) => column.title.toLowerCase() === titleId.toLowerCase());
    const id = idData.find((el) => el);
    const { key } = id || {};

    if (key === undefined) {
      return;
    }

    setActivityKey(key);
  };

  const checkActivityData = () => {
    const isPaymentMethods = Boolean(paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0);

    const { data, isLoading, isUninitialized } = (isTransfer ? transfersByIdResponse : transactionsByIdResponse) || {};
    const { columns = [], rows = [] } = data || {};

    if (!activityKey || !activityId || !isPaymentMethods || isLoading || isUninitialized) {
      return;
    }

    const func = isTransfer ? transfersParser : transactionsParser;

    const parsedData = func(columns, rows);
    const activityItem = parsedData.find((el) => el);

    const isData = Boolean(data && Object.keys(data) && Object.keys(data).length > 0);
    const isColumns = Boolean(columns && Array.isArray(columns) && columns.length > 0);
    const isRows = Boolean(rows && Array.isArray(rows) && rows.length > 0);
    const isParsedData = Boolean(parsedData && Array.isArray(parsedData) && parsedData.length > 0);
    const isActivity = Boolean(activityItem && Object.keys(activityItem) && Object.keys(activityItem).length > 0);

    if (!isData || !isColumns || !isRows || !isParsedData || !isActivity) {
      return onGoBack();
    }

    const { paymentSystem } = activityItem || {};
    const paymentMethodItem = paymentMethods.find((el) => el.systemName === paymentSystem);

    const { displayName, logo } = paymentMethodItem || {};

    let modifiedActivityItem = {
      ...(activityItem as HistoryDataItem),
      ...(logo && { logo }),
      ...(displayName && { paymentSystem: displayName })
    };

    if (isTransfer) {
      let { fromAccount, toAccount } = modifiedActivityItem || {};

      const { loginSid: walletLoginSid } = walletAccount || {};
      const { loginSid: cashbackLoginSid } = cashbackAccount || {};
      const { loginSid: rewardsLoginSid } = rewardsAccount || {};

      const fromTradingLogin = tradingAccounts.find((el) => el.loginSid === fromAccount?.toLowerCase());
      const toTradingLogin = tradingAccounts.find((el) => el.loginSid === toAccount?.toLowerCase());

      if (fromTradingLogin) {
        fromAccount = 'live';
      }

      if (toTradingLogin) {
        toAccount = 'live';
      }

      switch (fromAccount) {
        case walletLoginSid:
          fromAccount = 'wallet';
          break;
        case cashbackLoginSid:
          fromAccount = 'cashback';
          break;
        case rewardsLoginSid:
          fromAccount = 'ib';
          break;
      }

      switch (toAccount) {
        case walletLoginSid:
          toAccount = 'wallet';
          break;
        case cashbackLoginSid:
          toAccount = 'cashback';
          break;
        case rewardsLoginSid:
          toAccount = 'ib';
          break;
      }

      modifiedActivityItem = {
        ...modifiedActivityItem,
        fromAccount,
        toAccount
      };
    }

    setActivityData(modifiedActivityItem);
  };

  useLayoutEffect(() => {
    getActivityKeysHandler();
    getActivityByIdHandler();
  }, [activityKey, activityId, isTransfer]);

  useLayoutEffect(() => {
    getActivityKey();
  }, [activityKey, activityId, transactionsKeysResponse, transfersKeysResponse, isTransfer]);

  useLayoutEffect(() => {
    checkActivityData();
  }, [
    activityKey,
    activityId,
    transactionsByIdResponse,
    transfersByIdResponse,
    isTransfer,
    paymentMethods,
    walletAccount,
    cashbackAccount,
    rewardsAccount,
    tradingAccounts
  ]);

  const data = useMemo(() => {
    if (id) {
      return params;
    }

    if (activityData === undefined) {
      return {} as HistoryDataItem;
    }

    setLoading(false);

    return {
      ...activityData,
      isTransfer,
      isTrading: false,
      isCashback: false
    };
  }, [activityKey, id, activityId, params, activityData, setLoading, isTransfer]);

  if (isLoading) {
    return <BaseLoader active={true} />;
  }

  return <RecentActivityDetailsScreen route={route} navigation={navigation} data={data} />;
};

export default RecentActivityDetails;
