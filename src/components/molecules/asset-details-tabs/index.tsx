import React, { FC, useMemo, memo } from 'react';
import { View, TouchableOpacity, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { BaseText, BaseTextVariant } from '@/components';
import { useTheme, CommonActions } from '@react-navigation/native';
import { useCommonStyles } from '@/hooks';
import { UserTheme, config } from '@/constants';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

const {
  components: {
    buttons: { hitSlop, activeOpacity }
  }
} = config;

interface BaseAssetDetailsTabsProps {
  navigation: MaterialTopTabBarProps['navigation'];
  state: MaterialTopTabBarProps['state'];
}

const BaseAssetDetailsTabs: FC<BaseAssetDetailsTabsProps> = ({ navigation, state }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const { routes: stateRoutes, index: stateIndex, key: stateKey } = state;

  const tabList = useMemo(
    () =>
      stateRoutes.map((route, index, routes) => {
        const { name: routeName, key: routeKey } = route;

        const focused = Boolean(stateIndex === index);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: routeKey,
            canPreventDefault: true
          });

          if (!focused && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate({ name: routeName, merge: true }),
              target: stateKey
            });
          }
        };

        return (
          <TouchableOpacity
            key={routeKey}
            onPress={onPress}
            style={[
              styles.tabBtn,
              {
                ...(focused && styles.tabBtnActive)
              }
            ]}
            activeOpacity={activeOpacity}
            hitSlop={hitSlop}
          >
            <BaseText
              variant={BaseTextVariant.small}
              style={[
                styles.tabLabel,
                {
                  ...(focused && styles.tabLabelActive)
                }
              ]}
            >
              {routeName}
            </BaseText>
          </TouchableOpacity>
        );
      }),
    [navigation, stateRoutes, stateIndex, stateKey, styles]
  );

  return <View style={styles.container}>{tabList}</View>;
};

interface Styles {
  container: ViewStyle;
  tabBtn: ViewStyle;
  tabBtnActive: ViewStyle;
  tabLabel: TextStyle;
  tabLabelActive: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    tabBtn: {
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: base.white,
      ...shadow6Style
    },
    tabBtnActive: {
      backgroundColor: graphite['900']
    },
    tabLabel: {
      color: graphite['900']
    },
    tabLabelActive: {
      color: base.white
    }
  });
};

export default memo(BaseAssetDetailsTabs);
