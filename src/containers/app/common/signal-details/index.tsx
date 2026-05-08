import React, { FC, useCallback, useState, useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { useAppSelector } from '@/hooks';
import {
  useGetTradingAccountsMutation,
  useGetDealsAccountsQuery,
  useProfileQuery,
  useGetSignalsQuery
} from '@/store/api';
import SignalDetailsScreen from './screen';
import { BaseLoader } from '@/components';
import { useTranslation } from 'react-i18next';
import { Signals } from '@/types';

type SignalDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.SignalDetails>;

const SignalDetails: FC<SignalDetailsProps> = ({ route, navigation }) => {
  const [access, setAccess] = useState<boolean | undefined>(undefined);

  const { params } = route || {};
  const { data, asset } = params || {};

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const market = useAppSelector((store) => store.market);
  const { signals, allSymbols } = market || {};

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo, selectedAccount } = portfolio || {};
  const { id: userId, isVerified } = userInfo || {};

  const { i18n } = useTranslation();
  const { language } = i18n || {};

  const [getProfile] = useProfileQuery();
  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getTradingAccounts] = useGetTradingAccountsMutation({});
  const [getSignals] = useGetSignalsQuery();

  const signal = useMemo(() => {
    if (data) {
      return data;
    }

    const allAssetsMap = new Set(allSymbols.map((item) => item.name) || []);
    const signalsData =
      signals?.filter((el) => !el.Disabled)?.filter((item: any) => allAssetsMap.has(item.Product.amegaName)) || [];

    const signalItem = signalsData?.find((el) => {
      return el?.Product?.amegaName?.toLowerCase() === asset?.toLowerCase();
    });

    return signalItem;
  }, [signals, allSymbols, asset, data]);

  const isLoading = data ? false : Boolean(signal === undefined || !access);

  const checkAccess = () => {
    setAccess(Boolean(isVerified && isAuthorized));
  };

  const goToIdeasHub = () => {
    if (access === false) {
      navigation.navigate(ROOT_ROUTE_NAMES.App, {
        screen: APP_ROUTE_NAMES.Pulse,
        params: {
          screen: PULSEAI_ROUTE_NAMES.PulseAI
        }
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAccess();
      return () => { };
    }, [navigation, route, isVerified, isAuthorized])
  );

  useFocusEffect(
    useCallback(() => {
      goToIdeasHub();
      return () => { };
    }, [navigation, route, access])
  );

  const getSignalsHandler = async () => {
    if (!isAuthorized || !selectedAccount || !language || data) {
      return;
    }
    try {
      await getSignals({ accountId: selectedAccount, language });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getDealsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getAccountsDataHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getProfile();
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDealsHandler();
    }, [route, navigation, userId])
  );

  useFocusEffect(
    useCallback(() => {
      getAccountsDataHandler();
    }, [route, navigation, isAuthorized])
  );

  useFocusEffect(
    useCallback(() => {
      getSignalsHandler();
    }, [route, navigation, isAuthorized, selectedAccount, language, data])
  );

  if (isLoading) {
    return <BaseLoader active={true} />;
  }

  return <SignalDetailsScreen route={route} navigation={navigation} signal={signal as Signals} />;
};

export default SignalDetails;
