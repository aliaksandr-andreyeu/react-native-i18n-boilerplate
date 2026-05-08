import InAppReview from 'react-native-in-app-review';

const useRate = () => {
  const requestReview = async () => {
    try {
      const isAvailable = await InAppReview.isAvailable();

      console.error('@@@@@$ isAvailable', isAvailable);

      if (!isAvailable) {
        return false;
      }

      const inAppReview = await InAppReview.RequestInAppReview();

      console.error('@@@@@$ inAppReview', inAppReview);

      if (!inAppReview) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return { requestReview };
};

export default useRate;
