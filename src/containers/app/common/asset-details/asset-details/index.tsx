import React, { FC, useEffect, useCallback, useLayoutEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import AssetDetailsScreen from './screen';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { actions } from '@/store';

type AssetDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.AssetDetails>;

const {
  portfolio: { setAssetSymbolData, useGetDealsAccountsQuery }
} = actions;

const AssetDetails: FC<AssetDetailsProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { asset, ask, bid, digits } = params || {};

  const isParams = Boolean(asset !== undefined);


  const dispatch = useAppDispatch();

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};
  const { id: userId } = userInfo || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();

  const setCurrentAsset = () => {
    if (!isParams) {
      return;
    }
    dispatch(
      setAssetSymbolData({
        asset,
        ask,
        bid,
        digits
      })
    );
  };

  const onGoBack = useCallback(() => {
    const { goBack, canGoBack } = navigation || {};
    const canBack = canGoBack();

    if (!canBack || isParams) {
      return;
    }

    goBack();
  }, [isParams]);

  const getDealsAccountsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    onGoBack();
    setCurrentAsset();
  }, [isParams, params]);

  useEffect(() => {
    getDealsAccountsHandler();
  }, [userId]);

  return <AssetDetailsScreen route={route} navigation={navigation} asset={asset} />;
};

export default AssetDetails;
