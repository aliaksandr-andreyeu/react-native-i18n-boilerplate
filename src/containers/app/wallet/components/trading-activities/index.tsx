import React, { useCallback, useLayoutEffect, useMemo, useState, Fragment, memo } from 'react';
import { StyleSheet, TextStyle, ImageStyle, View, ViewStyle } from 'react-native';
import { ParamListBase, useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';
import {
  BaseImage,
  BaseButton,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  BaseTransactionCard,
  BaseTransferCard,
  BaseDealActivityCard
} from '@/components';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useGetRecentActivitiesMutation, useGetTransactionsMutation, useGetTransfersMutation } from '@/store/api';
import { HistoryDataItem, TransactionColumnTitle, TransferColumnTitle } from '@/containers/app/wallet/recent-activity';
import moment from 'moment';
import { useAppSelector, useCommonStyles } from '@/hooks';
import { images } from '@/assets';
import { TransactionsData, TransfersData } from '@/store/slices/wallet/types';
import { transactionsParser, transfersParser } from '@/helpers';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { DealsInfo } from '@/store/slices/portfolio/types';
import { StackScreenProps } from '@react-navigation/stack';
import { FlatList } from 'react-native-gesture-handler';
import { TransferTypes } from '@/components/molecules/transfer-card';
import Config from 'react-native-config';

const { WELCOME_TYPE_ID } = Config;

type TradingAccountOverviewScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.TradingAccountOverview
>;

const TradingActivities = ({
  navigation,
  route,
  loginSid = undefined,
  transferType = 'default'
}: {
  navigation: TradingAccountOverviewScreenProps['navigation'];
  route: TradingAccountOverviewScreenProps['route'];
  loginSid?: string;
  transferType?: TransferTypes;
}) => {
  const { params } = route || {};
  const { login = '' } = params || {};

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { blue, graphite }
  } = theme || {};

  const [dateKey, setDateKey] = useState<string | undefined>(undefined);
  const [accountKey, setAccountKey] = useState<string | undefined>(undefined);
  const [createdAtKey, setCreatedAtKey] = useState<string | undefined>(undefined);
  const [createdAtValue, setCreatedAtValue] = useState<string | undefined>(undefined);

  const [transactionsLimit, setTransactionsLimit] = useState<number>(20);
  const [isTransactions, setTransactions] = useState<boolean | undefined>(undefined);

  const [dealsLimit, setDealsLimit] = useState<number>(20);
  const [isClosedDeals, setClosedDeals] = useState<boolean | undefined>(undefined);

  const [historyData, setHistoryData] = useState<HistoryDataItem[] | undefined>(undefined);

  const isLoading = useMemo(() => Boolean(historyData === undefined), [historyData]);
  const isEmpty = useMemo(
    () => Boolean(historyData && Array.isArray(historyData) && historyData.length === 0),
    [historyData]
  );

  const [getTransactions, transactionsResponse] = useGetTransactionsMutation({});
  const [getTransfers, transfersResponse] = useGetTransfersMutation({});
  const [getRecentActivities, recentActivitiesResponse] = useGetRecentActivitiesMutation();

  const { accounts, paymentMethods = [], tradingAccounts = [] } = useAppSelector((state) => state.wallet);
  const {
    wallet: walletAccount,
    trading: tradingAccount,
    cashback: cashbackAccount,
    rewards: rewardsAccount,
    contest: contestAccount,
    demoContest: demoContestAccount
  } = accounts || {};

  const { userInfo, tradingAssets } = useAppSelector((state) => state.portfolio);
  const { registrationDate } = userInfo || {};

  const accountId = login ? Number(login) : null;

  const getAsset = useCallback(
    (symbol: string) => {
      return tradingAssets.find((asset) => asset.systemName === symbol);
    },
    [tradingAssets]
  );

  const transactionsSortingField = useMemo(() => {
    if (createdAtKey) {
      return createdAtKey;
    }
    return undefined;
  }, [createdAtKey]);

  const transactionsFiltersField = useMemo(() => {
    if (createdAtKey && createdAtValue) {
      return createdAtKey;
    }
    return undefined;
  }, [createdAtKey, createdAtValue]);

  const transfersSortingField = useMemo(() => {
    if (dateKey) {
      return dateKey;
    }
    return undefined;
  }, [dateKey]);

  const transfersFiltersField = useMemo(() => {
    if (dateKey) {
      return dateKey;
    }
    return undefined;
  }, [dateKey]);

  const getCreatedAtKey = () => {
    if (createdAtKey) {
      return;
    }

    const { data } = transactionsResponse || {};
    const { columns = [] } = data || {};

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return;
    }

    const createdAtData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.createdAt.toLowerCase()
    );
    const createdAt = createdAtData.find((el) => el);
    const { key } = createdAt || {};

    if (key === undefined) {
      return;
    }

    setCreatedAtKey(key);
  };

  const getAccountKey = () => {
    if (accountKey) {
      return;
    }

    const { data } = transactionsResponse || {};
    const { columns = [] } = data || {};

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return;
    }

    const accountData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.account.toLowerCase()
    );
    const account = accountData.find((el) => el);
    const { key } = account || {};

    if (key === undefined) {
      return;
    }

    setAccountKey(key);
  };

  const getDateKey = () => {
    if (dateKey) {
      return;
    }

    const { data } = transfersResponse || {};
    const { columns = [] } = data || {};

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return;
    }

    const dateData = columns.filter((column) => column.title.toLowerCase() === TransferColumnTitle.date.toLowerCase());
    const dateItem = dateData.find((el) => el);
    const { key } = dateItem || {};

    if (key === undefined) {
      return;
    }

    setDateKey(key);
  };

  const getCreatedAtValue = () => {
    if (!createdAtKey || createdAtValue) {
      return;
    }

    const { data } = transactionsResponse || {};
    const { columns = [], rows = [] } = data || {};

    const { loginSid: storedTradingLoginSid } = tradingAccount || {};

    const tradingLoginSid = loginSid || storedTradingLoginSid;

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return;
    }

    if (!tradingLoginSid) {
      return;
    }

    const accountData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.account.toLowerCase()
    );
    const account = accountData.find((el) => el);
    const { key: accountKey } = account || {};

    const statusData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.status.toLowerCase()
    );
    const status = statusData.find((el) => el);
    const { key: statusKey } = status || {};

    if (!(rows && Array.isArray(rows) && rows.length > 0)) {
      if (transactionsLimit >= 60) {
        return setTransactions(false);
      }
      return setTransactionsLimit((prev) => prev + 20);
    }

    const filteredRows = rows
      .filter((row) => {
        if (accountKey) {
          const accountItemData = row.data.filter((item) => item.key === accountKey);
          const accountItem = accountItemData.find((el) => el);
          if (accountItem) {
            if (accountItem.value.toLowerCase() === tradingLoginSid) {
              return row;
            }
          }
        }

        return false;
      })
      .filter((row) => {
        if (statusKey) {
          const statusItemData = row.data.filter((item) => item.key === statusKey);
          const statusItem = statusItemData.find((el) => el);
          if (statusItem) {
            if (statusItem.value.toLowerCase() !== 'fresh') {
              return row;
            }
          }
        }
        return false;
      });

    if (filteredRows?.length === 0) {
      if (transactionsLimit >= 60) {
        return setTransactions(false);
      }
      return setTransactionsLimit((prev) => prev + 20);
    }

    let createdAtValueItem: string | undefined = undefined;

    filteredRows.find((el) => {
      if (createdAtValueItem) {
        return;
      }
      const itemData = el.data.find((item) => item.key === createdAtKey);
      const { value } = itemData || {};
      if (value) {
        createdAtValueItem = value;
      }
    });

    if (!createdAtValueItem) {
      return setTransactions(false);
    }

    setCreatedAtValue(createdAtValueItem);
    setTransactions(true);
  };

  const getClosedDeals = () => {
    if (isClosedDeals) {
      return;
    }

    const { data } = recentActivitiesResponse || {};

    if (!data) {
      return;
    }

    const closedDeals = data.filter((deal: DealsInfo) => deal.entry === 1);

    if (!(closedDeals && Array.isArray(closedDeals) && closedDeals.length > 0)) {
      if (dealsLimit >= 60) {
        return setClosedDeals(false);
      }
      return setDealsLimit((prev) => prev + 20);
    }
    setClosedDeals(true);
  };

  const getTransactionsHandler = async () => {
    try {
      await getTransactions({
        limit: transactionsLimit,
        sortingField: transactionsSortingField,
        filtersField: transactionsFiltersField,
        extraFilters: [
          {
            field: accountKey || '',
            modificator: 'Equals',
            value: [loginSid || '']
          }
        ]
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTransfersHandler = async () => {
    try {
      await getTransfers({
        limit: transactionsLimit,
        sortingField: transfersSortingField,
        filtersField: transfersFiltersField,
        filtersValue: [loginSid || '']
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getRecentActivitiesHandler = async () => {
    if (!accountId) {
      return;
    }
    try {
      await getRecentActivities({
        accountId,
        count: dealsLimit
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getTransactionsHandler();
    getTransfersHandler();
  }, [transactionsLimit, loginSid]);

  useLayoutEffect(() => {
    getRecentActivitiesHandler();
  }, [accountId]);

  useLayoutEffect(() => {
    getCreatedAtKey();
    getAccountKey();
  }, [createdAtKey, accountKey, transactionsResponse]);

  useLayoutEffect(() => {
    getDateKey();
  }, [dateKey, transfersResponse]);

  useLayoutEffect(() => {
    if (!createdAtKey || !accountKey) {
      return;
    }
    getTransactionsHandler();
  }, [createdAtKey, transactionsLimit, loginSid, accountKey]);

  useLayoutEffect(() => {
    getCreatedAtValue();
  }, [createdAtKey, createdAtValue, tradingAccount, loginSid, transactionsResponse]);

  useLayoutEffect(() => {
    if (createdAtValue) {
      return;
    }
    getTransactionsHandler();
  }, [createdAtValue, transactionsLimit, loginSid]);

  useLayoutEffect(() => {
    getClosedDeals();
  }, [recentActivitiesResponse]);

  useLayoutEffect(() => {
    if (isClosedDeals) {
      return;
    }
    getRecentActivitiesHandler();
  }, [dealsLimit, accountId]);

  const filtersValue = useMemo(() => {
    if (!createdAtValue || !registrationDate) {
      return undefined;
    }

    const firstDate = new Date(registrationDate);
    const lastDate = new Date(createdAtValue);

    const filterRange = [moment(firstDate).format('YYYY-MM-DD'), moment(lastDate).format('YYYY-MM-DD')].join(',');

    return [filterRange];
  }, [createdAtValue, registrationDate]);

  const getHistoryData = (
    prevData: HistoryDataItem[] | undefined,
    newData: HistoryDataItem[] | undefined
  ): HistoryDataItem[] => {
    const data = newData || [];

    const rawData = prevData || [];

    const resultData = [...rawData, ...data];

    const filteredData = resultData.reduce((acc, current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as HistoryDataItem[]);

    const sortedData = filteredData
      .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
      .slice(0, 4);

    return sortedData;
  };

  const checkTransactionsData = (data: TransactionsData) => {
    const { columns = [], rows = [] } = data || {};

    const { loginSid: storedTradingLoginSid } = tradingAccount || {};

    const tradingLoginSid = loginSid || storedTradingLoginSid;

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return [];
    }

    if (!tradingLoginSid) {
      return [];
    }

    const typeData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.type.toLowerCase()
    );
    const type = typeData.find((el) => el);
    const { key: typeKey } = type || {};

    const accountData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.account.toLowerCase()
    );
    const account = accountData.find((el) => el);
    const { key: accountKey } = account || {};

    const statusData = columns.filter(
      (column) => column.title.toLowerCase() === TransactionColumnTitle.status.toLowerCase()
    );
    const status = statusData.find((el) => el);
    const { key: statusKey } = status || {};

    if (!(rows && Array.isArray(rows) && rows.length > 0)) {
      return [];
    }

    const filteredRows = rows
      .filter((row) => {
        if (typeKey) {
          const typeItemData = row.data.filter((item) => item.key === typeKey);
          const typeItem = typeItemData.find((el) => el);
          if (typeItem) {
            if (
              typeItem.value.toLowerCase() !== 'transfer in' &&
              typeItem.value.toLowerCase() !== 'transfer out' &&
              typeItem.value.toLowerCase() !== 'cashback transfer to account' &&
              typeItem.value.toLowerCase() !== 'cashback transfer to account out' &&
              typeItem.value.toLowerCase() !== 'ib transfer to account' &&
              typeItem.value.toLowerCase() !== 'ib transfer to account out'
            ) {
              return row;
            }
          }
        }

        return false;
      })
      .filter((row) => {
        if (accountKey) {
          const accountItemData = row.data.filter((item) => item.key === accountKey);
          const accountItem = accountItemData.find((el) => el);
          if (accountItem) {
            if (accountItem.value.toLowerCase() === tradingLoginSid) {
              return row;
            }
          }
        }

        return false;
      })
      .filter((row) => {
        if (statusKey) {
          const statusItemData = row.data.filter((item) => item.key === statusKey);
          const statusItem = statusItemData.find((el) => el);
          if (statusItem) {
            if (statusItem.value.toLowerCase() !== 'fresh') {
              return row;
            }
          }
        }
        return false;
      })
      .map((row) => {
        const modifiedData = row.data.map((item) => {
          const { key, value } = item || {};

          if (accountKey && key === accountKey) {
            return {
              ...item,
              value: 'live'
            };
          }

          return item;
        });

        return {
          data: modifiedData
        };
      });

    const parsedData = transactionsParser(columns, filteredRows);

    const modifiedData = parsedData.map((el) => {
      const { paymentSystem } = el || {};

      if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
        const paymentMethodItem = paymentMethods.find((el) => el.systemName === paymentSystem);

        const { displayName, logo } = paymentMethodItem || {};

        if (displayName) {
          return {
            ...el,
            logo,
            paymentSystem: displayName
          };
        }
      }

      return el;
    });

    return modifiedData;
  };

  const checkTransfersData = (data: TransfersData) => {
    const { columns = [], rows = [] } = data || {};

    const { loginSid: storedTradingLoginSid } = tradingAccount || {};

    const tradingLoginSid = loginSid || storedTradingLoginSid;

    const { loginSid: walletLoginSid } = walletAccount || {};
    const { loginSid: cashbackLoginSid } = cashbackAccount || {};
    const { loginSid: rewardsLoginSid } = rewardsAccount || {};
    const contestLoginSids = contestAccount.map((item) => item.loginSid);
    const demoContestLoginSids = demoContestAccount.map((item) => item.loginSid);

    if (!(columns && Array.isArray(columns) && columns.length > 0)) {
      return [];
    }

    if (!tradingLoginSid) {
      return [];
    }

    const fromAccountData = columns.filter(
      (column) => column.title.toLowerCase() === TransferColumnTitle.fromAccount.toLowerCase()
    );
    const fromAccount = fromAccountData.find((el) => el);
    const { key: fromAccountKey } = fromAccount || {};

    const toAccountData = columns.filter(
      (column) => column.title.toLowerCase() === TransferColumnTitle.toAccount.toLowerCase()
    );
    const toAccount = toAccountData.find((el) => el);
    const { key: toAccountKey } = toAccount || {};

    if (!(rows && Array.isArray(rows) && rows.length > 0)) {
      return [];
    }

    const filteredRows = rows
      .filter((row) => {
        let isFromAccount = false;
        let isToAccount = false;

        if (fromAccountKey) {
          const fromAccountItemData = row.data.filter((item) => item.key === fromAccountKey);
          const fromAccountItem = fromAccountItemData.find((el) => el);
          if (fromAccountItem) {
            if (fromAccountItem.value.toLowerCase() === tradingLoginSid) {
              isFromAccount = true;
            }
          }
        }

        if (toAccountKey) {
          const toAccountItemData = row.data.filter((item) => item.key === toAccountKey);
          const toAccountItem = toAccountItemData.find((el) => el);
          if (toAccountItem) {
            if (toAccountItem.value.toLowerCase() === tradingLoginSid) {
              isToAccount = true;
            }
          }
        }

        if (isFromAccount || isToAccount) {
          return row;
        }

        return false;
      })
      .map((row) => {
        const modifiedData = row.data.map((item) => {
          const { key, value } = item || {};

          let accountValue = value;
          let icon: string | null = '';
          let colour: string | null = '';

          if ((fromAccountKey && key === fromAccountKey) || (toAccountKey && key === toAccountKey)) {
            const tradingLogin = tradingAccounts.find((el) => el.loginSid === value.toLowerCase());
            const isWelcomeAccount = `${tradingLogin?.typeId}` === `${WELCOME_TYPE_ID}`;

            const lowercaseValue = value.toLowerCase();

            icon = tradingLogin?.icon || null;
            colour = tradingLogin?.colour || null;

            if (demoContestLoginSids.includes(lowercaseValue)) {
              accountValue = 'demoContest';
            } else if (contestLoginSids.includes(lowercaseValue)) {
              accountValue = 'contest';
            } else if (tradingLogin) {
              if (isWelcomeAccount) accountValue = 'welcome';
              else accountValue = 'live';
            } else if (lowercaseValue === walletLoginSid) {
              accountValue = 'wallet';
            } else if (lowercaseValue === cashbackLoginSid) {
              accountValue = 'cashback';
            } else if (lowercaseValue === rewardsLoginSid) {
              accountValue = 'ib';
            }
          }

          return {
            ...item,
            value: accountValue,
            icon: icon,
            colour: colour
          };
        });

        return {
          data: modifiedData
        };
      });

    const parsedData = transfersParser(columns, filteredRows);

    return parsedData;
  };

  const checkRecentActivityData = (data: DealsInfo[]) => {
    const closedDeals = data.filter((deal: DealsInfo) => deal.entry === 1);

    const modifiedData = closedDeals.map((el) => {
      const { symbol, time: createdAt, profit, positionId, ticket } = el || {};

      const asset = getAsset(symbol);
      const { image: assetLogo } = asset || {};

      const { currency = 'USD' } = tradingAccount || {};

      return {
        ...(assetLogo && { logo: assetLogo }),
        id: String(positionId),
        type: 'deal',
        positionId,
        ticket,
        symbol,
        status: 'approved',
        createdAt,
        amount: String(profit),
        currency,
        declineReason: null
      };
    });

    return modifiedData;
  };

  const getHistoryDataHandler = async () => {
    if (isClosedDeals === false && isTransactions === false) {
      return setHistoryData([]);
    }

    if (!filtersValue || !accountId || isClosedDeals === undefined || isTransactions === undefined) {
      return;
    }

    try {
      const transactionsResponse = await getTransactions({
        limit: transactionsLimit,
        sortingField: transactionsSortingField,
        filtersField: transactionsFiltersField,
        filtersValue
      }).unwrap();

      const transfersResponse = await getTransfers({
        limit: transactionsLimit,
        filtersField: transfersFiltersField,
        filtersValue,
        sortingField: transfersSortingField
      }).unwrap();

      const recentResponse = await getRecentActivities({
        accountId,
        count: dealsLimit
      }).unwrap();

      const transactionsData = checkTransactionsData(transactionsResponse);
      const transfersData = checkTransfersData(transfersResponse);
      const recentActivityData = checkRecentActivityData(recentResponse);

      const commonData = [...transactionsData, ...transfersData, ...recentActivityData];

      setHistoryData((prevData) => {
        const sortedData = getHistoryData(prevData, commonData);

        if (sortedData?.length < 10) {
          if (transactionsLimit <= 60 || dealsLimit <= 60) {
            if (transactionsLimit <= 60) {
              setTransactionsLimit((prev) => prev + 20);
            }

            if (dealsLimit <= 60) {
              setDealsLimit((prev) => prev + 20);
            }
            return;
          } else {
            return sortedData;
          }
        }
        return sortedData;
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getHistoryDataHandler();
  }, [filtersValue, accountId, isTransactions, isClosedDeals, transactionsLimit, dealsLimit, loginSid]);

  const LoadingDataComponent = useCallback(() => {
    return (
      <View style={styles.loaderBox}>
        <ContentLoader
          speed={2}
          width={'100%'}
          height={'100%'}
          backgroundColor={'#E2E6F2'}
          foregroundColor={graphite['050']}
        >
          <Rect x={0} y={0} rx='12' ry='12' width={'100%'} height={'100%'} />
        </ContentLoader>
      </View>
    );
  }, [blue, graphite]);

  const EmptyDataComponent = useCallback(() => {
    return (
      <View style={styles.emptyBox}>
        <BaseImage source={images.search} style={styles.emptyImg} />
        <View style={styles.emptyTextBox}>
          <BaseText style={styles.textAlign}>{t('screens.recent-activity.nothing-here')}</BaseText>
        </View>
      </View>
    );
  }, [t, styles]);

  const _keyExtractor = useCallback((item: HistoryDataItem, index: number) => `${item.id}-${index}`, []);

  const _renderItem = useCallback(
    ({ item }: { item: HistoryDataItem }) => {
      const { id, type, createdAt } = item || {};

      const isTransfer = type === 'transfer';
      const isDeal = type === 'deal';

      const now = moment();
      const today = now.clone().startOf('day');
      const isTodayDate = moment(createdAt).isSame(today, 'd');

      return isTransfer ? (
        <BaseTransferCard
          key={id}
          data={item}
          isTrading={true}
          transferType={transferType}
          timeFormat={isTodayDate ? 'HH:mm' : 'DD MMM YYYY, HH:mm'}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.RecentActivityDetails, {
              ...item,
              isTransfer: true,
              isTrading: true,
              isContest: transferType === 'contest',
              isWelcome: transferType === 'welcome'
            });
          }}
        />
      ) : isDeal ? (
        <BaseDealActivityCard
          key={id}
          data={item}
          timeFormat={isTodayDate ? 'HH:mm' : 'DD MMM YYYY, HH:mm'}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.PositionInfo, {
              positionTicket: item.ticket as number,
              positionId: item.positionId as number,
              title: item.symbol as string,
              isPosition: true,
              isClosed: true,
              account: accountId
            });
          }}
        />
      ) : (
        <BaseTransactionCard
          key={id}
          data={item}
          timeFormat={isTodayDate ? 'HH:mm' : 'DD MMM YYYY, HH:mm'}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.RecentActivityDetails, {
              ...item,
              isTransfer: false,
              isTrading: true
            });
          }}
        />
      );
    },
    [accountId]
  );

  const funded = useMemo(() => !!tradingAccount.firstDepositDate, [tradingAccount.firstDepositDate]);

  const goToRecentActivities = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.TradingRecentActivity, { loginSid, login, transferType });
  }, [navigation, loginSid, login, transferType]);

  return (
    <View style={styles.container}>
      <BaseText variant={BaseTextVariant.captionSemiBold}>
        {t('screens.trading-account-overview.recent-activity')}
      </BaseText>
      {isLoading && funded ? (
        <LoadingDataComponent />
      ) : isEmpty || !funded ? (
        <EmptyDataComponent />
      ) : (
        <Fragment>
          <View style={styles.shadow}>
            <FlatList
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollBox}
              data={historyData}
              keyExtractor={_keyExtractor}
              renderItem={_renderItem}
            />
          </View>
          <BaseButton
            label={t('screens.trading-account-overview.see-all')}
            type={BaseButtonType.link}
            onPress={goToRecentActivities}
          />
        </Fragment>
      )}
    </View>
  );
};

interface Styles {
  shadow: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  emptyBox: ViewStyle;
  textAlign: TextStyle;
  emptyImg: ImageStyle;
  emptyTextBox: TextStyle;
  loaderBox: ViewStyle;
  search: ImageStyle;
  empty: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    shadow: {
      ...shadow6Style //isIOS
    },
    container: {
      gap: 8,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    scrollContent: {
      paddingBottom: 0
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1,
      marginTop: 8,
      marginBottom: 4,
      zIndex: 1,
      backgroundColor: base.white,
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      ...shadow6Style //isAndroid
    },
    emptyBox: {
      marginTop: 32,
      gap: 16
    },
    textAlign: {
      textAlign: 'center'
    },
    emptyImg: {
      width: 90,
      height: 90,
      alignSelf: 'center'
    },
    emptyTextBox: {
      gap: 8
    },
    loaderBox: {
      marginTop: 8,
      flex: 1,
      height: 240
    },
    search: { width: 90, height: 90 },
    empty: {
      alignSelf: 'center',
      marginVertical: 32,
      gap: 16
    }
  });
};

export default memo(TradingActivities);
