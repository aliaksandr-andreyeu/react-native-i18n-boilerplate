import { actions } from '@/store';

const {
  wallet: {
    useGetWalletAccountsMutation,
    useGetTradingAccountsMutation,
    useGetCashbackAccountsMutation,
    useGetRewardsAccountsMutation
  }
} = actions;

const useCallAccountWallets = () => {
  const [getWalletAccounts] = useGetWalletAccountsMutation();
  const [getTradingAccounts] = useGetTradingAccountsMutation();
  const [getCashbackAccounts] = useGetCashbackAccountsMutation();
  const [getRewardsAccounts] = useGetRewardsAccountsMutation();

  const callWallets = async () => {
    await Promise.all([getWalletAccounts(), getRewardsAccounts(), getTradingAccounts(), getCashbackAccounts()]);
  };

  return callWallets;
};

export default useCallAccountWallets;
