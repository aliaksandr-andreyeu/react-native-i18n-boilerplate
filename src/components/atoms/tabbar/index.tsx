import React, { useCallback, memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';
import { portfolioSlice } from '@/store/slices';
import BaseButton, { BaseButtonSize, BaseButtonType } from '../button';
import { capitalizeWord } from '@/helpers';

export interface IBarRoutes {
  index: number;
  name: string;
  label: string;
}

interface IBaseTabBar {
  navigation: MaterialTopTabBarProps['navigation'];
  state: MaterialTopTabBarProps['state'];
  descriptors: MaterialTopTabBarProps['descriptors'];
}

const {
  actions: { setActiveTab }
} = portfolioSlice;

const BaseTabBar: React.FC<IBaseTabBar> = ({ navigation, descriptors, state }) => {
  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);

  const activeIndex = useAppSelector((store) => store.portfolio.activeTab);

  const getTestId = (index: number) => {
    const testIdArr = [
      testIDs.portfolio.tabs.overview,
      testIDs.portfolio.tabs.positions,
      testIDs.portfolio.tabs.orders,
      testIDs.portfolio.tabs.history,
    ];

    return testIdArr[index] || '';
  }

  const Item = useCallback(
    ({ index, name, label }: IBarRoutes) => {
      const onPress = () => {
        if (index === activeIndex) return;
        dispatch(setActiveTab(index));
        navigation.navigate(name);
      };

      const selected = activeIndex === index;
      const backgroundColor = selected ? theme.palette.graphite['900'] : theme.palette.base.white;
      const color = selected ? theme.palette.base.white : theme.palette.graphite['900'];
      const testID = getTestId(index)


      return (
        <BaseButton
          type={BaseButtonType.primary}
          style={[styles.buttonStyle, { backgroundColor }]}
          testID={testID}
          labelStyle={{ color }}
          onPress={onPress}
          size={BaseButtonSize.extraSmall}
          label={label}
        />
      );
    },
    [activeIndex, theme.dark, getTestId]
  );

  return (
    <View>
      <ScrollView
        style={styles.alignSelf}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        testID={testIDs.components.atoms.tabbar.scrollView}
      >
        {state.routes.length > 0 &&
          state.routes.map((item, index) => {
            const { key: routeKey } = item;
            const { options } = descriptors[routeKey];
            const { tabBarLabel } = options || {};
            return <Item index={index} name={item.name} label={capitalizeWord(tabBarLabel as string)} key={item.key} />;
          })}
      </ScrollView>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      justifyContent: 'center'
    },
    alignSelf: {
      alignSelf: 'flex-start'
    },
    tabs: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 3,
      paddingVertical: 12,
      paddingHorizontal: 20,
      gap: 12,
      alignSelf: 'flex-start'
    },
    buttonStyle: {
      borderWidth: 0,
      paddingHorizontal: 8,
      ...shadow6Style
    }
  });
};
export default memo(BaseTabBar);
