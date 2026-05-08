import crashlytics from '@react-native-firebase/crashlytics';

const isError = (error: Error | unknown): error is Error => {
  return (error as Error)?.message !== undefined;
};

export const logError = (error: unknown) => {
  if (!isError(error)) {
    return;
  }
  crashlytics().recordError(error);
};
