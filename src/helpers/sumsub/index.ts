import CryptoJS from 'crypto-js';

export const getHmacSHA256 = (privateKey: string, message: string): string | null => {
  if (privateKey === undefined || message === undefined) {
    return null;
  }
  try {
    const key = CryptoJS.enc.Utf8.parse(privateKey);
    const msg = CryptoJS.enc.Utf8.parse(message);
    const hmac = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(msg, key));
    return hmac;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
};

enum LevelNameType {
  LEVEL_NAME = 'capital_kys_level',
  SOURCE_KEY = 'capital'
}

export const createSumSubConfig = (userId: number) => {
  return {
    ts: Math.floor(Date.now() / 1000),
    userId,
    levelName: LevelNameType.LEVEL_NAME,
    sourceKey: LevelNameType.SOURCE_KEY,
    ttlInSecs: 1200
  };
};
