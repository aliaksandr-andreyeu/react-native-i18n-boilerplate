import { useMemo } from 'react';
import { useAppSelector } from '../store';
import Config from 'react-native-config';

const { WELCOME_TYPE_ID } = Config;

const useHasBalance = () => {
  const {
    tradingAccounts,
    accounts: { wallet }
  } = useAppSelector((store) => store.wallet);

  const hasBalance = useMemo(() => {
    if (!tradingAccounts.length) return false;
    for (let i = 0; i < tradingAccounts.length; i++) {
      const account = tradingAccounts[i];
      if (`${account.typeId}` === `${WELCOME_TYPE_ID}`) continue;
      if (account.balance > 0) return true;
    }
    return wallet.balance > 0;
  }, [tradingAccounts]);

  return hasBalance;
};

export default useHasBalance;
