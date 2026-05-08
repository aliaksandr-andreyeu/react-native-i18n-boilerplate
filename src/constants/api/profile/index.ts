import type { SocialService } from '@/types';

const profile = {
  manualCode: '/profile/two-factor/qr-code',
  enableTwoFactor: '/profile/two-factor/enable',
  twoFactorBackupCodes: '/profile/two-factor/backup-codes',
  disableTwoFactor: '/profile/two-factor',
  socialConnect: (service: SocialService) => `/oauth/connect/${service}`,
  socialDisconnect: (service: SocialService) => `/oauth/disconnect/${service}`,
  updateCustomFields: `/profile/update-custom-fields`
};

export default profile;
