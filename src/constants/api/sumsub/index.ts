const sumSub = {
  token: (userId: number, ttlInSecs: number, levelName: string) =>
    `/resources/accessTokens?userId=${userId}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`,
  applicantData: (userId: number) => `/resources/applicants/-;externalUserId=${userId}/one`,
  applicantStatus: (applicantId: string) => `/resources/applicants/${applicantId}/status`
};

export default sumSub;
