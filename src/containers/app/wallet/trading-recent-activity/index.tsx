import React, { FC, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useFocusEffect } from '@react-navigation/native';
import TradingRecentActivityScreen from './screen';
import type { TransfersData, TransactionsData } from '@/store/slices/wallet/types';
import { actions } from '@/store';
import moment from 'moment';
import { useAppSelector } from '@/hooks';
import { HistoryRows, transactionsParser, transfersParser } from '@/helpers';
import { DealsInfo } from '@/store/slices/portfolio/types';
import { useTranslation } from 'react-i18next';
import Config from 'react-native-config';

const {
  WELCOME_TYPE_ID
} = Config;

type TradingRecentActivityProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.TradingRecentActivity>;

const {
  wallet: {
    useGetWalletAccountsMutation,
    useGetTradingAccountsMutation,
    useGetCashbackAccountsMutation,
    useGetRewardsAccountsMutation,
    useGetTransactionsMutation,
    useGetTransfersMutation
  },
  portfolio: { useProfileQuery },
  market: { useGetRecentActivitiesMutation }
} = actions;

export enum TransactionColumnTitle {
  id = 'Id',
  type = 'Type',
  status = 'Status',
  paymentSystem = 'Payment System',
  account = 'Account',
  createdAt = 'Created At',
  processedAt = 'Processed At',
  amount = 'Amount',
  currency = 'Currency',
  canBeCanceled = 'Can Be Canceled',
  approveReason = 'Approve Reason',
  declineReason = 'Decline Reason'
}

export enum TransferColumnTitle {
  id = 'Id',
  fromAccount = 'From Account',
  toAccount = 'To Account',
  status = 'Status',
  date = 'Date',
  amount = 'Amount',
  currency = 'Currency',
  declineReason = 'Decline Reason'
}

export interface HistoryDataItem {
  id: string;
  type: string;
  status: string;
  paymentSystem?: string;
  ticket?: number;
  positionId?: number;
  logo?: string;
  symbol?: string;
  account?: string;
  fromAccount?: string;
  toAccount?: string;
  createdAt: string | Date;
  processedAt?: string;
  amount: string;
  currency: string;
  canBeCanceled?: string;
  approveReason?: string;
  declineReason: string | null;
}

export interface HistoryData {
  title: string;
  ts: number;
  data: {
    item: HistoryDataItem[];
  }[];
}

export interface DateRangeColors {
  [key: string]: { color: string; textColor: string };
}

export type DateRange = [string, string, DateRangeColors];

const TradingRecentActivity: FC<TradingRecentActivityProps> = ({ route, navigation }) => {
  const [dateRange, setDateRange] = useState<DateRange>(['', '', {}]);

  const [dateKey, setDateKey] = useState<string | undefined>(undefined);
  const [createdAtKey, setCreatedAtKey] = useState<string | undefined>(undefined);
  const [accountKey, setAccountKey] = useState<string | undefined>(undefined);
  const [createdAtValue, setCreatedAtValue] = useState<string | undefined>(undefined);

  const [transactionsLimit, setTransactionsLimit] = useState<number>(20);
  const [isTransactions, setTransactions] = useState<boolean | undefined>(undefined);

  const [dealsLimit, setDealsLimit] = useState<number>(20);
  const [isClosedDeals, setClosedDeals] = useState<boolean | undefined>(undefined);

  const [offset, setOffset] = useState<number>(0);

  const [fullList, setFullList] = useState<boolean>(false);

  const [historyData, setHistoryData] = useState<HistoryData[] | undefined>(undefined);

  const { t } = useTranslation();

  const [getProfile] = useProfileQuery({});

  const [getWalletAccounts] = useGetWalletAccountsMutation({});
  const [getTradingAccounts] = useGetTradingAccountsMutation({});
  const [getCashbackAccounts] = useGetCashbackAccountsMutation({});
  const [getRewardsAccounts] = useGetRewardsAccountsMutation({});

  const [getTransactions, transactionsResponse] = useGetTransactionsMutation({});
  const [getTransfers, transfersResponse] = useGetTransfersMutation({});
  const [getRecentActivities, recentActivitiesResponse] = useGetRecentActivitiesMutation();

  const loginSid = route.params.loginSid || '';
  const login = route.params.login || '';
  const transferType = route.params?.transferType || 'default';

  const wallet = useAppSelector((state) => state.wallet);
  const { accounts, tradingAccounts, paymentMethods } = wallet || {};
  const {
    trading: tradingAccount,
    wallet: walletAccount,
    cashback: cashbackAccount,
    rewards: rewardsAccount,
    contest: contestAccount,
    demoContest: demoContestAccount
  } = accounts || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount: accountId = null, tradingAssets } = portfolio || {};
  const { registrationDate } = userInfo || {};

  const setInitialState = () => {
    setDateRange(['', '', {}]);
    setOffset(0);
    setFullList(false);
    setHistoryData(undefined);
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
    }, [route, navigation])
  );

  const getAsset = useCallback(
    (symbol: string) => {
      return tradingAssets.find((asset) => asset.systemName === symbol);
    },
    [tradingAssets]
  );

  const getSectionsData = (
    prevData: HistoryData[] | undefined,
    newData: HistoryDataItem[] | undefined
  ): HistoryData[] => {
    const data = newData || [];

    const rawData = prevData || [];

    const sections = new Map(rawData.map((historyItem) => [historyItem.title, historyItem]));

    for (let i = 0; i < data.length; i++) {
      const historyItem = data[i];

      let { createdAt, id } = historyItem;

      const now = moment();
      const today = now.clone().startOf('day');
      const yesterday = now.clone().subtract(1, 'days').startOf('day');

      const isTodayDate = moment(createdAt).isSame(today, 'd');
      const isYesterdayDate = moment(createdAt).isSame(yesterday, 'd');

      let title = moment(createdAt).format('DD MMMM YYYY');

      if (isTodayDate) {
        title = t('screens.recent-activity.today');
      } else if (isYesterdayDate) {
        title = t('screens.recent-activity.yesterday');
      }

      if (sections.has(title)) {
        const existingHistoryItem = sections.get(title);
        if (existingHistoryItem) {
          const dataItem = existingHistoryItem.data[0];

          const { item } = dataItem || {};
          if (item) {
            const hasDuplicate = new Set(item.map((el) => el.id)).has(id);
            if (!hasDuplicate) {
              existingHistoryItem.data[0].item.push(historyItem);
            }
          }
        }
      } else {
        const ts = moment(createdAt).valueOf();

        sections.set(title, { title, ts, data: [{ item: [historyItem] }] } as HistoryData);
      }
    }

    const filteredData = Array.from(sections.values());

    const sortedData = filteredData
      .sort((a, b) => b.ts - a.ts)
      .map((historyItem) => {
        const { data, ts, title } = historyItem || {};
        if (data && Array.isArray(data)) {
          const dataItems = data.find((el) => el);
          if (dataItems) {
            const { item } = dataItems || {};
            if (item && Array.isArray(item)) {
              const sortedDataItems = item.sort(
                (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
              );
              return {
                data: [
                  {
                    item: sortedDataItems
                  }
                ],
                ts,
                title
              };
            }
          }
        }
        return historyItem;
      });

    return sortedData;
  };

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

  const limit = useMemo(() => {
    if (createdAtKey && !createdAtValue) {
      return transactionsLimit;
    }
    return undefined;
  }, [createdAtKey, createdAtValue, transactionsLimit]);

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

  const filtersValue = useMemo(() => {
    if (!createdAtValue || !registrationDate) {
      return undefined;
    }

    let filterRange = undefined;

    const firstDateRange = dateRange[0];
    const secondDateRange = dateRange[1];

    if (firstDateRange) {
      filterRange = [firstDateRange, secondDateRange ? secondDateRange : firstDateRange].join(',');
    } else {
      const regDate = new Date(registrationDate);
      const regDateTS = moment(regDate).valueOf();

      const lastDate = new Date(createdAtValue);
      if (offset) {
        lastDate.setUTCMonth(lastDate.getUTCMonth() - (offset - 1));
        lastDate.setUTCDate(0);
      }
      const lastDateTS = moment(lastDate).valueOf();

      let firstDate = new Date(createdAtValue);
      firstDate.setUTCDate(1);
      if (offset) {
        firstDate.setUTCMonth(firstDate.getUTCMonth() - offset);
      }
      const firstDateTS = moment(firstDate).valueOf();

      if (firstDateTS < regDateTS) {
        firstDate = regDate;

        setFullList(true);
      }

      if (lastDateTS === firstDateTS) {
        firstDate.setUTCMonth(firstDate.getUTCMonth() - 1);
      }

      filterRange = [moment(firstDate).format('YYYY-MM-DD'), moment(lastDate).format('YYYY-MM-DD')].join(',');
    }

    return [filterRange];
  }, [createdAtValue, registrationDate, offset, dateRange]);

  const dealsFiltersValue = useMemo(() => {
    if (!registrationDate) {
      return undefined;
    }

    let filterRange = undefined;

    const firstDateRange = dateRange[0];
    const secondDateRange = dateRange[1];

    if (firstDateRange) {
      filterRange = [firstDateRange, secondDateRange ? secondDateRange : firstDateRange].join(',');
    } else {
      const regDate = new Date(registrationDate);
      const regDateTS = moment(regDate).valueOf();

      const lastDate = new Date(Date.now());
      if (offset) {
        lastDate.setUTCMonth(lastDate.getUTCMonth() - (offset - 1));
        lastDate.setUTCDate(0);
      }
      const lastDateTS = moment(lastDate).valueOf();

      let firstDate = new Date(Date.now());
      firstDate.setUTCDate(1);
      if (offset) {
        firstDate.setUTCMonth(firstDate.getUTCMonth() - offset);
      }
      const firstDateTS = moment(firstDate).valueOf();

      if (firstDateTS < regDateTS) {
        firstDate = regDate;

        setFullList(true);
      }

      if (lastDateTS === firstDateTS) {
        firstDate.setUTCMonth(firstDate.getUTCMonth() - 1);
      }

      filterRange = [moment(firstDate).format('YYYY-MM-DD'), moment(lastDate).format('YYYY-MM-DD')].join(',');
    }

    return [filterRange];
  }, [registrationDate, offset, dateRange]);

  const getProfileHandler = async () => {
    try {
      await getProfile();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getWalletAccountsHandler = async () => {
    try {
      await getWalletAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTradingAccountsHandler = async () => {
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getCashbackAccountsHandler = async () => {
    try {
      await getCashbackAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getRewardsAccountsHandler = async () => {
    try {
      await getRewardsAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getRecentActivitiesHandler = async () => {
    const accId = login || accountId;
    if (!accId) {
      return;
    }
    try {
      await getRecentActivities({
        accountId: Number(accId),
        count: dealsLimit
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTransactionsHandler = async () => {
    try {
      await getTransactions({
        limit,
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
      await getTransfers({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getProfileHandler();

      getWalletAccountsHandler();
      getTradingAccountsHandler();
      getCashbackAccountsHandler();
      getRewardsAccountsHandler();

      getTransactionsHandler();
      getTransfersHandler();
    }, [route, navigation, loginSid])
  );

  useFocusEffect(
    useCallback(() => {
      getRecentActivitiesHandler();
    }, [route, navigation, accountId, login])
  );

  const getCreatedAtKey = () => {
    if (createdAtKey) {
      return;
    }

    const { data } = transactionsResponse || {};
    const { columns = [], rows = [] } = data || {};

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
    };

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
  }

  const getDateKey = () => {
    if (dateKey) {
      return;
    }

    const { data } = transfersResponse || {};
    const { columns = [], rows = [] } = data || {};

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
    const contestLoginSids = contestAccount.map(item => item.loginSid);
    const demoContestLoginSids = demoContestAccount.map(item => item.loginSid);

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
          let icon: string | null = null;
          let colour: string | null = null;

          if ((fromAccountKey && key === fromAccountKey) || (toAccountKey && key === toAccountKey)) {
            const tradingLogin = tradingAccounts.find((el) => el.loginSid === value.toLowerCase());
            const isWelcomeAccount = `${tradingLogin?.typeId}` === `${WELCOME_TYPE_ID}`;

            const lowerCaseValue = value.toLowerCase();

            icon = tradingLogin?.icon || null;
            colour = tradingLogin?.colour || null;

            if (demoContestLoginSids.includes(lowerCaseValue)) {
              accountValue = 'demoContest'
            } else if (contestLoginSids.includes(lowerCaseValue)) {
              accountValue = 'contest'
            } else if (tradingLogin) {
              if (isWelcomeAccount) accountValue = 'welcome';
              else accountValue = 'live';
            } else if (lowerCaseValue === walletLoginSid) {
              accountValue = 'wallet';
            } else if (lowerCaseValue === cashbackLoginSid) {
              accountValue = 'cashback';
            } else if (lowerCaseValue === rewardsLoginSid) {
              accountValue = 'ib';
            }
          };


          return {
            ...item,
            value: accountValue,
            icon: icon || '',
            colour: colour || ''
          };
        });

        return {
          data: modifiedData
        };
      });

    const parsedData = transfersParser(columns, filteredRows as HistoryRows[]);

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

  const checkFullList = () => {
    const firstDate = dateRange[0];
    if (!firstDate) {
      return;
    }
    setFullList(false);
  };

  useLayoutEffect(() => {
    getCreatedAtKey();
    getAccountKey()
  }, [createdAtKey, accountKey, transactionsResponse]);

  useLayoutEffect(() => {
    getDateKey();
  }, [dateKey, transfersResponse]);

  useLayoutEffect(() => {
    if (!createdAtKey || !accountKey) {
      return;
    }
    getTransactionsHandler();
  }, [createdAtKey, accountKey]);

  useLayoutEffect(() => {
    getCreatedAtValue();
  }, [createdAtKey, createdAtValue, tradingAccount, transactionsResponse, loginSid]);

  useLayoutEffect(() => {
    if (createdAtValue) {
      return;
    }
    getTransactionsHandler();
  }, [transactionsLimit]);

  useLayoutEffect(() => {
    getClosedDeals();
  }, [recentActivitiesResponse]);

  useLayoutEffect(() => {
    if (isClosedDeals) {
      return;
    }
    getRecentActivitiesHandler();
  }, [dealsLimit, accountId, login]);

  useLayoutEffect(() => {
    checkFullList();
  }, [dateRange]);

  const getHistoryDataHandler = async () => {
    if (isClosedDeals === false && isTransactions === false) {
      return setHistoryData([]);
    }

    const accId = login || accountId;

    if (!filtersValue || !dealsFiltersValue || !accId || isClosedDeals === undefined || isTransactions === undefined) {
      return;
    }

    try {
      const transactionsResponse = await getTransactions({
        limit,
        sortingField: transactionsSortingField,
        filtersField: transactionsFiltersField,
        filtersValue
      }).unwrap();

      const transfersResponse = await getTransfers({
        filtersField: transfersFiltersField,
        filtersValue,
        sortingField: transfersSortingField
      }).unwrap();

      const fromTS = moment(new Date(dealsFiltersValue[0].split(',')[0])).valueOf();
      const toTS = moment(new Date(dealsFiltersValue[0].split(',')[1])).valueOf();

      const from = moment(fromTS).startOf('day').unix();
      const to = moment(toTS).endOf('day').unix();

      const recentResponse = await getRecentActivities({
        accountId: Number(accId),
        count: 100,
        from,
        to
      }).unwrap();

      const transactionsData = checkTransactionsData(transactionsResponse);
      const transfersData = checkTransfersData(transfersResponse);
      const recentActivityData = checkRecentActivityData(recentResponse);

      const commonData = [...transactionsData, ...transfersData, ...recentActivityData];

      const firstDateRange = dateRange[0];

      setHistoryData((prevData) => {
        const sortedData = getSectionsData(firstDateRange ? [] : prevData, commonData);

        if (sortedData.length < 5 && !fullList) {
          setOffset((prev) => prev + 1);
        }

        return sortedData;
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getHistoryDataHandler();
  }, [filtersValue, dealsFiltersValue, accountId, isTransactions, isClosedDeals, transactionsLimit, login, loginSid]);

  return (
    <TradingRecentActivityScreen
      route={route}
      navigation={navigation}
      setOffset={setOffset}
      fullList={fullList}
      transferType={transferType}
      history={historyData}
      dateRange={dateRange}
      setDateRange={setDateRange}
      setHistory={setHistoryData}
    />
  );
};

export default TradingRecentActivity;
