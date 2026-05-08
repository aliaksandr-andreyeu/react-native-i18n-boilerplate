import branch, { BranchEvent } from 'react-native-branch';

export enum BranchEventTypes {
  Login = 'Login',
  CompleteRegistration = 'CompleteRegistration'
}

interface BranchEventParams {
  [key: string]: string;
}

export const trackBranchEvent = (eventType: BranchEventTypes, params: BranchEventParams = {}): void => {
  try {
    const event = new BranchEvent(eventType, undefined, {
      customData: params
    });

    event
      .logEvent()
      .then(() => {
        console.log(`${eventType} event logged successfully. with params: `, JSON.stringify(params));
      })
      .catch((error) => {
        console.error(`Error logging ${eventType} event: `, error);
      });
  } catch (error) {
    console.error(`Failed to create Branch event for ${eventType}: `, error);
  }
};

export const branchLogout = () => {
  try {
    branch.logout();
  } catch (error) {
    console.error(error);
  }
};
