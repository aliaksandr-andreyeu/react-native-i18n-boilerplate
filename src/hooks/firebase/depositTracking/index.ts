import { useAppSelector } from '@/hooks/store';
import { v4 } from 'uuid';
import { getFirestore, collection } from '@react-native-firebase/firestore';
import { DepositFlowTrackingPayload } from '@/store/slices/wallet/types';

import Config from 'react-native-config';
import dayjs from 'dayjs';

const { FIRESTORE_DEPOSIT_COLLECTION } = Config || {};

interface UpdateTrackingParams {
  step: number;
  completed?: boolean;
  payload?: string;
  response?: string;
}

const firestore = getFirestore();

const uuid = v4();

const useDepositTracking = () => {
  const userId = useAppSelector((store) => store.portfolio.userInfo.id);

  const updateTracking = async ({ step, completed, payload, response }: UpdateTrackingParams) => {
    try {
      const now = dayjs();

      const offsetMinutes = now.utcOffset();
      const offsetHours = offsetMinutes / 60;
      const offsetStr = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;

      const updatedAt = `${now.format('MMMM D, YYYY [at] h:mm:ss A')} ${offsetStr}`;

      const trackingData: Partial<DepositFlowTrackingPayload> = {
        actionName: 'deposit_flow',
        completed: !!completed,
        currentStep: step,
        fxboUserId: userId,
        traceId: uuid,
        updatedAt
      };

      if (payload || step !== 3) trackingData.payload = payload || '';
      if (response || step !== 3) trackingData.response = response || '';

      await collection(firestore, FIRESTORE_DEPOSIT_COLLECTION).doc(`${userId}`).set(trackingData, { merge: true });
    } catch (error) {
      console.error('firestore error:', error);
    }
  };

  return updateTracking;
};

export default useDepositTracking;
