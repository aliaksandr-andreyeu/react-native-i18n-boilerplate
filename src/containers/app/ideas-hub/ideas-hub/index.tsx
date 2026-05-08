import React, { FC, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { IDEASHUB_ROUTE_NAMES, IdeasHubRootParamsList } from '@/navigation/app/stacks';
import IdeasHubScreen from './screen';
import { useTranslation } from 'react-i18next';
import {
  useGetAllSymbolsQuery,
  useGetDealsAccountsQuery,
  useGetPromotionsQuery,
  useGetSignalsQuery,
  useGetWinnersAndLosersQuery
} from '@/store/api';
import { useAppSelector } from '@/hooks';
import { Signals } from '@/store/slices/market/types';
import useAsyncStorage from '@/hooks/asyncstorage';

type IdeasHubProps = StackScreenProps<IdeasHubRootParamsList, IDEASHUB_ROUTE_NAMES.IdeasHub>;

function getRandomSignals(tradingList: Signals[]) {
  const tempSignals = tradingList.filter((signal) => !!signal.Product.amegaName);

  tempSignals.sort((a, b) => {
    if (a.Report.confidence > b.Report.confidence) return -1;
    if (a.Report.confidence < b.Report.confidence) return 1;

    const isLiveA = a.Report.status === 9 ? 1 : 0;
    const isLiveB = b.Report.status === 9 ? 1 : 0;
    return isLiveB - isLiveA;
  });

  return tempSignals.slice(0, 5);
}

const fakeSignals = {
  data: [{ type: 'blur' }, { type: 'blur' }] as Signals[],
  loading: false,
  error: null
};
const IdeasHub: FC<IdeasHubProps> = ({ route, navigation }) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { t, i18n } = useTranslation();

  const [getWinnersAndLosers] = useGetWinnersAndLosersQuery();
  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getSignals, signalsResponse] = useGetSignalsQuery();
  const [getAllSymbols] = useGetAllSymbolsQuery();
  const [getPromotions] = useGetPromotionsQuery();

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);
  const allRelatedSymbols = useAppSelector((store) => store.market.allSymbols);
  const { get, set, storageValues } = useAsyncStorage<`signals-viewed-${number}`>();
  const appOpened = useRef<boolean>(false);

  const getAllSymbolsData = async () => {
    try {
      await getAllSymbols({ accountId: Number(selectedAccount) || 0 }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const getWinnersAndLosersData = useCallback(async () => {
    try {
      await getWinnersAndLosers(selectedAccount || 0, false);
    } catch (error) { }
  }, [selectedAccount]);

  const getDealsAccountsHandler = async () => {
    if (userInfo.id === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userInfo.id);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const fetchSignals = useCallback(async () => {
    try {
      if (!userInfo.id) return;

      const viewedKey = `signals-viewed-${userInfo.id}` as const;
      let isViewed = true;

      if (!userInfo.isVerified && !appOpened.current) {
        isViewed = await get(viewedKey);
      }

      const shouldFetchSignals = userInfo.isVerified || !isViewed;

      if (shouldFetchSignals) {
        await getSignals({
          accountId: selectedAccount || undefined,
          language: i18n.language
        }).unwrap();
      }

      if (!isViewed && userInfo.id) {
        appOpened.current = true;
        set(viewedKey, true, true, false);
      }
    } catch (error) {
      console.error(error)
    }
  }, [selectedAccount, userInfo.id, i18n.language, userInfo.isVerified]);


  useEffect(() => {
    getDealsAccountsHandler();
  }, [userInfo.id]);

  useEffect(() => {
    getAllSymbolsData();
    fetchSignals();
  }, [selectedAccount, userInfo.id, i18n.language]);

  const refreshHandler = async () => {
    setRefreshing(true);
    try {
      fetchSignals();
      getWinnersAndLosersData();
      const pData = await getPromotions(i18n.language).unwrap();
      if (i18n.language === 'en' || pData.length) return;
      getPromotions('en');
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const signals = useMemo(() => {
    const { currentData: signalsData, error, isLoading, isUninitialized, isError } = signalsResponse || {};

    const allAssetsMap = new Set(allRelatedSymbols.map((item) => item.name) || []);

    const data = !userInfo.isVerified ?
      signalsData?.filter((item: Signals) => !!item?.Product?.amegaName)?.slice?.(0, 2)
      :
      signalsData?.filter((el: Signals) => !el.Disabled)
        ?.filter((item: any) => allAssetsMap.has(item.Product.amegaName));


    const loading = isLoading || isUninitialized

    const signals = {
      loading,
      data: [],
      error: null
    };

    const { message } = (error || {}) as { message: string };

    if (isError) {
      return {
        ...signals,
        error: message || t('errors.common')
      };
    }

    if (!(data && Array.isArray(data))) {
      return signals;
    }

    return {
      ...signals,
      data: getRandomSignals(data)
    };
  }, [signalsResponse, allRelatedSymbols, userInfo.isVerified]);




  return (
    <IdeasHubScreen
      signals={(!userInfo.isVerified && storageValues[`signals-viewed-${userInfo.id}`]) ? fakeSignals : signals}
      getSignals={fetchSignals}
      onRefresh={refreshHandler}
      refreshing={refreshing}
      route={route}
      navigation={navigation}
    />
  );
};

export default IdeasHub;
