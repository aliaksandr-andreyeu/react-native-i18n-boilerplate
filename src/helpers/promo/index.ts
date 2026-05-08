import {
  PromoRestrictionOperator,
  PromoRestrictionsLogic,
  VisibilityRestrictions
} from '@/store/slices/ideas-hub/types';
import { UserInfo } from '@/store/slices/portfolio/types';

export const isPromoRestricted = (visibilityRestrictions?: VisibilityRestrictions, userInfo?: UserInfo): boolean => {
  if (visibilityRestrictions === undefined) {
    return false;
  }

  const isVisibilityRestrictions = Boolean(visibilityRestrictions && Object.keys(visibilityRestrictions)?.length > 0);

  if (!isVisibilityRestrictions) {
    return true;
  }

  const { restrictionsLogic, restriction = [] } = visibilityRestrictions || {};
  if (restrictionsLogic === null) {
    return false;
  }

  const { id: userId } = userInfo || {};

  const restrictionsResult = restriction?.map(({ attribute, conditionValue, operator }) => {
    const attributes = attribute?.split('.')?.map((el) => el?.trim()) || [];
    const conditions: (string | boolean)[] =
      conditionValue?.split(',')?.map((el) => {
        const item = el?.trim()?.toLowerCase();

        if (item === 'true') {
          return true;
        } else if (item === 'false') {
          return false;
        } else {
          return item;
        }
      }) || [];

    const condition = conditions?.find((el) => el);

    const profileKey = 'profile';
    const isProfile = Boolean(attributes?.[0] === profileKey);

    if (userId === undefined && isProfile) {
      return true;
    }

    if (isProfile) {
      const profileProp = attributes[1] as keyof UserInfo;
      let profileValue = userInfo?.[profileProp] as string | boolean | number;

      if (typeof profileValue === 'string' || typeof profileValue === 'number') {
        profileValue = String(profileValue)?.toLowerCase();
      }

      if (operator === PromoRestrictionOperator.equals) {
        if (profileValue === condition) {
          return true;
        } else {
          return false;
        }
      } else if (operator === PromoRestrictionOperator.doesntEqual) {
        if (profileValue === condition) {
          return false;
        } else {
          return true;
        }
      } else if (operator === PromoRestrictionOperator.isNotOneOf) {
        if (conditions.includes(profileValue)) {
          return false;
        } else {
          return true;
        }
      } else if (operator === PromoRestrictionOperator.isOneOf) {
        if (conditions.includes(profileValue)) {
          return true;
        } else {
          return false;
        }
      }
    }

    return true;
  });

  const allMatch = restrictionsResult?.every((el) => Boolean(el)) || false;
  const atLeastOne = restrictionsResult?.some((el) => Boolean(el)) || false;

  if (restrictionsLogic === PromoRestrictionsLogic.allMatch) {
    return allMatch;
  } else if (restrictionsLogic === PromoRestrictionsLogic.atLeastOne) {
    return atLeastOne;
  }

  return false;
};
