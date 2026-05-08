import { createApi } from '@reduxjs/toolkit/query/react';
import { sumSubBaseQueryWithLogger } from '@/helpers';
import { api, config } from '@/constants';
import { createSumSubConfig, getHmacSHA256 } from '@/helpers';
import Config from 'react-native-config';

const { SUMSUB_URL, SUMSUB_TOKEN, SUMSUB_SECRET } = Config || {};

const { isAndroid, isIOS, platform } = config;

export const sumSubApi = createApi({
  reducerPath: 'sumSubApi',
  baseQuery: sumSubBaseQueryWithLogger,
  endpoints: (builder) => ({
    sumSubToken: builder.mutation<any, any>({
      query: (userId: number) => {
        if (userId === undefined) {
          return { url: '' };
        }

        const { ttlInSecs, ts, levelName } = createSumSubConfig(userId);

        const url = api.sumSub.token(userId, ttlInSecs, levelName);
        const method = 'POST';

        const secretMessage = ts + method + url;
        const secretToken = getHmacSHA256(SUMSUB_SECRET, secretMessage);

        if (!secretToken) {
          return { url: '' };
        }

        const mobOS = isIOS ? 'iOS' : isAndroid ? 'Android' : platform.os;

        const headers = {
          Accept: 'application/json',
          'X-App-Token': `${SUMSUB_TOKEN}`,
          'X-App-Access-Ts': `${ts}`,
          'X-App-Access-Sig': secretToken,
          'X-Mob-OS': mobOS
        };

        return { url, method, headers };
      }
    }),

    sumSubStatus: builder.query<any, number>({
      async queryFn(userId: number): Promise<any> {
        if (userId === undefined) {
          return;
        }

        const defaultStatus = {
          data: {
            reviewStatus: 'none',
            reviewResult: {
              reviewAnswer: 'none',
              rejectLabels: [],
              reviewRejectType: 'none',
              moderationComment: '',
              clientComment: ''
            }
          }
        };

        try {
          const { ts } = createSumSubConfig(userId);

          const dataUrl = api.sumSub.applicantData(userId);
          const method = 'GET';

          const dataMessage = ts + method + dataUrl;
          const secretData = getHmacSHA256(SUMSUB_SECRET, dataMessage);

          if (!secretData) {
            return defaultStatus;
          }

          console.log('SumSub API Request: ', { url: dataUrl, method });

          const dataResponse = await fetch(`${SUMSUB_URL}${dataUrl}`, {
            method,
            headers: {
              Accept: 'application/json',
              'X-App-Token': `${SUMSUB_TOKEN}`,
              'X-App-Access-Ts': `${ts}`,
              'X-App-Access-Sig': secretData
            }
          });

          if (!dataResponse.ok) {
            return defaultStatus;
          }

          const jsonData = await dataResponse.json();

          const { id: applicantId } = jsonData || {};

          if (applicantId === undefined) {
            return defaultStatus;
          }

          const statusUrl = api.sumSub.applicantStatus(applicantId);

          const statusMessage = ts + method + statusUrl;
          const secretStatus = getHmacSHA256(SUMSUB_SECRET, statusMessage);

          if (!secretStatus) {
            return defaultStatus;
          }

          console.log('SumSub API Request: ', { url: statusUrl, method });

          const statusResponse = await fetch(`${SUMSUB_URL}${statusUrl}`, {
            method,
            headers: {
              Accept: 'application/json',
              'X-App-Token': `${SUMSUB_TOKEN}`,
              'X-App-Access-Ts': `${ts}`,
              'X-App-Access-Sig': secretStatus
            }
          });

          if (!statusResponse.ok) {
            return defaultStatus;
          }

          const jsonStatus = await statusResponse.json();

          return { data: jsonStatus };
        } catch (error: unknown) {
          console.error(error);
          return defaultStatus;
        }
      }
    })
  })
});

export const { useSumSubTokenMutation: useSumSubToken, useLazySumSubStatusQuery: useSumSubStatus } = sumSubApi;

export const sumSubActions = { useSumSubToken, useSumSubStatus };
