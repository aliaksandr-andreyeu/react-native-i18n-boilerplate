import { UserTheme } from '@/constants';
import { BaseQueryApi } from '@reduxjs/toolkit/query/react';

declare module '@react-navigation/native' {
  export function useTheme(): UserTheme;
}

declare module '@reduxjs/toolkit/query/react' {
  export type MaybePromise<T> = T | Promise<T>;
  export type FetchBaseQueryMeta = { request: Request; response?: Response };
  export type QueryReturnValue<T = unknown, E = unknown, M = unknown> =
    | {
        error: E;
        data?: undefined;
        meta?: M;
      }
    | {
        error?: undefined;
        data: T;
        meta?: M;
      };

  export type FetchBaseQueryResult = Promise<
    | {
        data: any;
        error?: undefined;
        meta?: { request: Request; response: Response };
      }
    | {
        error: {
          status: number;
          data: any;
        };
        data?: undefined;
        meta?: { request: Request; response: Response };
      }
  >;

  export type FetchBaseQueryError =
    | {
        /**
         * * `number`:
         *   CMS Error
         */
        status: number;
        data: {
          data: null;
          error: {
            status: number;
            name: string;
            message: string;
            details: {};
          };
        };
      }
    | {
        /**
         * * `number`:
         *   HTTP status code
         */
        status: number;
        data: unknown;
      }
    | {
        /**
         * * `"FETCH_ERROR"`:
         *   An error that occurred during execution of `fetch` or the `fetchFn` callback option
         **/
        status: 'FETCH_ERROR';
        data?: undefined;
        error: string;
      }
    | {
        /**
         * * `"PARSING_ERROR"`:
         *   An error happened during parsing.
         *   Most likely a non-JSON-response was returned with the default `responseHandler` "JSON",
         *   or an error occurred while executing a custom `responseHandler`.
         **/
        status: 'PARSING_ERROR';
        originalStatus: number;
        data: string;
        error: string;
      }
    | {
        /**
         * * `"CUSTOM_ERROR"`:
         *   A custom error type that you can return from your `queryFn` where another error might not make sense.
         **/
        status: 'CUSTOM_ERROR';
        data?: unknown;
        error: string;
      };

  export type FetchBaseQueryArgs = {
    baseUrl?: string;
    prepareHeaders?: (
      headers: Headers,
      api: Pick<BaseQueryApi, 'getState' | 'extra' | 'endpoint' | 'type' | 'forced'>
    ) => MaybePromise<Headers | void>;
    fetchFn?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
    paramsSerializer?: (params: Record<string, any>) => string;
    isJsonContentType?: (headers: Headers) => boolean;
    jsonContentType?: string;
    timeout?: number;
  } & RequestInit;

  export type FetchBaseQuery = (
    args: FetchBaseQueryArgs
  ) => (args: string | any, api: BaseQueryApi, extraOptions: any) => FetchBaseQueryResult;
}
