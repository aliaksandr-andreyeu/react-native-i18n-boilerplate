import { useUpdateCustomFields } from '@/store/api';
import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';
import { config } from '@/constants';

const { isAndroid, isIOS } = config;

interface Payload {
  gaid?: string | null;
  idfa?: string | null;
}

const useAdvertise = () => {
  const [updateCustomFields] = useUpdateCustomFields();

  const checkAdvertising = async ({ gaid, idfa }: Payload) => {
    try {
      const fieldName = isIOS ? 'custom_idfa' : isAndroid ? 'custom_gaid' : null;

      const checkAuthRes = await ReactNativeIdfaAaid.getAdvertisingInfoAndCheckAuthorization(true);

      const advertisingID = checkAuthRes?.id;

      if (
        !fieldName ||
        !advertisingID ||
        checkAuthRes?.isAdTrackingLimited ||
        advertisingID === '00000000-0000-0000-0000-000000000000'
      ) {
        return { success: false };
      }

      if ((isAndroid && gaid === advertisingID) || (isIOS && idfa === advertisingID)) {
        return { success: true };
      }

      await updateCustomFields({
        customFields: {
          [fieldName]: advertisingID
        }
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  return checkAdvertising;
};

export default useAdvertise;
