declare module '@sumsub/react-native-mobilesdk-module' {
  interface Theme {
    universal?: {
      colors?: {
        [key: string]: string;
      };
      // Add more optional properties based on your use case
    };
  }

  interface Handlers {
    onStatusChanged?: (event: { prevStatus: string; newStatus: string }) => void;
    onEvent?: (message: string) => void;
    onActionResult?: (result: any) => void;
    onLog?: (event: { message: string }) => void;
    // Add more handler types if necessary
  }

  interface SNSMobileSDK {
    init: (token: string, tokenCallback: () => Promise<string | void | undefined>) => this;

    withTheme: (theme: Theme) => this;

    withHandlers: (handlers: Handlers) => this;

    withDebug?: (debug: boolean) => this;

    withLocale?: (locale: string) => this;

    build: () => SNSMobileSDKInstance;
  }

  interface SNSMobileSDKInstance {
    launch: () => Promise<any>;
  }

  const SNSMobileSDK: SNSMobileSDK;

  export default SNSMobileSDK;
}
