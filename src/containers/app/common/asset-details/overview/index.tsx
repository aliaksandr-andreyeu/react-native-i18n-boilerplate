import React, { FC, useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import AssetDetailsOverviewScreen from './screen';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  ParamListBase,
  NavigationProp,
  RouteProp
} from '@react-navigation/native';
import { SymbolConfig, SymbolLastTick } from '@/types';
import { actions } from '@/store';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';

const {
  portfolio: { setAssetSymbolData, useGetSymbolLastTickQuery, useGetSymbolConfigMutation }
} = actions;

const TRADING_ACCOUNT_CURRENCY = 'USD';

interface AssetDetailsOverviewProps { }

const AssetDetailsOverview: FC<AssetDetailsOverviewProps> = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase>>();

  const dispatch = useAppDispatch();

  const [profitSymbol, setProfitSymbol] = useState<string | undefined>(undefined);

  const [getSymbolConfig, symbolConfigData] = useGetSymbolConfigMutation();
  const [getSymbolLastTick, symbolLastTickData] = useGetSymbolLastTickQuery();

  const portfolio = useAppSelector((store) => store.portfolio);
  const { selectedAccount, assetSymbolData, tradingAssets = [] } = portfolio || {};
  const { asset: assetSymbol } = assetSymbolData || {};

  const setInitialState = () => {
    setProfitSymbol(undefined);
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [navigation, route])
  );

  const getSymbolConfigHandler = async () => {
    if (!assetSymbol) {
      return;
    }
    try {
      await getSymbolConfig({
        accountId: selectedAccount || 0,
        symbol: assetSymbol
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getSymbolLastTickHandler = async () => {
    if (!assetSymbol) {
      return;
    }
    try {
      await getSymbolLastTick({
        accountId: selectedAccount || 0,
        symbol: assetSymbol
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getSymbolConfigHandler();
    getSymbolLastTickHandler();
  }, [assetSymbol, selectedAccount]);

  const asset = useMemo(() => {
    const findedAsset = tradingAssets.find((asset) => asset.systemName === assetSymbol);
    const newAsset = {
      ...findedAsset,
      systemName: findedAsset?.systemName
    } as ParsedTradingAssets | undefined;

    return newAsset;
  }, [assetSymbol, tradingAssets]);

  const symbolConfig = useMemo(() => {
    const { data } = symbolConfigData || {};

    return data && Object.keys(data).length > 0 ? data : ({} as SymbolConfig);
  }, [symbolConfigData]);

  const symbolLastTick = useMemo(() => {
    const { data } = symbolLastTickData || {};

    return data && Object.keys(data).length > 0 ? data : ({} as SymbolLastTick);
  }, [symbolLastTickData]);

  const checkProfitCurrency = () => {
    const { currencyProfit } = symbolConfig || {};

    if (!currencyProfit || tradingAssets.length === 0) {
      return;
    }

    const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase();
    const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase();

    const currencyProfitDirectPair = tradingAssets.find((asset) => asset.systemName === directPair);
    const currencyProfitReversePair = tradingAssets.find((asset) => asset.systemName === reversePair);

    const currencyProfitSymbol = currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName;

    if (currencyProfitSymbol) {
      setProfitSymbol(currencyProfitSymbol);
    }
  };

  useEffect(() => {
    checkProfitCurrency();
  }, [symbolConfig, tradingAssets]);

  useLayoutEffect(() => {
    const { ask: lastTickAsk, bid: lastTickBid } = symbolLastTick || ({} as SymbolLastTick);
    const { digits: symbolDigits } = symbolConfig || ({} as SymbolConfig);

    dispatch(
      setAssetSymbolData({
        ...assetSymbolData,
        ...(symbolDigits && { digits: symbolDigits }),
        ...(lastTickAsk && { ask: lastTickAsk }),
        ...(lastTickBid && { bid: lastTickBid })
      })
    );
  }, [setAssetSymbolData, symbolConfig, symbolLastTick]);

  return (
    <AssetDetailsOverviewScreen
      symbolLastTick={symbolLastTick}
      symbolConfig={symbolConfig}
      profitSymbol={profitSymbol}
      tradingAsset={asset}
    />
  );
};

export default AssetDetailsOverview;
