const messagingFn: any = jest.fn(() => ({
  requestPermission: jest.fn().mockResolvedValue(true),
  hasPermission: jest.fn().mockResolvedValue(true),
  getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
  deleteToken: jest.fn().mockResolvedValue(undefined),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  setBackgroundMessageHandler: jest.fn(),
  subscribeToTopic: jest.fn().mockResolvedValue(undefined),
  unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined)
}));

(messagingFn as any).AuthorizationStatus = {
  NOT_DETERMINED: 0,
  DENIED: 1,
  AUTHORIZED: 2,
  PROVISIONAL: 3
};

export default messagingFn;
module.exports = messagingFn;
module.exports.default = messagingFn;
