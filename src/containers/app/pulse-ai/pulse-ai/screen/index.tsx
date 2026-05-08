import React, { FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { PULSEAI_ROUTE_NAMES, PulseAIRootParamsList } from '@/navigation/app/stacks';
import { SvgIcon, SvgXmlIconNames } from '@/assets';
import { useAppSelector, useCommonStyles } from '@/hooks';
import { RootRootParamsList } from '@/navigation/app';
import { BaseButton, BaseButtonType, BaseText, BaseTextVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft } from 'react-native-reanimated';
import { ComingSoonBottomSheet, Popup } from '../../components';
import PagerView from 'react-native-pager-view';
import { OpenPosition } from '@/components/templates/app/pulse';
import { TopPerformers, TopSignals } from '../..';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { pulseScreenOpenMixpanel, TradeSource } from '@/helpers';
import { useGetTradingAccountsMutation } from '@/store/api';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { OpenPositionData } from '@/store/api/pulse/types';

type PulseAIScreenProps = StackScreenProps<PulseAIRootParamsList & RootRootParamsList, PULSEAI_ROUTE_NAMES.PulseAI>;

const {
  headerBar: {
    buttons: { activeOpacity }
  },
  screenWidth,
  isIOS
} = config;

export enum PulseSections {
  PERFORMERS = 'top_performers',
  SIGNALS = 'top_signals',
  TRADES = 'profitable_trades'
}

interface TabIconSize {
  width: number;
  height: number;
}

export interface PulseSectionsData {
  id: PulseSections;
  headIconSize: TabIconSize;
  tabIconSize: TabIconSize;
  title: string;
  tabIcon: SvgXmlIconNames;
  activeColor: string;
  popup: {
    desc: string;
    descTitle: string;
    bottomInfo: string;
  };
  borders: {
    active: {
      top: number;
      left: number;
      right: number;
    };
    inactive: {
      top: number;
      left: number;
      right: number;
    };
  };
}

const PulseAIScreen: FC<PulseAIScreenProps> = ({ navigation, route }) => {
  const [currentTab, setCurrentTab] = useState<string>('All');
  const [currentSection, setCurrentSection] = useState<PulseSections>(PulseSections.PERFORMERS);
  const [positionData, setPositionData] = useState<OpenPositionData | null>(null);
  const lastData = useRef<null | OpenPositionData>(null);

  const [_, startTransition] = useTransition();

  const [getAccounts, { isLoading: tradingAccountsLoading }] = useGetTradingAccountsMutation();

  const isLocked = useRef<boolean>(false);
  const timeRef = useRef<NodeJS.Timeout>(undefined);

  const comingSoonRef = useRef<BottomSheetModal>(null);
  const pagerRef = useRef<PagerView>(null);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const tradingAccount = useAppSelector((store) => store.wallet.accounts.trading);

  const isAuthorized = Boolean(accessToken);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const sectionsData = useMemo(
    (): Record<PulseSections, PulseSectionsData> => ({
      [PulseSections.PERFORMERS]: {
        id: PulseSections.PERFORMERS,
        title: t('screens.pulse.sections.top-performers'),
        activeColor: '#1DBF73',
        popup: {
          descTitle: t('screens.pulse.sections.top-performers-desc-title'),
          desc: t('screens.pulse.sections.top-performers-desc'),
          bottomInfo: t('screens.pulse.sections.top-performers-info')
        },
        borders: {
          inactive: {
            top: 0.3,
            left: 0,
            right: 0
          },
          active: {
            left: 0,
            top: 0,
            right: 0
          }
        },
        tabIcon: SvgXmlIconNames.topPerformers,
        headIconSize: { width: 18, height: 17 },
        tabIconSize: { width: 22.3, height: 20.19 }
      },
      [PulseSections.SIGNALS]: {
        id: PulseSections.SIGNALS,
        title: t('screens.pulse.sections.top-signals'),
        activeColor: '#8B5CF6',
        popup: {
          descTitle: t('screens.pulse.sections.top-signals-desc-title'),
          desc: t('screens.pulse.sections.top-signals-desc'),
          bottomInfo: t('screens.pulse.sections.top-signals-info')
        },
        borders: {
          inactive: {
            top: 0.3,
            left: 0.3,
            right: 0.3
          },
          active: {
            left: 0.3,
            top: 0,
            right: 0.3
          }
        },
        tabIcon: SvgXmlIconNames.topSignals,
        headIconSize: { width: 18.4, height: 14.05 },
        tabIconSize: { width: 26.26, height: 20.05 }
      },
      [PulseSections.TRADES]: {
        id: PulseSections.TRADES,
        activeColor: '#FBBF24',
        title: t('screens.pulse.sections.recent-trades'),
        popup: {
          descTitle: t('screens.pulse.sections.recent-trades-desc-title'),
          desc: t('screens.pulse.sections.recent-trades-desc'),
          bottomInfo: t('screens.pulse.sections.recent-trades-info')
        },
        borders: {
          inactive: {
            top: 0.3,
            left: 0,
            right: 0
          },
          active: {
            left: 0,
            top: 0,
            right: 0
          }
        },
        tabIcon: SvgXmlIconNames.recentTradesSoon,
        headIconSize: { width: 17, height: 14.54 },
        tabIconSize: { width: 68, height: 21 }
      }
    }),
    [t]
  );

  const currentSectionData = useMemo(() => sectionsData[currentSection], [currentSection, sectionsData]);

  const sections = useMemo(
    () =>
      Object.values(sectionsData).map(({ borders, activeColor, id, tabIconSize, tabIcon }) => ({
        borders,
        activeColor,
        id,
        tabIconSize,
        tabIcon
      })),
    [sectionsData]
  );

  const changeTab = useCallback(
    (index: number) => () => {
      if (index === 2) return comingSoonRef.current?.present();
      if (isLocked.current) return;
      isLocked.current = true;
      clearTimeout(timeRef.current);

      pagerRef.current?.setPage(index);
      timeRef.current = setTimeout(() => (isLocked.current = false), isIOS ? 300 : 200);
    },
    [isIOS]
  );

  const pulseSections = useMemo(() => {
    return sections.map((item, index) => {
      const isActive = currentSection === item.id;
      const borders = item.borders[isActive ? 'active' : 'inactive'];
      return (
        <View
          key={item.id}
          style={[
            styles.sectionItem,
            {
              borderTopWidth: borders.top,
              borderLeftWidth: borders.left,
              borderRightWidth: borders.right
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={changeTab(index)}
            style={styles.section}
            disabled={isActive}
          >
            <SvgIcon
              name={item.tabIcon}
              color={isActive ? item.activeColor : theme.palette.icon.base.tertiary}
              size={item.tabIconSize}
            />
          </TouchableOpacity>
        </View>
      );
    });
  }, [currentSection, sections, theme.dark, activeOpacity]);

  const isIslamicAccount = useMemo(() => {
    if (!isAuthorized) return false;
    return tradingAccount?.typeDisplayName?.toLowerCase?.()?.includes?.('islamic');
  }, [isAuthorized, tradingAccount?.typeDisplayName]);

  const pulseTabs = useMemo(() => {
    if (tradingAccountsLoading) {
      const gap = 12;
      const itemWidth = 60;
      const itemHeight = 30;

      return (
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={42}
          viewBox={`0 0 ${screenWidth} ${42}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={(theme as UserTheme).palette.graphite['050']}
        >
          {[0, 1, 2, 3].map((_, index) => {
            const x = (gap + itemWidth) * index;

            return <Rect key={index} x={x} y={5} rx='8' ry='8' width={itemWidth} height={itemHeight} />;
          })}
        </ContentLoader>
      );
    }

    return ['All', !isIslamicAccount && 'Crypto', 'Forex', 'Metal'].map((item) => {
      if (!item) return null;
      const active = currentTab === item;
      return (
        <BaseButton
          type={BaseButtonType.primary}
          style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
          labelStyle={styles.btnLabel}
          key={item}
          label={item}
          onPress={active ? undefined : () => startTransition(() => setCurrentTab(item))}
          disabled={active}
        />
      );
    });
  }, [currentTab, theme.dark, isIslamicAccount, tradingAccountsLoading]);

  const onPageSelected = useCallback((e: any) => {
    if (sections[e.nativeEvent.position].id === PulseSections.TRADES) {
      pagerRef.current?.setPage(1);
      comingSoonRef.current?.present();
      return;
    }
    setCurrentSection(sections[e.nativeEvent.position].id);
  }, []);


  const setPositionEmptyRef = useRef<boolean>(false);

  const onVisiblePress = useCallback((data: OpenPositionData) => {
    if (!setPositionEmptyRef.current) return;
    setPositionData(data || null);
    lastData.current = data || null;
  }, []);


  const onSetVisible = useCallback(() => {
    setPositionData(null);
  }, []);

  const onTryAgain = useCallback(() => {
    setPositionData(lastData.current || null);
  }, [])

  useEffect(() => {
    setPositionEmptyRef.current = !positionData;
  }, [positionData])

  useEffect(() => {
    setPositionEmptyRef.current = true;
    getAccounts();

    return () => {
      setPositionEmptyRef.current = true;
      if (timeRef.current) clearTimeout(timeRef.current);
    };
  }, []);


  useEffect(() => {
    pulseScreenOpenMixpanel({
      widget: currentSection,
      is_default: currentSection === PulseSections.PERFORMERS,
      category: currentTab
    });
  }, [currentSection]);


  return (
    <>
      <View style={styles.safe}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Animated.View
                key={currentSectionData.tabIcon}
                entering={FadeIn}
                exiting={FadeOut}
                style={[styles.iconContainer, { backgroundColor: currentSectionData.activeColor }]}
              >
                <Animated.View key={`${currentSectionData.tabIcon}-icon`} entering={FadeInRight} exiting={FadeOutLeft}>
                  <SvgIcon
                    name={currentSectionData.tabIcon}
                    color={theme.palette.base.white}
                    size={currentSectionData.headIconSize}
                  />
                </Animated.View>
              </Animated.View>
              <BaseText variant={BaseTextVariant.captionSemiBold}>{currentSectionData.title}</BaseText>
            </View>
            <Popup
              color={currentSectionData.activeColor}
              icon={currentSectionData.tabIcon}
              title={currentSectionData.title}
              bottomInfo={currentSectionData.popup.bottomInfo}
              desc={currentSectionData.popup.desc}
              descTitle={currentSectionData.popup.descTitle}
              iconSize={currentSectionData.headIconSize}
              type={currentSectionData.id}
            />
          </View>
          <View style={styles.separator} />
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContainerContent}
          >
            {pulseTabs}
          </ScrollView>
          <PagerView
            ref={pagerRef}
            initialPage={0}
            onPageSelected={onPageSelected}
            offscreenPageLimit={1}
            overdrag
            overScrollMode={'never'}
            style={styles.pagerView}
          >
            <TopPerformers onPress={onVisiblePress} tab={currentTab} isIslamic={isIslamicAccount} />
            <TopSignals onPress={onVisiblePress} isIslamic={isIslamicAccount} tab={currentTab} />
            <View />
          </PagerView>
          <BaseText variant={BaseTextVariant.small} style={[styles.infoText, styles.grayText]}>
            {t('screens.pulse.non-investment-advise')}
          </BaseText>
          <View style={styles.sectionsContainer}>{pulseSections}</View>
        </View>
      </View>
      <OpenPosition
        ask={positionData?.ask}
        bid={positionData?.bid}
        asset={positionData?.asset}
        visible={!!positionData}
        sl={positionData?.sl}
        tp={positionData?.tp}
        onTryAgain={onTryAgain}
        setVisible={onSetVisible as any}
        entry={positionData?.entry}
        confidence={positionData?.confidence}
        category={positionData?.category}
        performanceMetric={positionData?.performanceMetric}
        tradeSource={currentSection === PulseSections.SIGNALS ? TradeSource.Signals : TradeSource.TopPerformers}
      />
      <ComingSoonBottomSheet ref={comingSoonRef} />
    </>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { background, text, base }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flex: 1
    },
    grayText: {
      color: text.base.mask
    },
    headTextContainer: {
      alignSelf: 'center'
    },
    textAlign: {
      textAlign: 'center'
    },
    sectionContainer: {
      borderWidth: 0.3,
      borderColor: text.base.hint,
      marginHorizontal: 9,
      paddingTop: 12,
      marginTop: 14,
      flex: 1,
      marginBottom: 10,
      backgroundColor: base.white,
      ...shadow6Style
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between',
      paddingRight: 20,
      paddingLeft: 13
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center'
    },
    iconContainer: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#9CA3AF'
    },
    section: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',

      height: '100%'
    },
    sectionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36
    },
    sectionItem: {
      flex: 1,
      borderColor: text.title.hint
    },
    separator: {
      height: 0.6,
      backgroundColor: '#D9E1E4',
      width: screenWidth - 50,
      marginTop: 13,
      alignSelf: 'center'
    },
    tab: {
      borderColor: '#9CA3AF',
      backgroundColor: background.tag.simple.secondary,
      paddingVertical: 4,
      paddingHorizontal: 8,
      height: 30,
      borderWidth: 1.3,
      ...shadow6Style
    },
    tabActive: {
      borderColor: '#9CA3AF'
    },
    tabInactive: {
      borderColor: 'transparent'
    },
    btnLabel: {
      color: text.base.primary
    },
    tabsContainer: {
      maxHeight: 46,
      marginTop: 10,
      alignSelf: 'flex-start',
      marginBottom: 5
    },
    tabsContainerContent: {
      gap: 12,
      alignItems: 'center',
      paddingHorizontal: 15
    },
    infoText: {
      marginBottom: 20,
      marginTop: 10,
      marginHorizontal: 12
    },
    pagerView: { flex: 1 }
  });
};

export default PulseAIScreen;
