import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { SvgXmlProps, SvgXmlIconNames } from './types';

import DepositIcon from './DepositIcon';
import WithdrawalIcon from './WithdrawalIcon'
import ClosedAccountIcon from './ClosedAccountIcon';
import WalletAccountIcon from './WalletAccountIcon';
import TradingAccountIcon from './TradingAccountIcon';
import RewardsAccountIcon from './RewardsAccountIcon';
import CashbackAccountIcon from './CashbackAccountIcon';
import LogoIcon from './LogoIcon';
import IdeasHubIcon from './IdeasHubIcon';
import PortfolioIcon from './PortfolioIcon';
import MarketsIcon from './MarketsIcon';
import WalletIcon from './WalletIcon';
import BankCard from './BankCard';
import ChevronLeftIcon from './ChevronLeftIcon';
import ChevronRightIcon from './ChevronRightIcon';
import ChevronBottomIcon from './ChevronBottomIcon';
import ChevronTopIcon from './ChevronTopIcon';
import CheckIcon from './CheckIcon';
import EyeIcon from './EyeIcon';
import EyeSlashIcon from './EyeSlashIcon';
import MagnifyIcon from './MagnifyIcon';
import CloseIcon from './CloseIcon';
import CloseCircleIcon from './CloseCircleIcon';
import StarIcon from './StarIcon';
import PersonIcon from './PersonIcon';
import ListIcon from './ListIcon';
import QuestionCircleIcon from './QuestionCircleIcon';
import FacebookColorIcon from './FacebookColorIcon';
import GoogleColorIcon from './GoogleColorIcon';
import ArrowAngleIcon from './ArrowAngleIcon';
import ArrowLeftIcon from './ArrowLeftIcon';
import ClockIcon from './ClockIcon';
import MultiplyIcon from './MultiplyIcon';
import ArrowRightIcon from './ArrowRightIcon';
import ExclamationIcon from './ExclamationIcon';
import ArrowDownIcon from './ArrowDownIcon';
import CalendarIcon from './CalendarIcon';
import LineCurveIcon from './LineCurveIcon';
import CandleStickIcon from './CandleStickIcon';
import AttachIcon from './AttachIcon';
import SignalIcon from './SignalIcon';
import BankNoteIcon from './BankNoteIcon';
import FileIcon from './FileIcon';
import FileColoredIcon from './FileColoredIcon';
import PlusIcon from './PlusIcon';
import TransferIcon from './TransferIcon';
import DiamondIcon from './DiamondIcon';
import CoinsStackIcon from './CoinsStackIcon';
import GridIcon from './GridIcon';
import ListViewIcon from './ListViewIcon';
import SettingsIcon from './SettingsIcon';
import LineChartIcon from './LineChartIcon';
import LineChartUpIcon from './LineChartUpIcon';
import GlassesIcon from './GlassesIcon';
import VerificationIcon from './VerificationIcon';
import RocketIcon from './RocketIcon';
import CoinsIcon from './CoinsIcon';
import CandleStickGreenIcon from './candleStickGreenIcon';
import CloseIconPurple from './ClosePurple';
import IdeasHubIconActive from './IdeasHubIconActive';
import PortfoiloIconActive from './PortfolioIconActive';
import MarketIconActive from './MarketIconActive';
import WalletIconActive from './WalletIconActive';
import PencilIcon from './PencilIcon';
import CopyIcon from './CopyIcon';
import PasteIcon from './PasteIcon';
import Cashback from './Cashback';
import CheckThin from './CheckThinIcon';
import Welcome from './WelcomeIcon';
import Pause from './PauseIcon'
import HalfMoon from './HalfMoonIcon';
import Lock from './LockIcon';
import RoundClock from './RoundClockIcon';
import ContestIcon from './ContestIcon';
import CupaIcon from './CupaIcon';
import ContestRoundIcon from './ContestRoundIcon';
import DemoContestRoundIcon from './DemoContestRoundIcon';
import RewardsIcon from './RewardsIcon';
import BalanceCorrection from './BalanceCorrection';
import FileCopy from './FileCopyIcon';
import UserSquareIcon from './userSquareIcon';
import CheckVerifiedIcon from './CheckVerifiedIcon';
import DiamondUnderline from './DiamondUnderline';
import LockPlain from './LockPlain';
import Gift from './Gift';
import Money from './Money';
import People from './People';
import ArrowUp from './ArrowUp';
import RewardsWalletCashbackIcon from './RewardsWalletCashbackIcon';
import RewardsWalletPeopleIcon from './RewardsWalletPeopleIcon';
import RewardsWalletGiftIcon from './RewardsWalletGiftIcon';
import MainWalletIcon from './MainWalletIcon';
import BonusWalletIcon from './BonusWalletIcon';
import PrimeWalletIcon from './PrimeIcon';
import ReferralIcon from './ReferralIcon';
import ShareIcon from './ShareIcon';
import TransactionsHistoryIcon from './TransactionsHistoryIcon';
import UserIcon from './UserIcon';
import PulseIcon from './PulseIcon';
import TopPerformersIcon from './TopPerformerIcon';
import TopSignalsIcon from './TopSignalsIcon';
import RecentTradesIcon from './RecentTradesIcon';
import TriangleIcon from './TriangleIcon';
import SmallClockIcon from './SmallClockIcon';
import ArrowInCircleIcon from './ArrowInCircleIcon';
import SmallArrowUp from './SmallArrowUp';
import SmallArrowDown from './SmallArrowDown'
import PulseAIIcon from './PulseAIIcon';
import RecentTradesSoon from './RecentTradesSoon';
import PulseActive from './PulseActive';


export const IconSize = {
  tiny: {
    width: 9,
    height: 9
  },
  xxs: {
    width: 10,
    height: 10
  },
  xs: {
    width: 12,
    height: 12
  },
  xsm: {
    width: 14,
    height: 14
  },
  sm: {
    width: 16,
    height: 16
  },
  md: {
    width: 20,
    height: 20
  },
  lg: {
    width: 24,
    height: 24
  },
  xl: {
    width: 32,
    height: 32
  },
  xxl: {
    width: 40,
    height: 40
  },
  xxxl: {
    width: 48,
    height: 48
  },
};

const getIcon = (name: SvgXmlIconNames): string | null => {
  if (!name) return null;
  switch (name) {
    case SvgXmlIconNames.transactionsHistory:
      return TransactionsHistoryIcon;
    case SvgXmlIconNames.deposit:
      return DepositIcon;
    case SvgXmlIconNames.withdrawal:
      return WithdrawalIcon;
    case SvgXmlIconNames.closedAccount:
      return ClosedAccountIcon;
    case SvgXmlIconNames.walletAccount:
      return WalletAccountIcon;
    case SvgXmlIconNames.tradingAccount:
      return TradingAccountIcon;
    case SvgXmlIconNames.rewardsAccount:
      return RewardsAccountIcon;
    case SvgXmlIconNames.cashbackAccount:
      return CashbackAccountIcon;
    case SvgXmlIconNames.calendar:
      return CalendarIcon;
    case SvgXmlIconNames.chevronDown:
      return ArrowDownIcon;
    case SvgXmlIconNames.logo:
      return LogoIcon;
    case SvgXmlIconNames.ideasHub:
      return IdeasHubIcon;
    case SvgXmlIconNames.portfolio:
      return PortfolioIcon;
    case SvgXmlIconNames.marketings:
      return MarketsIcon;
    case SvgXmlIconNames.wallet:
      return WalletIcon;
    case SvgXmlIconNames.bankCard:
      return BankCard;
    case SvgXmlIconNames.chevronLeft:
      return ChevronLeftIcon;
    case SvgXmlIconNames.chevronRight:
      return ChevronRightIcon;
    case SvgXmlIconNames.chevronBottom:
      return ChevronBottomIcon;
    case SvgXmlIconNames.chevronTop:
      return ChevronTopIcon;
    case SvgXmlIconNames.lineChartUp:
      return LineChartUpIcon;
    case SvgXmlIconNames.check:
      return CheckIcon;
    case SvgXmlIconNames.eye:
      return EyeIcon;
    case SvgXmlIconNames.eyeSlash:
      return EyeSlashIcon;
    case SvgXmlIconNames.magnify:
      return MagnifyIcon;
    case SvgXmlIconNames.close:
      return CloseIcon;
    case SvgXmlIconNames.closeCircle:
      return CloseCircleIcon;
    case SvgXmlIconNames.star:
      return StarIcon;
    case SvgXmlIconNames.person:
      return PersonIcon;
    case SvgXmlIconNames.list:
      return ListIcon;
    case SvgXmlIconNames.questionCircle:
      return QuestionCircleIcon;
    case SvgXmlIconNames.googleColor:
      return GoogleColorIcon;
    case SvgXmlIconNames.facebookColor:
      return FacebookColorIcon;
    case SvgXmlIconNames.arrowAngle:
      return ArrowAngleIcon;
    case SvgXmlIconNames.arrowLeft:
      return ArrowLeftIcon;
    case SvgXmlIconNames.arrowRight:
      return ArrowRightIcon;
    case SvgXmlIconNames.clock:
      return ClockIcon;
    case SvgXmlIconNames.multiply:
      return MultiplyIcon;
    case SvgXmlIconNames.exclamation:
      return ExclamationIcon;
    case SvgXmlIconNames.lineCurve:
      return LineCurveIcon;
    case SvgXmlIconNames.candleStick:
      return CandleStickIcon;
    case SvgXmlIconNames.attach:
      return AttachIcon;
    case SvgXmlIconNames.signal:
      return SignalIcon;
    case SvgXmlIconNames.bankNote:
      return BankNoteIcon;
    case SvgXmlIconNames.file:
      return FileIcon;
    case SvgXmlIconNames.fileColored:
      return FileColoredIcon;
    case SvgXmlIconNames.plus:
      return PlusIcon;
    case SvgXmlIconNames.transfer:
      return TransferIcon;
    case SvgXmlIconNames.diamond:
      return DiamondIcon;
    case SvgXmlIconNames.coinsStack:
      return CoinsStackIcon;
    case SvgXmlIconNames.grid:
      return GridIcon;
    case SvgXmlIconNames.listView:
      return ListViewIcon;
    case SvgXmlIconNames.settings:
      return SettingsIcon;
    case SvgXmlIconNames.lineChart:
      return LineChartIcon;
    case SvgXmlIconNames.glasses:
      return GlassesIcon;
    case SvgXmlIconNames.verificationKey:
      return VerificationIcon;
    case SvgXmlIconNames.rocket:
      return RocketIcon;
    case SvgXmlIconNames.coins:
      return CoinsIcon;
    case SvgXmlIconNames.candleStickGreen:
      return CandleStickGreenIcon;
    case SvgXmlIconNames.closePurple:
      return CloseIconPurple;
    case SvgXmlIconNames.ideasHubActive:
      return IdeasHubIconActive;
    case SvgXmlIconNames.portfolioIconActive:
      return PortfoiloIconActive;
    case SvgXmlIconNames.marketIconActive:
      return MarketIconActive;
    case SvgXmlIconNames.walletIconActive:
      return WalletIconActive;
    case SvgXmlIconNames.pencil:
      return PencilIcon;
    case SvgXmlIconNames.copy:
      return CopyIcon;
    case SvgXmlIconNames.paste:
      return PasteIcon;
    case SvgXmlIconNames.cashback:
      return Cashback;
    case SvgXmlIconNames.checkThin:
      return CheckThin;
    case SvgXmlIconNames.welcome:
      return Welcome;
    case SvgXmlIconNames.pause:
      return Pause;
    case SvgXmlIconNames.halfMoon:
      return HalfMoon;
    case SvgXmlIconNames.lock:
      return Lock;
    case SvgXmlIconNames.roundClock:
      return RoundClock;
    case SvgXmlIconNames.contest:
      return ContestIcon;
    case SvgXmlIconNames.cupa:
      return CupaIcon
    case SvgXmlIconNames.contestRound:
      return ContestRoundIcon;
    case SvgXmlIconNames.demoContestRound:
      return DemoContestRoundIcon;
    case SvgXmlIconNames.balanceCorrection:
      return BalanceCorrection;
    case SvgXmlIconNames.rewards:
      return RewardsIcon;
    case SvgXmlIconNames.fileCopy:
      return FileCopy;
    case SvgXmlIconNames.userSquare:
      return UserSquareIcon;
    case SvgXmlIconNames.checkVerified:
      return CheckVerifiedIcon
    case SvgXmlIconNames.diamondUnderline:
      return DiamondUnderline;
    case SvgXmlIconNames.lockPlain:
      return LockPlain;
    case SvgXmlIconNames.gift:
      return Gift;
    case SvgXmlIconNames.money:
      return Money;
    case SvgXmlIconNames.people:
      return People;
    case SvgXmlIconNames.arrowUp:
      return ArrowUp;
    case SvgXmlIconNames.rewardsWalletCashbackIcon:
      return RewardsWalletCashbackIcon;
    case SvgXmlIconNames.rewardsWalletPeopleIcon:
      return RewardsWalletPeopleIcon;
    case SvgXmlIconNames.rewardsWalletGiftIcon:
      return RewardsWalletGiftIcon;
    case SvgXmlIconNames.mainWallet:
      return MainWalletIcon;
    case SvgXmlIconNames.bonusWallet:
      return BonusWalletIcon;
    case SvgXmlIconNames.primeWallet:
      return PrimeWalletIcon;
    case SvgXmlIconNames.referral:
      return ReferralIcon;
    case SvgXmlIconNames.shareIcon:
      return ShareIcon;
    case SvgXmlIconNames.user:
      return UserIcon
    case SvgXmlIconNames.pulse:
      return PulseIcon
    case SvgXmlIconNames.recentTrades:
      return RecentTradesIcon;
    case SvgXmlIconNames.topPerformers:
      return TopPerformersIcon;
    case SvgXmlIconNames.topSignals:
      return TopSignalsIcon;
    case SvgXmlIconNames.triangle:
      return TriangleIcon;
    case SvgXmlIconNames.smallClock:
      return SmallClockIcon;
    case SvgXmlIconNames.arrowInCircle:
      return ArrowInCircleIcon;
    case SvgXmlIconNames.smallArrowUp:
      return SmallArrowUp;
    case SvgXmlIconNames.smallArrowDown:
      return SmallArrowDown;
    case SvgXmlIconNames.pulseAIIcon:
      return PulseAIIcon;
    case SvgXmlIconNames.recentTradesSoon:
      return RecentTradesSoon;
    case SvgXmlIconNames.pulseActive:
      return PulseActive
  }
  return null;
};

const SvgIcon = ({ name, size, width, height, color, style }: SvgXmlProps) => {
  const icon = getIcon(name);

  if (!icon) {
    return null;
  }

  const theme = useTheme();
  const { colors } = theme;

  const props = {
    ...(style && { style }),
    ...(size ? size : IconSize.lg),
    ...(height && { height }),
    ...(width && { width }),
    preserveAspectRatio: 'xMidYMid meet',
    color: color || colors.primary
  };

  return <SvgXml testID={`SvgXmlIcon-${name}`} xml={icon} {...props} />;
};

export { SvgXmlIconNames, SvgIcon };
export type { SvgXmlProps };
