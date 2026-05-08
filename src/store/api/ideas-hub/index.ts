import { createApi, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import {
  apiBaseQueryWithLogger,
  cmsBaseQueryWithLogger,
  mt5BaseQueryWithLogger,
  promoBaseQueryWithLogger
} from '@/helpers';
import { ideasHubSlice } from '@/store/slices';
import { api } from '@/constants';
import {
  ideasParser,
  ideaCategoriesParser,
  ideaDetailsParser,
  widgetsParser,
  past24HoursTimeISO,
  promoParser,
  promoDetailsParser,
  promoIconsParser,
  promoLegalDocsParser
} from './parsers';
import {
  ContestLeader,
  ContestList,
  DocumentList,
  InfoBlock,
  InfoBlockIcon,
  ParsedPromoData,
  ParsedPromoDetailData,
  ParsedPromoLegalDocs,
  PromoContest,
  PromoDetails,
  PromoIconArgs,
  PromoPage,
  PromoTestimonals,
  TestimonialIcon,
  WatchWidget,
  Widget,
  WinnersAndLosers
} from '@/store/slices/ideas-hub/types';
import { RawIdeaCategoryData, RawIdeaData, RegisterWebinarBody } from './types';

const {
  actions: { setCategoryIdeas, setWatchWidgets, setPromotions }
} = ideasHubSlice;

const transformErrorResponse = (response: FetchBaseQueryError) => {
  const { data } = response || {};
  const { error } = data as { error: string };
  return error;
};

export const ideasHubApi = createApi({
  reducerPath: 'ideasHubApi',
  tagTypes: ['Token'],
  baseQuery: cmsBaseQueryWithLogger,
  endpoints: (builder) => ({
    investmentIdeaDetails: builder.query<any, number>({
      query: (ideaId) => {
        return {
          url: api.ideasHub.investmentIdeaById(ideaId),
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const { data } = (response || {}) as { data: RawIdeaData[] };
        return ideaDetailsParser(data);
      },
      transformErrorResponse
    }),
    investmentIdeasCategories: builder.query<any, void>({
      query: () => {
        return {
          url: api.ideasHub.investmentIdeasCategories,
          method: 'GET'
        };
      },
      transformResponse: (response) => {
        const { data } = (response || {}) as { data: RawIdeaCategoryData[] };
        return ideaCategoriesParser(data);
      },
      transformErrorResponse
    }),
    investmentIdeasByCategoryId: builder.query<any, { id: number | null; page?: number }>({
      query: ({ id, page }) => ({
        url: api.ideasHub.investmentIdeasByCategoryId(id, page),
        method: 'GET'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};

          const ideas = data && Array.isArray(data) ? data : [];

          dispatch(
            setCategoryIdeas({
              id,
              ideas
            })
          );
        } catch (error: unknown) {
          console.error(error);
        }
      },

      transformResponse: (response, meta, arg) => {
        const { data } = (response || {}) as { data: RawIdeaData[] };
        return ideasParser(data);
      },
      transformErrorResponse
    }),
    investmentIdeas: builder.query<any, any>({
      query: () => ({
        url: api.ideasHub.investmentIdeas,
        method: 'GET'
      }),
      transformResponse: (response) => {
        const { data } = (response || {}) as { data: RawIdeaData[] };
        return ideasParser(data);
      },
      transformErrorResponse
    }),
    watchWidget: builder.query<WatchWidget[], number>({
      query: (page) => ({
        url: api.ideasHub.watchWidget(page),
        method: 'GET'
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { data } = res || {};

          dispatch(setWatchWidgets(data || []));
        } catch (error) {
          console.error(error);
        }
      },
      transformResponse: (response: { data: Widget[] }) => widgetsParser(response?.data || []),
      transformErrorResponse
    }),
    watchWidgetById: builder.query<WatchWidget[], number>({
      query: (id) => ({
        url: api.ideasHub.watchWidgetById(id),
        method: 'GET'
      }),
      transformResponse: (response: { data: Widget[] }) => widgetsParser(response?.data || []),
      transformErrorResponse
    }),
    getPromotions: builder.query<ParsedPromoData[], string>({
      query: (lang) => ({
        url: api.ideasHub.promotions(lang),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (!data) return;

          dispatch(setPromotions(data || []));
        } catch (error) {
          console.error(error);
        }
      },
      transformResponse: (response: ContestList) => promoParser(response?.data || []),
      transformErrorResponse
    }),
    getPromotionDetails: builder.query<ParsedPromoDetailData, { pId: number; lang: string }>({
      query: (args) => ({
        url: api.ideasHub.promotionById(args),
        method: 'GET'
      }),
      transformResponse: (response: PromoDetails<PromoPage[]>) => promoDetailsParser(response?.data || []),
      transformErrorResponse
    }),

    getPromoIcons: builder.query<(InfoBlockIcon | TestimonialIcon)[], PromoIconArgs>({
      query: ({ id, field, layout, iconField }) => ({
        url: api.ideasHub.getPromoIcons(id, layout, field, iconField),
        method: 'GET'
      }),
      transformResponse: (response: PromoDetails<(InfoBlock | PromoTestimonals)[]>) =>
        promoIconsParser(response?.data || []),
      transformErrorResponse
    }),
    getPromoLegalDocuments: builder.query<ParsedPromoLegalDocs[], string>({
      query: (extra) => ({
        url: api.application.legalDocuments + extra,
        method: 'GET'
      }),
      transformResponse: (response: { data: DocumentList }) => promoLegalDocsParser(response?.data || []),
      transformErrorResponse
    }),
    getWinnersAndLosers: builder.query<WinnersAndLosers[], number>({
      async queryFn(selectedAccount, baseApi, extraOptions): Promise<any> {
        try {
          const result = await cmsBaseQueryWithLogger(
            { url: api.ideasHub.winnersAndLosers(past24HoursTimeISO()), method: 'GET' },
            baseApi,
            extraOptions
          );

          if (result.error) {
            throw { error: result.error, url: api.ideasHub.winnersAndLosers(past24HoursTimeISO()) };
          }

          const { data } = (result || {}) as {
            data?: {
              data?: {
                id?: number;
                createdAt?: string;
                title?: string;
                description?: string;
                symbol?: string;
                fullName?: string;
              }[];
            };
          };

          if (!data) return [];

          const winnersAndLosers =
            data?.data?.map((item: any) => ({
              id: item?.id,
              createdAt: item?.attributes?.createdAt,
              title: item?.attributes?.title,
              description: item?.attributes?.description,
              symbol: item?.attributes?.trading_asset?.data.attributes?.systemName,
              fullName: item?.attributes?.trading_asset?.data?.attributes?.fullName
            })) || [];

          const processedData = await Promise.all(
            winnersAndLosers.map(async (asset: { symbol: string }) => {
              const args = {
                accountId: selectedAccount,
                symbol: asset.symbol
              };

              const lastTickResult = (await mt5BaseQueryWithLogger(
                { url: api.portfolio.getSymbolLastTick(args), method: 'GET' },
                baseApi,
                extraOptions
              )) as {
                error?: string;
                data?: {
                  ask: number;
                  bid: number;
                };
              };

              if (lastTickResult.error) {
                throw { error: lastTickResult.error, url: api.portfolio.getSymbolLastTick(args) };
              }

              const configDatakResult = (await mt5BaseQueryWithLogger(
                { url: api.portfolio.getSymbolConfig(args), method: 'GET' },
                baseApi,
                extraOptions
              )) as {
                error?: string;
                data: {
                  lastClosedPrice: number;
                  digits: number;
                };
              };

              if (configDatakResult.error) {
                throw { error: configDatakResult.error, url: api.portfolio.getSymbolConfig(args) };
              }

              const chartDatakResult = await mt5BaseQueryWithLogger(
                { url: api.market.getCandlesHistory({ ...args, period: 'd1' }), method: 'GET' },
                baseApi,
                extraOptions
              );

              if (chartDatakResult.error) {
                throw { error: chartDatakResult.error, url: api.market.getCandlesHistory({ ...args, period: 'd1' }) };
              }

              const lastClosedPrice = configDatakResult?.data?.lastClosedPrice;
              const ask = lastTickResult?.data?.ask || 0;
              const bid = lastTickResult?.data?.bid || 0;

              const diff = (bid + ask) / 2 - lastClosedPrice;
              const profit = (diff / lastClosedPrice) * 100;

              return {
                ...asset,
                config: {
                  digits: configDatakResult?.data?.digits || 0,
                  lastClosedPrice: lastClosedPrice
                },
                lastTick: {
                  ask: ask,
                  bid: bid
                },
                profit: profit,
                chartData: chartDatakResult?.data
              };
            })
          );

          return {
            data: processedData.sort((a: { profit: number }, b: { profit: number }) => b.profit - a.profit) || []
          };
        } catch (error) {
          console.error(error);
          return { error };
        }
      }
    })
  })
});

export const ideasHubPromoApi = createApi({
  reducerPath: 'ideasHubPromoApi',
  baseQuery: promoBaseQueryWithLogger,
  endpoints: (builder) => ({
    registerForWebinar: builder.query<any, RegisterWebinarBody>({
      query: (body) => ({
        url: api.ideasHub.registerForWebinar,
        method: 'POST',
        body
      })
    })
  })
});

export const ideasHubClientApi = createApi({
  reducerPath: 'ideasHubClientApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    getPromoContest: builder.query<PromoContest, number>({
      query: (id) => ({
        url: api.ideasHub.getPromoContest(id),
        method: 'GET'
      })
    }),
    getContestLeaders: builder.query<ContestLeader[], number>({
      query: (id) => ({
        url: api.ideasHub.getContestLeaders(id),
        method: 'GET'
      })
    }),
    participateContest: builder.mutation<any, number>({
      query: (id) => ({
        url: api.ideasHub.participateContest(id),
        method: 'POST'
      })
    })
  })
});

export const {
  useLazyInvestmentIdeaDetailsQuery: useInvestmentIdeaDetailsQuery,
  useLazyInvestmentIdeasQuery: useInvestmentIdeasQuery,
  useLazyInvestmentIdeasCategoriesQuery: useInvestmentIdeasCategoriesQuery,
  useLazyInvestmentIdeasByCategoryIdQuery: useInvestmentIdeasByCategoryIdQuery,
  useLazyWatchWidgetQuery: useWatchWidgetQuery,
  useLazyWatchWidgetByIdQuery: useWatchWidgetByIdQuery,
  useLazyGetWinnersAndLosersQuery: useGetWinnersAndLosersQuery,
  useLazyGetPromotionsQuery: useGetPromotionsQuery,
  useLazyGetPromotionDetailsQuery: useGetPromotionDetailsQuery,
  useLazyGetPromoLegalDocumentsQuery: useGetPromoLegalDocumentsQuery,
  useLazyGetPromoIconsQuery: useGetPromoIconsQuery
} = ideasHubApi;

export const {
  useLazyGetPromoContestQuery: useGetPromoContestQuery,
  useLazyGetContestLeadersQuery: useGetContestLeadersQuery,
  useParticipateContestMutation
} = ideasHubClientApi;

export const { useLazyRegisterForWebinarQuery: useRegisterForWebinarQuery } = ideasHubPromoApi;

export const ideasHubActions = {
  useInvestmentIdeaDetailsQuery,
  useInvestmentIdeasQuery,
  useInvestmentIdeasCategoriesQuery,
  useInvestmentIdeasByCategoryIdQuery,
  useWatchWidgetQuery,
  useWatchWidgetByIdQuery,
  useGetWinnersAndLosersQuery,
  useGetPromotionsQuery,
  useGetPromotionDetailsQuery,
  useGetPromoLegalDocumentsQuery,
  useGetPromoContestQuery,
  useGetContestLeadersQuery,
  useParticipateContestMutation,
  useGetPromoIconsQuery,
  useRegisterForWebinarQuery
};
