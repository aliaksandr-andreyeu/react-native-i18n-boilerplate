const customer = {
  getPreferences: (entity: string) => `/v1/customers/${entity}/subscription_preferences?id_type=email`,
  setCustomerSettings: `/api/v2/entity`
};

export default customer;
