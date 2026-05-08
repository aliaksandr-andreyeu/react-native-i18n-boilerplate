export interface ActiveRouteProps {
  index?: number;
  routes: {
    name: string;
    state?: ActiveRouteProps;
  }[];
}

export const getActiveRouteName = (state: ActiveRouteProps): string => {
  const defaultValue = '';
  if (!state) {
    return defaultValue;
  }
  const { index, routes } = state;
  if (index === undefined || routes === undefined || routes?.length === 0) {
    return defaultValue;
  }
  const { state: routeByIndexState, name } = routes?.[index] || {};
  if (!routeByIndexState) {
    return name || defaultValue;
  }
  return getActiveRouteName(routeByIndexState);
};
