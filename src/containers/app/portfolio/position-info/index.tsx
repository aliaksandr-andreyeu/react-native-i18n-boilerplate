import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import PositionInfoScreen from './screen';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_ROUTE_NAMES } from '@/navigation/app/stacks';
import { PORTFOLIO_TAB_ROUTE_NAMES } from '@/containers/app/portfolio/portfolio/screen';
import {
  useGetPendingOrderInfoQuery,
  useGetPositionInfoQuery,
  useGetClosedPositionInfoQuery,
  useGetSymbolConfigMutation,
  useGetSymbolLastTickQuery
} from '@/store/api';
import { BaseLoader } from '@/components';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { DealsInfo, PendingOrder, Position } from '@/store/slices/portfolio/types';
import { actions } from '@/store';

type PositionInfoProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.PositionInfo>;

const {
  portfolio: { setActiveTab }
} = actions;

const PositionInfo: React.FC<PositionInfoProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();

  const { params } = route || {};
  const {
    accountId,
    closedPositionId,
    positionTicket = 0,
    title = '',
    isPosition,
    isClosed: isClosedParam,
    positionId,
    account: positionAccount
  } = params || {};

  const isClosed = closedPositionId ? true : isClosedParam;

  const [loading, setLoading] = useState<boolean>(true);
  const [fetching, setFetching] = useState<boolean>(Boolean(closedPositionId));

  const first = useRef<boolean>(true);

  const [getSymbolConfig, symbolConfig] = useGetSymbolConfigMutation();
  const { isLoading: symbolConfigIsLoading, data: symbolConfigData } = symbolConfig || {};

  const [getSymbolLastTick, symbolLastTick] = useGetSymbolLastTickQuery();
  const { data: symbolLastTickData } = symbolLastTick || {};

  const [
    getClosedPositionInfo,
    {
      data: closedPositionData = {},
      isLoading: closedPositionIsLoading,
      isUninitialized: closedPositionIsUninitialized,
      isFetching: closedPositionIsFetching,
      isError: closedPositionIsError
    }
  ] = useGetClosedPositionInfoQuery();
  const [getPositionInfo, { data: positionData, isFetching: positionIsFetching }] = useGetPositionInfoQuery();

  const [getPendingOrderInfo, pendingOrderResponse] = useGetPendingOrderInfoQuery();
  const { data: orderData, isFetching: orderIsFetching } = pendingOrderResponse;

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount: selectedStoreAccount = 0, tradingAssets, dealsInfo: deals } = portfolio || {};
  const selectedAccount = closedPositionId ? accountId : positionAccount || selectedStoreAccount;
  const { id: userId } = userInfo || {};

  const goToHistory = () => {
    dispatch(setActiveTab(3));

    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Portfolio,
        params: {
          screen: PORTFOLIO_TAB_ROUTE_NAMES.History
        }
      }
    });
  };

  const onGoBack = () => {
    if (!navigation.isFocused()) {
      return;
    }
    if (navigation.canGoBack()) {
      return navigation.goBack();
    }
    goToHistory();
  };

  const setClosedPositionParams = () => {
    const { symbol, ticket } = (closedPositionData || {}) as Position;

    if (!closedPositionId || !symbol || !ticket) {
      return;
    }

    navigation.setParams({
      positionTicket: ticket,
      title: symbol,
      isPosition: true,
      isClosed: true,
      positionId: ticket
    });
  };

  const dealData = useMemo(() => {
    if (closedPositionId) {
      const { action } = (closedPositionData || {}) as Position;

      const closedPositionByIdData = {
        ...closedPositionData,
        action: action === undefined ? action : action === 0 ? 1 : 0
      };

      return closedPositionByIdData;
    } else if (isClosed) {
      return positionId ? closedPositionData : deals.find((deal) => deal.ticket === positionTicket);
    }
    return {};
  }, [deals, closedPositionData, isClosed, positionId, positionTicket, closedPositionId]) as DealsInfo;

  const isFetching = useMemo(() => {
    if (isClosed) {
      if (positionId) {
        return closedPositionIsFetching || symbolConfigIsLoading;
      } else {
        return symbolConfigIsLoading;
      }
    } else if (isPosition) {
      return positionIsFetching || symbolConfigIsLoading;
    } else {
      return orderIsFetching || symbolConfigIsLoading;
    }
  }, [
    symbolConfigIsLoading,
    isPosition,
    closedPositionIsFetching,
    positionIsFetching,
    orderIsFetching,
    dealData,
    positionId,
    isClosed
  ]);

  const checkClosedPositionError = () => {
    if (!closedPositionIsError) {
      return;
    }
    if (accountId && closedPositionId) {
      onGoBack();
    }
  };

  useEffect(() => {
    checkClosedPositionError();
  }, [closedPositionIsError, accountId, closedPositionId]);

  useEffect(() => {
    if (isClosed && !positionTicket) {
      setLoading(isFetching);
    } else {
      if (first.current) first.current = false;
      else setLoading(isFetching);
    }
  }, [isFetching, isClosed, positionTicket]);

  const getOrderData = async () => {
    if (!title || !selectedAccount || !positionTicket || isClosed) {
      return;
    }

    await getSymbolConfig({ symbol: title, accountId: selectedAccount });
    await getPendingOrderInfo({ accountId: selectedAccount, ticket: positionTicket });
  };

  const getPositionData = async () => {
    if (!title || !selectedAccount || !positionTicket || isClosed) {
      return;
    }

    await getSymbolConfig({ symbol: title, accountId: selectedAccount });
    await getPositionInfo({ accountId: selectedAccount, ticket: positionTicket });
  };

  const getClosedPositionData = async () => {
    if (!title || !selectedAccount || !userId || !(positionTicket || dealData?.ticket) || !isClosed) {
      return;
    }

    await getSymbolConfig({ symbol: title, accountId: selectedAccount });
    await getClosedPositionInfo({
      accountId: selectedAccount,
      userId,
      positionTicket: String(positionTicket || dealData?.ticket)
    });
  };

  const getData = async () => {
    if (closedPositionId) {
      return;
    }
    try {
      if (isClosed && positionTicket) {
        await getClosedPositionData();
      } else if (isPosition) {
        await getPositionData();
      } else {
        await getOrderData();
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getClosedPositionById = async () => {
    if (!closedPositionId) {
      return;
    }

    if (!selectedAccount || !userId) {
      return onGoBack();
    }

    await getClosedPositionInfo({
      accountId: selectedAccount,
      userId,
      positionTicket: String(closedPositionId)
    });
  };

  const getSymbolConfigByClosedPositionSymbol = async () => {
    if (closedPositionIsLoading || closedPositionIsUninitialized || closedPositionIsFetching || !closedPositionId) {
      return;
    }

    const { symbol } = (closedPositionData || {}) as Position;

    if (!selectedAccount || !symbol) {
      return onGoBack();
    }

    await getSymbolConfig({ symbol, accountId: selectedAccount });

    setFetching(false);
  };

  useEffect(() => {
    getData();
  }, [closedPositionId, isClosed, positionTicket, dealData?.ticket, isPosition, selectedAccount, title, positionId]);

  useEffect(() => {
    getClosedPositionById();
  }, [selectedAccount, userId, closedPositionId]);

  useEffect(() => {
    setClosedPositionParams();

    getSymbolConfigByClosedPositionSymbol();
  }, [closedPositionData, closedPositionId]);

  const data = useMemo((): Partial<Position & PendingOrder & DealsInfo & { priceClose: number; timeClose: number }> => {
    if (isClosed) return { ...dealData, ...(!positionId && { timeCreate: positionData?.timeCreate }) };
    return isPosition ? positionData : orderData;
  }, [isPosition, positionData, orderData, isClosed, dealData, positionId]);

  useEffect(() => {
    if (data?.symbol) {
      getSymbolLastTick({ accountId: Number(selectedAccount), symbol: data?.symbol });
      getSymbolConfig({ symbol: data?.symbol, accountId: selectedAccount });
    }
  }, [data?.symbol, selectedAccount]);

  if (fetching) {
    return <BaseLoader active={true} />;
  }

  return (
    <PositionInfoScreen
      navigation={navigation}
      route={route}
      getData={getData}
      data={data}
      loading={loading}
      symbolConfigData={symbolConfigData}
      symbolLastTickData={symbolLastTickData}
      positionData={positionData}
      orderData={orderData}
    />
  );
};

export default PositionInfo;
