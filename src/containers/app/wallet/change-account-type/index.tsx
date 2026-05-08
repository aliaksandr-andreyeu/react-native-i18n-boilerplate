import React, { FC, useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useAppSelector } from '@/hooks';
import ChangeAccountTypeScreen from './screen';
import { BaseLoader } from '@/components';
import { ParsedWalletData } from '@/store/slices/wallet/types';

type ChangeAccountTypeProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.ChangeAccountType>;

const ChangeAccountType: FC<ChangeAccountTypeProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { login } = params || {};

  const wallet = useAppSelector((store) => store.wallet);
  const { accountConfigs, accountTypeId } = wallet || {};

  const portfolio = useAppSelector((store) => store.portfolio);
  const { dealsAccounts = [] } = portfolio || {};

  const currentAccountDeals = dealsAccounts.find((el) => String(el?.accountId) === login);
  const { positions = [] } = currentAccountDeals || {};
  const hasPositions = Boolean(positions?.length > 0);



  const currentAccountConfig = useMemo(
    () => accountConfigs.find((config) => config?.systemTypeId === String(accountTypeId)),
    [accountConfigs, accountTypeId]
  );

  const configData = useMemo(() => {
    const { supportedChangeAccountTypes = [], ...currentAccountData } = currentAccountConfig || {};

    const uniqSupportedChangeAccountTypes = [...new Set(supportedChangeAccountTypes)];

    const currentAccount = { isDefault: true, ...(currentAccountData as ParsedWalletData) };
    const { systemTypeId: currentSystemTypeId } = currentAccount || {};

    const supportedChangeAccountsData = uniqSupportedChangeAccountTypes
      .filter((el) => el.systemTypeId !== currentSystemTypeId)
      .map((el) => ({ isDefault: false, ...el }));

    return [currentAccount, ...supportedChangeAccountsData];
  }, [currentAccountConfig]);

  if (configData?.length === 0 || accountTypeId === undefined || login === undefined) {
    return <BaseLoader active={true} />;
  }

  return (
    <ChangeAccountTypeScreen
      route={route}
      navigation={navigation}
      config={configData}
      currentAccountId={Number(login)}
      hasPositions={hasPositions}
      currentTypeId={accountTypeId}
    />
  );
};

export default ChangeAccountType;
