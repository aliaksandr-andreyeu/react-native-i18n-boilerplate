import React, { FC, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import RecentRewardsScreen from './screen';
import { IGroupBarData } from '@/components/atoms/group-bar';
import { useTranslation } from 'react-i18next';

export enum ERewardType {
  STANDARD = 'Standard',
  CASHBACK = 'Cashback',
  REFERRAL = 'Referral'
}

export interface RecentRewardsHistoryDataItem {
  id: number;
  type: ERewardType;
  value: number;
  date: string;
  description: string;
  title: string;
}

export interface RewardsHistoryData {
  title: string;
  ts: number;
  data: {
    items: RecentRewardsHistoryDataItem[];
  }[];
}

const tempData: RewardsHistoryData[] = [
  {
    title: 'Today',
    ts: 1650931200,
    data: [
      {
        items: [
          {
            id: 1,
            type: ERewardType.STANDARD,
            value: 50,
            date: '2025-09-22T14:33:06+03:00',
            description: 'Reward for trading activity',
            title: '1ST DEPOSIT'
          },
          {
            id: 2,
            type: ERewardType.CASHBACK,
            value: 20,
            date: '2025-09-22T10:15:30+03:00',
            description: 'Cashback on your recent trades',
            title: 'EURUSD'
          }
        ]
      }
    ]
  },
  {
    title: 'Tomorrow',
    ts: 1650931200,
    data: [
      {
        items: [
          {
            id: 3,
            type: ERewardType.REFERRAL,
            value: 100,
            date: '2025-09-23T09:00:00+03:00',
            description: 'Reward for referring a friend',
            title: 'EURUSD'
          },
          {
            id: 4,
            type: ERewardType.STANDARD,
            value: 75,
            date: '2025-09-23T11:45:00+03:00',
            description: 'Reward for trading activity',
            title: 'EURUSD'
          }
        ]
      }
    ]
  }
];

type RewardsProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.RecentRewards>;

const RecentRewards: FC<RewardsProps> = ({ route, navigation }) => {
  const { t } = useTranslation();

  const dataToGroupBar: IGroupBarData[] = [
    { name: 'All', label: t('screens.recent-rewards.all-type') },
    { name: 'Standard', label: t('screens.recent-rewards.standard-type') },
    { name: 'Cashback', label: t('screens.recent-rewards.cashback-type') },
    { name: 'Referral', label: t('screens.recent-rewards.referral-type') }
  ];

  const [activeItem, setActiveItem] = useState<string | undefined>(dataToGroupBar[0].name);
  const [dateRange, setDateRange] = useState<any>([]);

  return (
    <RecentRewardsScreen
      changeActiveItem={setActiveItem}
      activeItem={activeItem}
      route={route}
      navigation={navigation}
      data={tempData}
      dataToGroupBar={dataToGroupBar}
      dateRange={dateRange}
      setDateRange={setDateRange}
    />
  );
};

export default RecentRewards;
