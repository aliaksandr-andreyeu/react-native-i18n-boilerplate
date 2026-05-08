import React, { FC, useState, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonType, BaseButtonSize } from '@/components';
import RewardsWalletCard, {
  RewardsWalletItemProps,
  TRANSACTIONS_TYPE
} from '@/components/molecules/rewards-wallet-card';

export interface RecentRewardsTransactionsProps {}

export enum TRANSACTIONS_MENU {
  All = 'All',
  Standard = 'Standard',
  Cashback = 'Cashback',
  Referral = 'Referral'
}

export interface RecentRewardsTransactionsMenuProps {
  index: number;
  name: TRANSACTIONS_MENU;
  label: string;
}

const testList: RewardsWalletItemProps[] = [
  {
    id: '1',
    date: '25.03.25',
    time: '12:00',
    name: '1ST DEPOSIT',
    type: TRANSACTIONS_TYPE.Standard,
    price: '+$0.01'
  },
  {
    id: '2',
    date: '25.03.25',
    time: '12:00',
    name: 'DEPOSIT',
    type: TRANSACTIONS_TYPE.Standard,
    price: '+$0.01'
  },
  {
    id: '3',
    date: '25.03.25',
    time: '12:00',
    name: 'EURUSD',
    type: TRANSACTIONS_TYPE.Cashback,
    price: '+$0.01',
    lot: '0.01 lot'
  },
  {
    id: '4',
    date: '25.03.25',
    time: '12:00',
    name: 'EURUSD',
    type: TRANSACTIONS_TYPE.Referral,
    price: '+$0.01',
    lot: '0.01 lot'
  },
  {
    id: '5',
    date: '25.03.25',
    time: '12:00',
    name: 'EURUSD',
    type: TRANSACTIONS_TYPE.Cashback,
    price: '+$0.01',
    lot: '0.01 lot'
  }
];

const RecentRewardsTransactions: FC<RecentRewardsTransactionsProps> = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { t } = useTranslation();

  const [activeMenu, setActiveMenu] = useState<number>(0);

  const listTransactionsMenu: RecentRewardsTransactionsMenuProps[] = [
    { index: 0, name: TRANSACTIONS_MENU.All, label: t('components.molecules.recent-rewards-transactions.all-type') },
    {
      index: 1,
      name: TRANSACTIONS_MENU.Standard,
      label: t('components.molecules.recent-rewards-transactions.standard-type')
    },
    {
      index: 2,
      name: TRANSACTIONS_MENU.Cashback,
      label: t('components.molecules.recent-rewards-transactions.cashback-type')
    },
    {
      index: 3,
      name: TRANSACTIONS_MENU.Referral,
      label: t('components.molecules.recent-rewards-transactions.referral-type')
    }
  ];

  const onPressActiveMenu = useCallback((index: number) => setActiveMenu(index), []);

  const onPressSeeAllTransactions = useCallback(() => navigation.navigate(ROOT_ROUTE_NAMES.RecentRewards), []);

  const ItemSeparator = () => {
    return <View style={styles.separator} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={listTransactionsMenu}
        style={[styles.transactionsMenu, styles.shadow]}
        contentContainerStyle={styles.transactionsContentContainer}
        keyExtractor={(subItem) => `${subItem.name}-${subItem.label}`}
        renderItem={(item) => (
          <BaseButton
            type={BaseButtonType.accent}
            size={BaseButtonSize.tiny}
            style={[styles.transactionsMenuItem, activeMenu === item.index && styles.transactionsMenuActive]}
            label={item.item.label}
            labelStyle={activeMenu === item.index ? styles.invertedColor : styles.primaryColor}
            onPress={() => onPressActiveMenu(item.item.index)}
          />
        )}
      />
      <FlatList
        data={testList.slice(0, 5)}
        style={[styles.transactionsList, styles.shadow]}
        keyExtractor={(subItem) => `${subItem.type}-${subItem.name}-${subItem.id}`}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={(item) => (
          <RewardsWalletCard
            id={item.item.id}
            date={item.item.date}
            time={item.item.time}
            name={item.item.name}
            type={item.item.type}
            price={item.item.price}
            lot={item.item.lot}
          />
        )}
      />
      <BaseButton
        type={BaseButtonType.link}
        size={BaseButtonSize.large}
        style={styles.seeAll}
        label={t('screens.wallet.see-all')}
        onPress={onPressSeeAllTransactions}
      />
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, text, background }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: '#D9E1E4',
      width: '100%'
    },
    container: {
      gap: 8
    },
    shadow: {
      ...shadow6Style
    },
    transactionsContentContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    },
    primaryColor: {
      color: text.base.primary
    },
    invertedColor: {
      color: text.base.inverted
    },
    transactionsMenu: {
      backgroundColor: base.white,
      padding: 2,
      borderRadius: 16
    },
    transactionsMenuItem: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: base.white
    },
    transactionsMenuActive: {
      backgroundColor: background.interaction.context.rewards.strong
    },
    transactionsList: {
      borderRadius: 16,
      paddingTop: 8,
      paddingHorizontal: 12,
      paddingBottom: 1,
      backgroundColor: base.white
    },
    seeAll: {
      flex: 1
    }
  });
};

export default RecentRewardsTransactions;
