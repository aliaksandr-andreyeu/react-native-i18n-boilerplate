import React, { FC, ReactNode, useLayoutEffect } from 'react';
import { useAppSelector } from '@/hooks';
import { actions } from '@/store';

const {
  portfolio: { useGetDealsAccountsQuery }
} = actions || {};

interface DataStateProps {
  children?: ReactNode;
}

const DataState: FC<DataStateProps> = ({ children }) => {
  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount } = portfolio || {};
  const { id: userId } = userInfo || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();

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
    getDealsAccountsHandler();
  }, [userId, selectedAccount]);

  return children ? children : null;
};

export default DataState;
