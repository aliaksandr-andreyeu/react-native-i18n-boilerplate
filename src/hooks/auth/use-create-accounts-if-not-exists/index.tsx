import { useMemo } from 'react';
import { useAppSelector } from '@/hooks';
import { actions } from '@/store';
import { ClientData } from '@/store/api';

const {
  wallet: { useGetWalletAccountsMutation, useGetTradingAccountsMutation, useCreateNewAccount },
  portfolio: { useProfileQuery }
} = actions;

const useCreateAccountsIfNotExists = () => {
  const [getWalletAccounts] = useGetWalletAccountsMutation({});
  const [getTradingAccounts] = useGetTradingAccountsMutation({});
  const [createNewAccount] = useCreateNewAccount({});
  const [getProfile] = useProfileQuery({});

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const common = useAppSelector((state) => state.common);
  const { config } = common || {};

  const primaryAccountId = useMemo(() => {
    return config?.trading?.primaryAccount;
  }, [config]);

  const walletTypeId = useMemo(() => {
    return config?.trading?.walletTypeIds?.find((el: number) => el);
  }, [config]);

  const createAccountsIfNotExists = async () => {
    if (!isAuthorized || !walletTypeId || !primaryAccountId) {
      return;
    }

    let clientIsVerified = undefined;

    try {
      const client = (await getProfile().unwrap()) as ClientData;

      clientIsVerified = client?.isVerified;

      const walletAccounts = await getWalletAccounts().unwrap();
      const liveAccounts = await getTradingAccounts().unwrap();

      const walletAccountsExist = walletAccounts?.find((el) => `${el.typeId}` === `${walletTypeId}`);
      const primaryAccountExist = liveAccounts?.find((el) => `${el.typeId}` === `${primaryAccountId}`);

      if (!walletAccountsExist) {
        await createNewAccount({
          typeId: walletTypeId,
          leverage: config.trading?.walletLeverage,
          currency: 'USD',
          ibId: 0
        });
      }

      if (!primaryAccountExist && clientIsVerified) {
        await createNewAccount({
          typeId: primaryAccountId,
          leverage: config.trading?.primaryAccountLeverage,
          currency: 'USD',
          ibId: 0
        });
      }

      return { success: true, isVerified: clientIsVerified };
    } catch (error) {
      console.error(error);
      return { success: false, isVerified: clientIsVerified };
    }
  };

  return createAccountsIfNotExists;
};

export default useCreateAccountsIfNotExists;
