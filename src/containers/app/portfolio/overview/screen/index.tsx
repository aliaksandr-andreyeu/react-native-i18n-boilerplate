import React, { useCallback, useState, useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks';
import {
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  MARKETS_ROUTE_NAMES,
  PORTFOLIO_ROUTE_NAMES,
  PortfolioRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { useFocusEffect, useIsFocused, useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { config, testIDs } from '@/constants';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ScrollView,
  Directions,
  FlingGestureHandler,
  HandlerStateChangeEvent,
  FlingGestureHandlerEventPayload
} from 'react-native-gesture-handler';
import { formatNumberToAmount, formatTwoDecimals, getAssetName, jsonParse } from '@/helpers';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import {
  BaseDonutChart,
  BaseText,
  BaseTextVariant,
  BaseImage,
  BaseRefreshControl,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseTradingBanner,
  SheetBackdrop
} from '@/components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import useStyles from './styles';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { Position, SymbolLastTick } from '@/store/slices/portfolio/types';
import { useWelcomeBonusAvailability } from '@/hooks/custom';
import { useGetSymbolLastTickQuery } from '@/store/api';
import { useNetwork } from '@/providers';
import { debounce } from 'throttle-debounce';

const {
  animation: { duration },
  components: {
    cards: { hitSlop, activeOpacity }
  }
} = config;

type OverviewSceenProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Overview>;

interface OverviewSceenData extends OverviewSceenProps {
  refreshing: boolean;
  onRefresh: () => void;
}

enum GROUP_NAME {
  BY_ASSET = 0,
  BY_CLASS = 1,
  BY_ACTION = 2
}

interface ViewItemProps {
  id: GROUP_NAME;
  label: string;
  field: string;
}

interface DealData {
  action: number;
  assetGroupName: string;
  symbol: string;
  positionValue: number;
  profit: number;
  percentage: number;
  description: string;
  image: string;
  color: string;
}

interface IHasLastTick {
  lastTick: { ask: number; bid: number };
  currencyProfitSymbol: string;
  currencyProfitSymbolDirect: boolean | undefined;
}

const OverviewSceen: React.FC<OverviewSceenData> = ({ refreshing, onRefresh, navigation, route }) => {
  const BottomSheetRef = useRef<BottomSheetModal>(null);

  const scrollRef = useRef<ScrollView>(null);
  const lastPoint = useRef<number>(0);

  const { t } = useTranslation();

  const { isWelcomeBonusAvailable, promoBonus } = useWelcomeBonusAvailability();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const viewItems: ViewItemProps[] = [
    {
      id: GROUP_NAME.BY_ASSET,
      label: t('screens.portfolio.overview.by-asset'),
      field: 'symbol'
    },
    {
      id: GROUP_NAME.BY_CLASS,
      label: t('screens.portfolio.overview.by-asset-class'),
      field: 'assetGroupName'
    },
    {
      id: GROUP_NAME.BY_ACTION,
      label: t('screens.portfolio.overview.by-direction'),
      field: 'action'
    }
  ];

  const [deals, setDeals] = useState<DealData[]>([] as DealData[]);

  const [selectedView, setSelectedView] = useState<ViewItemProps>(viewItems[0]);
  const [selectedDeal, setSelectedDeal] = useState<number | undefined>(undefined);
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const [balanceLive, setBalanceLive] = useState({ equity: 0 });

  const { websocket, isReadyState } = useNetwork();

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState;

  const [symbolLive, setSymbolLive] = useState<Record<string, { ask: number; bid: number; averagePrice: number }>>({});

  const changeSymbol = (symbol: string, key: 'ask' | 'bid' | 'averagePrice', value: number) =>
    setSymbolLive((prev) => ({ ...prev, [symbol]: { ...prev[symbol], [key]: value } }));

  const scrollToPrev = () => {
    setSelectedView((prevView) => {
      const { id } = prevView || {};

      setSelectedDeal(undefined);

      if (id > 0) {
        return viewItems[id - 1];
      } else {
        return viewItems[viewItems.length - 1];
      }
    });
  };

  const scrollToNext = () => {
    setSelectedView((prevView) => {
      const { id } = prevView || {};

      setSelectedDeal(undefined);

      if (id < viewItems.length - 1) {
        return viewItems[id + 1];
      } else {
        return viewItems[0];
      }
    });
  };

  const portfolio = useAppSelector((store) => store.portfolio);
  const { selectedAccount, dealsAccounts = [], tradingAssets = [], userInfo } = portfolio || {};
  const { trading: tradingAccount } = useAppSelector((state) => state.wallet.accounts);

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);

  const showGuideline = !userInfo.firstDepositDate || !userInfo.lastTradedAt;

  useLayoutEffect(() => {
    if (tradingAccounts && tradingAccounts.length === 0) {
      return;
    }

    const equity = tradingAccounts
      .filter((account) => account.typeId !== welcomeAccountTypeId)
      .reduce((acc, current) => {
        const { equity: currentEquity = 0 } = current || {};
        return acc + currentEquity;
      }, 0);

    setBalanceLive(() => ({ equity }));
  }, [tradingAccounts]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    chart,
    palette: { graphite, base, green, red }
  } = theme || {};

  const positions = useMemo((): (Position & DealData)[] => {
    const isData = Boolean(dealsAccounts && Array.isArray(dealsAccounts) && dealsAccounts.length > 0);

    if (!isData) {
      return [];
    }

    const positionsData = dealsAccounts.find((item) => item.accountId === selectedAccount);
    const { positions: dealsPositions = [] } = positionsData || {};

    return dealsPositions.slice() as (Position & DealData)[];
  }, [dealsAccounts, selectedAccount]);

  const [getProfitSymbolLastTick] = useGetSymbolLastTickQuery();

  const handlePositionValue = async (
    passFetch: boolean,
    currencyProfit: string
  ): Promise<
    | {
      lastTick: SymbolLastTick | undefined;
      currencyProfitSymbol: string | undefined;
      currencyProfitSymbolDirect: boolean;
    }
    | undefined
  > => {
    if (tradingAssets.length === 0) {
      return;
    }

    if (!currencyProfit) {
      return;
    }

    const TRADING_ACCOUNT_CURRENCY = tradingAccount.currency || 'USD';

    const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase();
    const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase();

    const currencyProfitDirectPair = tradingAssets.find((asset) => asset.systemName === directPair);
    const currencyProfitReversePair = tradingAssets.find((asset) => asset.systemName === reversePair);

    const currencyProfitSymbol = currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName;
    const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName);

    if (selectedAccount && currencyProfitSymbol && !passFetch) {
      const lastTick = await getProfitSymbolLastTick({
        symbol: currencyProfitSymbol,
        accountId: selectedAccount
      }).unwrap();
      return {
        lastTick,
        currencyProfitSymbol,
        currencyProfitSymbolDirect
      };
    }
    return {
      currencyProfitSymbol,
      currencyProfitSymbolDirect,
      lastTick: undefined
    };
  };

  const hasLastTick = useRef<Record<string, IHasLastTick>>({});

  useEffect(() => {
    hasLastTick.current = {};
  }, [pageIsFocused]);

  const getCurrentPositionValue = async (deal: Position & DealData) => {
    const { action, symbol, Volume, contractSize, priceCurrent, currencyProfit } = deal as Position & DealData;

    const symbolPrices = symbolLive?.[symbol];
    const liveAsk = symbolPrices?.ask;
    const liveBid = symbolPrices?.bid;
    const currAveragePrice = symbolPrices?.averagePrice;
    let priceCurrentValue = priceCurrent;

    if (action === 0 && liveAsk) {
      priceCurrentValue = liveAsk;
    }
    if (action === 1 && liveBid) {
      priceCurrentValue = liveBid;
    }

    let rawPositionValue = Volume * contractSize * priceCurrentValue;

    let handledPositionData = hasLastTick.current[symbol] || (await handlePositionValue(false, currencyProfit));

    const lastTickBid = handledPositionData?.lastTick?.bid;
    const lastTickAsk = handledPositionData?.lastTick?.ask;
    const profitSymbol = handledPositionData?.currencyProfitSymbol;
    const profitSymbolDirect = handledPositionData?.currencyProfitSymbolDirect;

    if (!hasLastTick.current[symbol] && lastTickAsk && lastTickBid && profitSymbol) {
      hasLastTick.current[symbol] = {
        lastTick: { bid: lastTickAsk, ask: lastTickAsk },
        currencyProfitSymbol: profitSymbol,
        currencyProfitSymbolDirect: profitSymbolDirect
      };
    }

    if (profitSymbol && lastTickBid && lastTickAsk) {
      const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;
      const averagePrice = currAveragePrice || currencyAveragePrice;
      rawPositionValue = profitSymbolDirect ? rawPositionValue * averagePrice : rawPositionValue / averagePrice;
    }

    return rawPositionValue;
  };

  const geTotalPositionValue = async (deals: (Position & DealData)[]) => {
    const totalPositionValue = await deals.reduce(async (asyncData, deal) => {
      const data = await asyncData;
      let positionValue = await getCurrentPositionValue(deal);
      return data + positionValue;
    }, Promise.resolve(0));

    return totalPositionValue;
  };

  const checkDealsData = async () => {
    const isData = Boolean(positions && Array.isArray(positions) && positions.length > 0);

    if (!isData) {
      setDeals([]);
    }

    const chartPalette = positions.map((_, i) => chart[i % chart.length]);

    const { field, id } = selectedView || {};

    // const totalPositionValue = await geTotalPositionValue(positions); // LIVE CHART NEXT BUILD with LIVE PnL etc

    const totalPositionValue = positions.reduce((data, deal) => {
      const { Volume, contractSize, priceCurrent } = deal;
      const positionValue = Volume * contractSize * priceCurrent;
      return data + positionValue;
    }, 0);

    let summaryPositions: (Position & DealData)[] = [];

    await new Promise(async (res) => {
      let data: any = [];
      for (let i = 0; i < positions.length; i++) {
        const deal: any = positions[i];

        const {
          action,
          assetGroupName = '',
          profit,
          symbol,
          Volume,
          contractSize,
          priceCurrent
        } = deal as Position & DealData;

        const asset = tradingAssets.find((item) => item.systemName === symbol);
        const { image = undefined, fullName = '' } = asset || {};

        // let rawPositionValue = await getCurrentPositionValue(deal); // LIVE CHART NEXT BUILD with LIVE PnL etc
        let rawPositionValue = Volume * contractSize * priceCurrent;

        const rawPercentage = (rawPositionValue * 100) / (totalPositionValue || 1);

        let color = graphite['100'];

        const itemExist = data.find((el: any) => el[field] === deal[field]);

        if (itemExist) {
          const {
            action: existedAction,
            assetGroupName: existedAssetGroupName,
            percentage: existedPercentage,
            symbol: existedSymbol,
            profit: existedprofit,
            positionValue: existedPositionValue,
            color: existedColor
          } = itemExist || {};

          const filteredData = data.filter((el: any) => el[field] !== deal[field]);

          data = [
            ...filteredData,
            {
              action: existedAction,
              assetGroupName: existedAssetGroupName,
              symbol: existedSymbol,
              positionValue: rawPositionValue + existedPositionValue,
              profit: profit + existedprofit,
              percentage: rawPercentage + existedPercentage,
              description: fullName,
              image,
              color: existedColor
            }
          ];

          continue;
        }

        data = [
          ...data,
          {
            action,
            assetGroupName,
            symbol,
            positionValue: rawPositionValue,
            profit,
            percentage: rawPercentage,
            description: fullName,
            image,
            color
          }
        ];
      }

      summaryPositions = data;
      res('');
    });

    const sortedSummary = summaryPositions
      .map((deal, index) => {
        const { action } = deal;
        let color = chartPalette[index];
        if (id === GROUP_NAME.BY_ACTION) {
          color = action === 0 ? green['500'] : red['500'];
        }
        return {
          ...deal,
          color
        };
      })
      .sort((a, b) => b.positionValue - a.positionValue);

    setDeals(sortedSummary);
  };

  useLayoutEffect(() => {
    checkDealsData();
  }, [
    tradingAssets,
    positions,
    setDeals,
    selectedView,
    green,
    red,
    graphite,
    chart,
    tradingAccount,
    symbolLive,
    selectedAccount
  ]);

  const debounceSetData = useCallback(
    (askPrice: number, bidPrice: number, symbol: string) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice) {
        changeSymbol(symbol, 'ask', askPrice);
      }
      if (bidPrice) {
        changeSymbol(symbol, 'bid', bidPrice);
      }
    },
    [enabledHandleMessage, symbolLive]
  );

  const debounceSetCurrencyData = useCallback(
    (askPrice: number, bidPrice: number, symbol: string) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice && bidPrice) {
        const averagePrice = (askPrice + bidPrice) / 2;
        changeSymbol(symbol, 'averagePrice', averagePrice);
      }
    },
    [enabledHandleMessage, symbolLive]
  );

  const setData = debounce(250, debounceSetData);
  const setCurrencyData = debounce(250, debounceSetCurrencyData);

  const subscribeWebsocket = useCallback(async () => {
    if (!enabledHandleMessage) {
      setData.cancel();
      setCurrencyData.cancel();
      return;
    }

    let symbolsList = positions.map((item) => item.symbol);

    const profitSymbols: string[] = [];

    await new Promise(async (res) => {
      for (let i = 0; i < positions.length; i++) {
        const { currencyProfit } = positions[i];
        const handledData = await handlePositionValue(true, currencyProfit);
        const currencyProfitSymbol = handledData?.currencyProfitSymbol;
        if (currencyProfitSymbol) profitSymbols.push(currencyProfitSymbol);
      }
      res('');
    });

    if (profitSymbols) {
      symbolsList = [...symbolsList, ...profitSymbols];
    }

    websocket.send(`unsubscribe ALL`);

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const wsData = jsonParse(event?.data);
      if (!wsData) {
        return;
      }

      const {
        ask: dataAsk,
        bid: dataBid,
        symbol: dataSymbol
      } = (wsData || {}) as { ask: number; bid: number; symbol: string };
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }

      if (symbolsList.includes(dataSymbol)) {
        setData(dataAsk, dataBid, dataSymbol);
      }

      if (profitSymbols.length && profitSymbols.includes(dataSymbol)) {
        setCurrencyData(dataAsk, dataBid, dataSymbol);
      }
    });

    websocket.send(`subscribe ${symbolsList.join(' ')}`);
  }, [enabledHandleMessage, positions]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    setData.cancel();
    setCurrencyData.cancel();

    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage, setData, setCurrencyData]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, enabledHandleMessage, positions, tradingAssets, tradingAccount, selectedAccount])
  );

  const filteredDeals = useMemo(() => {
    if (selectedDeal === undefined) {
      return deals;
    }
    return deals.filter((_, index) => index === selectedDeal);
  }, [deals, selectedDeal]);

  const chartData = useMemo(() => {
    return deals.map(({ percentage, color }) => ({ percentage, color }));
  }, [deals]);

  const totalValue = useMemo(() => {
    const totalPositionValue = filteredDeals.reduce((data, deal) => {
      const { positionValue } = deal || {};
      return data + positionValue;
    }, 0);

    const roundedPositionValue = formatTwoDecimals(Math.round(totalPositionValue * 100) / 100);
    const formattedPositionValue = formatNumberToAmount(roundedPositionValue);

    return (
      <BaseText
        testID={testIDs.portfolio.overview.formattedPositionValue}
        variant={BaseTextVariant.authSubTitle}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >
        {`$${formattedPositionValue}`}
      </BaseText>
    );
  }, [filteredDeals]);

  const openModal = () => {
    BottomSheetRef.current?.present();
    setSheetVisible(true);
  };

  const closeModal = () => {
    BottomSheetRef.current?.close();
  };

  const onClose = () => {
    setSheetVisible(false);
  };

  const ViewItem = useCallback(
    ({ data }: { data: ViewItemProps }) => {
      const { label: dataLabel, id: dataId } = data;
      const { id } = selectedView || {};

      const isSelected = Boolean(dataId === id);

      const onPress = () => {
        setSelectedView(data);
        setSelectedDeal(undefined);
        setSheetVisible(false);
        closeModal();
      };

      return (
        <TouchableOpacity
          onPress={onPress}
          style={styles.filterItemBox}
          hitSlop={hitSlop}
          activeOpacity={activeOpacity}
          testID={testIDs.portfolio.overview.viewItem.button(dataId)}
        >
          <View testID={testIDs.portfolio.overview.viewItem.dataLabelContainer} style={styles.filterDescBox}>
            <BaseText testID={testIDs.portfolio.overview.viewItem.dataLabel} variant={BaseTextVariant.extraSmall}>
              {dataLabel}
            </BaseText>
          </View>
          <View
            testID={testIDs.portfolio.overview.viewItem.checkIconContainer}
            style={[styles.filterCheckBox, { ...(isSelected && styles.filterCheckBoxSelected) }]}
          >
            {isSelected ? (
              <SvgIcon
                testID={testIDs.portfolio.overview.viewItem.checkIcon}
                name={SvgXmlIconNames.check}
                size={IconSize.xxs}
                color={graphite['900']}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedView, setSelectedView, setSelectedDeal, setSheetVisible, closeModal]
  );

  const CardsListHeader = useCallback(() => {
    return (
      <View testID={testIDs.portfolio.overview.cardListHeader.container} style={styles.listHeaderBox}>
        <BaseText
          testID={testIDs.portfolio.overview.cardListHeader.name}
          style={styles.listTitle}
          variant={BaseTextVariant.extraSmall}
        >
          {t('screens.portfolio.overview.name')}
        </BaseText>
        <BaseText
          testID={testIDs.portfolio.overview.cardListHeader.currentValue}
          style={[styles.listTitle, styles.listTitleMiddle]}
          variant={BaseTextVariant.extraSmall}
        >
          {t('screens.portfolio.overview.current-value')}
        </BaseText>
        <BaseText
          testID={testIDs.portfolio.overview.cardListHeader.pnl}
          style={[styles.listTitle, styles.listTitleLast]}
          variant={BaseTextVariant.extraSmall}
        >
          {t('screens.portfolio.overview.pnl')}
        </BaseText>
      </View>
    );
  }, [t, styles]);

  const CardItem = useCallback(
    ({ item }: { item: DealData }) => {
      const { action, color, assetGroupName, image, symbol, percentage, profit, positionValue } = item || {};

      const { id, field } = selectedView || {};

      const actionLabel = action === 0 ? t('screens.portfolio.overview.buy') : t('screens.portfolio.overview.sell');
      const actionColor = action === 0 ? green['500'] : red['500'];

      const roundedPercentageValue = formatTwoDecimals(Math.round(percentage * 100) / 100);

      const roundedPositionValue = formatTwoDecimals(Math.round(positionValue * 100) / 100);
      const decimalPositionValue = roundedPositionValue;
      const formattedPositionValue = `$${formatNumberToAmount(decimalPositionValue)}`;

      const roundedPnLValue = Math.round(profit * 100) / 100;

      const pnlStyle = roundedPnLValue > 0 ? styles.bullPnL : roundedPnLValue < 0 ? styles.bearPnL : undefined;

      const handleValue = (value: number | undefined) => {
        if (value === undefined) return value;
        const absValue = Math.abs(value);
        if (value === 0) return `$${formatNumberToAmount(absValue.toFixed(2))}`;
        return `${value > 0 ? '+' : '-'}$${formatNumberToAmount(absValue.toFixed(2))}`;
      };

      const idx = deals.findIndex((el: any) => el[field] === item[field as never]);

      const onPress = () => {
        setSelectedDeal(idx === -1 ? undefined : selectedDeal === idx ? undefined : idx);
      };

      const label = id === GROUP_NAME.BY_CLASS ? assetGroupName : id === GROUP_NAME.BY_ASSET ? symbol : actionLabel;

      return (
        <TouchableOpacity
          onPress={onPress}
          testID={testIDs.portfolio.overview.cardItem.button(id)}
          style={[
            styles.cardBox,
            {
              borderLeftColor: id === GROUP_NAME.BY_ACTION ? actionColor : color
            }
          ]}
          hitSlop={hitSlop}
          activeOpacity={activeOpacity}
        >
          <View
            testID={testIDs.portfolio.overview.cardItem.cardAssetContainer}
            style={[styles.cardAsset, { ...(id !== GROUP_NAME.BY_ASSET && styles.cardAssetImgLess) }]}
          >
            {id === GROUP_NAME.BY_ASSET ? (
              image ? (
                <BaseImage
                  testID={testIDs.portfolio.overview.cardItem.cardImage}
                  resizeMode='contain'
                  style={styles.cardImg}
                  source={{ uri: image }}
                />
              ) : (
                <View style={styles.blankImg} />
              )
            ) : null}
            <View style={styles.cardAssetTitle}>
              <BaseText
                testID={testIDs.portfolio.overview.cardItem.cardLabel}
                numberOfLines={1}
                variant={BaseTextVariant.textSemiBold}
              >
                {getAssetName(label)}
              </BaseText>
              <BaseText
                testID={testIDs.portfolio.overview.cardItem.percentageValue}
                numberOfLines={1}
                variant={BaseTextVariant.extraSmall}
              >
                ({roundedPercentageValue}%)
              </BaseText>
            </View>
          </View>
          <BaseText
            testID={testIDs.portfolio.overview.cardItem.positionValue}
            numberOfLines={1}
            style={styles.currentValue}
            variant={BaseTextVariant.small}
          >
            {formattedPositionValue}
          </BaseText>
          <BaseText
            testID={testIDs.portfolio.overview.cardItem.pnlValue}
            numberOfLines={1}
            style={[styles.pnlValue, pnlStyle]}
          >
            {handleValue(roundedPnLValue)}
          </BaseText>
        </TouchableOpacity>
      );
    },
    [deals, setSelectedDeal, selectedDeal, selectedView, t, green, red, styles]
  );

  const ViewSelector = useCallback(() => {
    const { id } = selectedView || {};

    const viewItem = viewItems.find((el) => el.id === id);
    const { label = '' } = viewItem || {};

    return (
      <TouchableOpacity
        testID={testIDs.portfolio.overview.viewSelector.button(label)}
        onPress={openModal}
        style={styles.viewSelector}
        hitSlop={hitSlop}
        activeOpacity={activeOpacity}
      >
        <BaseText testID={testIDs.portfolio.overview.viewSelector.label}>{label}</BaseText>
        <SvgIcon
          testID={testIDs.portfolio.overview.viewSelector.icon}
          name={sheetVisible ? SvgXmlIconNames.chevronTop : SvgXmlIconNames.chevronBottom}
          size={IconSize.xs}
          color={graphite['900']}
        />
      </TouchableOpacity>
    );
  }, [sheetVisible, openModal, selectedView]);

  const ChartPagination = useCallback(() => {
    return (
      <View testID={testIDs.portfolio.overview.charPagination.container} style={styles.chartPagination}>
        {viewItems.map((data: ViewItemProps) => {
          const { label: dataLabel, id: dataId } = data;
          const { id } = selectedView || {};

          const isSelected = Boolean(dataId === id);

          // const onPress = () => {
          // setSelectedView(data);
          // setSelectedDeal(undefined);
          // };

          return (
            <TouchableOpacity
              testID={testIDs.portfolio.overview.charPagination.button(dataId)}
              style={[
                styles.pageBox,
                {
                  ...(isSelected && styles.pageBoxSelected)
                }
              ]}
              key={String(dataId)}
              // onPress={onPress}
              hitSlop={hitSlop}
              activeOpacity={activeOpacity}
            ></TouchableOpacity>
          );
        })}
      </View>
    );
  }, [selectedView, setSelectedView, setSelectedDeal]);

  const keyExtractor = useCallback((deal: DealData, index: number) => String(`${deal.symbol}-${index}`), []);

  const refreshHandler = () => {
    onRefresh && typeof onRefresh === 'function' && onRefresh();
  };

  const hasDeals = useMemo(() => !!deals?.length, [deals]);

  const goToSignals = useCallback(() => navigation.navigate<any>(PULSEAI_ROUTE_NAMES.PulseAI), []);
  const goToMarket = useCallback(
    () => navigation.navigate<any>(APP_ROUTE_NAMES.Markets, { screen: MARKETS_ROUTE_NAMES.Markets }),
    []
  );

  const renderGuideline = useCallback(() => {
    let guidelineData = {
      bannerSubTitle: '',
      bannerButtonText: '',
      bannerImageStyle: {},
      bannerImage: images.safe,
      onPress: () => { }
    };
    if (!isAuthorized) {
      guidelineData = {
        bannerSubTitle: t('components.molecules.banner.create-account'),
        bannerButtonText: t('components.molecules.banner.sign-up'),
        bannerImageStyle: styles.idCardImage,
        bannerImage: images.idCard,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Auth, {
            screen: AUTH_ROUTE_NAMES.BonusSignUp
          });
        }
      };
    } else if (!userInfo.isVerified) {
      guidelineData = {
        bannerSubTitle: isWelcomeBonusAvailable
          ? t('screens.portfolio.promo-bonus-baner', { amount: promoBonus })
          : t('components.molecules.banner.complete-verification-sub'),
        bannerButtonText: t('components.molecules.banner.complete-verification'),
        bannerImageStyle: styles.blackKeyImage,
        bannerImage: images.blackKey,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Common, {
            screen: COMMON_ROUTE_NAMES.Verification
          });
        }
      };
    } else {
      if (!userInfo.firstDepositDate)
        guidelineData = {
          bannerSubTitle: t('screens.portfolio.deposit-now'),
          bannerButtonText: t('screens.portfolio.fund-now'),
          bannerImageStyle: styles.safeImage,
          bannerImage: images.safe,
          onPress: () => {
            navigation.navigate<any>(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }
        };
      else {
        if (!balanceLive.equity)
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.transfer-funds-trading-account-dive-into-markets'),
            bannerButtonText: t('screens.portfolio.transfer-funds-now'),
            bannerImageStyle: styles.rocketImage,
            bannerImage: images.rocket,
            onPress: () => {
              navigation.navigate<any>(ROOT_ROUTE_NAMES.Transfer);
            }
          };
        else {
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.deposit-now'),
            bannerButtonText: t('screens.portfolio.explore-trading-signals'),
            bannerImageStyle: styles.barchartImage,
            bannerImage: images.barChart,
            onPress: () => {
              navigation.navigate<any>(PULSEAI_ROUTE_NAMES.PulseAI);
            }
          };
        }
      }
    }
    return (
      <BaseTradingBanner
        style={styles.guidelineBanner}
        title={`${t('screens.common.next-step')}:`}
        subTitle={guidelineData.bannerSubTitle}
        buttonText={guidelineData.bannerButtonText}
        imageSource={guidelineData.bannerImage}
        imageStyle={guidelineData.bannerImageStyle}
        leftSectionStyle={{ marginRight: 112 }}
        buttonType={BaseButtonType.primary}
        onPress={guidelineData?.onPress}
      />
    );
  }, [t, userInfo, userInfo, balanceLive, isWelcomeBonusAvailable, promoBonus, isAuthorized]);

  const onHandlerStateChange = useCallback((e: HandlerStateChangeEvent<FlingGestureHandlerEventPayload>) => {
    const state = e.nativeEvent.state;
    const abX = Math.floor(e.nativeEvent.absoluteX);
    if (state === 2) return (lastPoint.current = abX);
    const diff = lastPoint.current - abX;
    if ([1, 5].includes(state)) {
      if (diff > 10) scrollToNext();
      else if (diff < -10) scrollToPrev();
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        testID={testIDs.portfolio.overview.scrollView}
        refreshControl={<BaseRefreshControl refreshing={refreshing} onRefresh={refreshHandler} />}
        contentContainerStyle={[
          styles.scrollContent,
          !hasDeals && { justifyContent: 'space-between' },
          showGuideline && { paddingBottom: 200 }
        ]}
        style={[styles.scrollBox, !hasDeals && { height: '100%' }]}
      >
        <View>
          <View style={styles.titleBox}>
            <BaseText testID={testIDs.portfolio.overview.title} variant={BaseTextVariant.title}>
              {t('screens.portfolio.overview.title')}
            </BaseText>
          </View>
          <FlingGestureHandler
            testID={testIDs.portfolio.overview.flingGesture}
            direction={Directions.LEFT | Directions.RIGHT}
            onHandlerStateChange={onHandlerStateChange}
          >
            <View style={styles.chartBox}>
              <View testID={testIDs.portfolio.overview.chartWrapper} style={styles.chartWrapper}>
                <BaseDonutChart selected={selectedDeal} series={chartData} size={250} />
                <View testID={testIDs.portfolio.overview.chartInfoWrapper} style={styles.chartInfo}>
                  {totalValue}
                  {hasDeals ? (
                    <ViewSelector />
                  ) : (
                    <BaseText testID={testIDs.portfolio.overview.nothingHereYet}>
                      {t('screens.portfolio.nothing-here-yet')}
                    </BaseText>
                  )}
                </View>
              </View>
              {hasDeals && <ChartPagination />}
            </View>
          </FlingGestureHandler>
        </View>
        {hasDeals ? (
          <Animated.FlatList
            testID={testIDs.portfolio.overview.flatList}
            scrollEnabled={false}
            entering={FadeIn.duration(duration)}
            exiting={FadeOut.duration(duration)}
            contentContainerStyle={styles.dealsContent}
            style={styles.dealsBox}
            data={filteredDeals}
            keyExtractor={keyExtractor}
            ListHeaderComponent={CardsListHeader}
            renderItem={CardItem}
          />
        ) : (
          <View style={styles.btnContainer}>
            {showGuideline ? null : (
              <>
                <BaseButton
                  testID={testIDs.portfolio.overview.goToSignal}
                  label={t('screens.portfolio.overview.explore-trading-signals')}
                  size={BaseButtonSize.large}
                  type={BaseButtonType.primary}
                  onPress={goToSignals}
                />
                <BaseButton
                  testID={testIDs.portfolio.overview.goToMarket}
                  type={BaseButtonType.accent}
                  label={t('screens.portfolio.overview.check-available-assets')}
                  size={BaseButtonSize.large}
                  onPress={goToMarket}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
      <BottomSheetModal
        ref={BottomSheetRef}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        backgroundStyle={styles.sheetBgStyle}
        enablePanDownToClose
        onDismiss={onClose}
        snapPoints={[296]}
        handleIndicatorStyle={styles.indicator}
        backdropComponent={SheetBackdrop}
      >
        <View testID={testIDs.portfolio.overview.filterListContainer} style={styles.filterList}>
          <BaseText testID={testIDs.portfolio.overview.filterListTitle} variant={BaseTextVariant.captionSemiBold}>
            {t('screens.portfolio.overview.select-view')}
          </BaseText>
          {viewItems.map((data: ViewItemProps) => (
            <ViewItem key={String(data.id)} data={data} />
          ))}
        </View>
      </BottomSheetModal>
      {showGuideline && renderGuideline()}
    </View>
  );
};

export default OverviewSceen;
