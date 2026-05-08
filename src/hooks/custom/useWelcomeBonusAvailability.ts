import { useEffect, useState } from 'react';
import { feature_flag_promo_welcome_account } from '@/constants/static';
import { usePostHog } from 'posthog-react-native';
import { IFeatureFlag } from '@/store/slices/application/types';
import { useAppSelector } from '../store';

const useWelcomeBonusAvailability = () => {
  const posthog = usePostHog();

  const promoWelcome = useAppSelector((store) => store.application.promoWelcome);
  const { conditionsCreditAmount: promoBonus = 0 } = promoWelcome || {};

  const userInfo = useAppSelector((state) => state.portfolio.userInfo);
  const [isWelcomeBonusAvailable, setIsWelcomeBonusAvailable] = useState(false);

  const isFeatureEnabled = posthog.isFeatureEnabled(feature_flag_promo_welcome_account);
  const featureFlagValue = posthog.getFeatureFlagPayload(feature_flag_promo_welcome_account) as IFeatureFlag;
  const restricted_countries = featureFlagValue?.promotion?.restricted_countries;

  useEffect(() => {
    if (isFeatureEnabled && restricted_countries && !restricted_countries.includes(userInfo.country)) {
      setIsWelcomeBonusAvailable(true);
    } else {
      setIsWelcomeBonusAvailable(false);
    }
  }, [isFeatureEnabled, restricted_countries, userInfo.country]);

  return { isWelcomeBonusAvailable, promoBonus };
};

export default useWelcomeBonusAvailability;
