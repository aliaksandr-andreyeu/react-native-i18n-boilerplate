const wallet = {
  accounts: '/accounts',
  newAccount: '/accounts/new',
  transactions: '/transactions',
  cancelTransaction: (id: string | number) => `/transactions/cancel/${id}`,
  transfers: '/transfers/',
  depositPayments: (loginSID: string) => `/payment-systems/deposit/${loginSID}`,
  paymentMethodConfigs:
    '/ca-payment-method-configs?populate=*&pagination[limit]=-1&&filters[visibilityByJurisdiction][stlucia][$eq]=true',
  unverifiedPaymentMethodConfigs:
    '/ca-unverified-payment-method-configs?populate=*&pagination[limit]=-1&&filters[visibilityByJurisdiction][stlucia][$eq]=true',
  makeDeposit: '/deposit',
  depositFees: '/deposit/fees',
  paymentDetails: (paymentSystemId?: number) => `/payment-details${!!paymentSystemId ? `/${paymentSystemId}` : ''}`,
  withdrawPayments: (loginSID: string) => `/payment-systems/withdrawal/${loginSID}`,
  paymentDetailsConfig: '/payment-details/configs',
  payout: '/payout',
  withdrawalDetail: '/withdrawal/detail',
  upload: '/payment-details/upload',
  transfer: '/transfers/new',
  checkTransfer: '/transfers/check',
  changeGroup: ({ accountId, targetTypeId }: { accountId: string; targetTypeId: number }) => {
    let query = '';
    if (accountId) {
      query = query + `accountId=${accountId}`;
    }
    if (targetTypeId) {
      query = query + `&targetTypeId=${targetTypeId}`;
    }
    return `/User/ChangeGroup${query ? '?' + query : ''}`;
  },
  accountTypeConfig: (typeId: string) => `/account-type-config?populate=*&filters[systemTypeId][eq]=${typeId}`,
  accountTypeConfigs:
    '/account-type-configs?populate[iconMobile]=*&&populate[appDescriptionBlockBackground]=*&populate[accountFeaturesDescription][populate][infoBlockElement][populate]=icon&populate[supportedChangeAccountTypes][populate][iconMobile]=*&populate[supportedChangeAccountTypes][populate][appDescriptionBlockBackground]=*&populate[supportedChangeAccountTypes][populate][accountFeaturesDescription][populate][infoBlockElement][populate]=icon&populate=*'
};

export default wallet;
