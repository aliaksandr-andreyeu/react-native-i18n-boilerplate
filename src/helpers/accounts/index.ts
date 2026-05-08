import { UserTheme } from '@/constants';
import Config from 'react-native-config';

const { DEMO_TYPE_ID, CONTEST_TYPE_ID } = Config;

export const getAccountColor = (accountType: string, theme: UserTheme, typeId: number | undefined) => {
  switch (accountType) {
    case 'live':
      if (`${typeId}` === `${DEMO_TYPE_ID}`) return theme.palette.green['400'];
      else if (`${typeId}` === `${CONTEST_TYPE_ID}`) return '#FFAA00'; //@@@ TODO Add this YELLOW COLOR to palette when token would updated
      return theme.palette.purple['500'];

    case 'wallet':
      return theme.palette.graphite['900'];

    case 'cashback_wallet':
      return theme.palette.yellow['300'];

    case 'ib_wallet':
      return theme.palette.blue['800'];

    default:
      return theme.palette.purple['500'];
  }
};

export const getAccountName = (accountType: string = '', defaultTitle: string) => {
  switch (accountType) {
    case 'live':
      return 'Trading account';

    case 'wallet':
      return 'Main Wallet';

    case 'cashback_wallet':
      return 'Cashback';

    case 'ib_wallet':
      return 'Rewards';

    default:
      return defaultTitle;
  }
};
