import React, { forwardRef, memo, Ref, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant, PlaceBar } from '@/components/atoms';
import { useCommonStyles } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { ContestLeader, ContestLeaderboardData } from '@/store/slices/ideas-hub/types';
import { BottomSheetModal, BottomSheetModalProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { SheetBackdrop } from '..';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

interface ILeaderBoard {
  prizeList: ContestLeaderboardData['prizeList'];
  myLeaderPlace: ContestLeader | undefined;
  leaders: ContestLeader[];
  onAnimate: BottomSheetModalProps['onAnimate'];
  onDismiss: BottomSheetModalProps['onDismiss'];
  title: string | undefined;
  ref: Ref<BottomSheetModal>;
}

const {
  screenWidth,
  buttons: { activeOpacity }
} = config;

const maxWidth = screenWidth - 52;
const minWidth = 250;

const LeaderBoard = forwardRef<Partial<BottomSheetModal>, ILeaderBoard>(
  ({ prizeList = [], myLeaderPlace, leaders, onAnimate, onDismiss, title }, ref) => {
    const { t } = useTranslation();

    const theme = useTheme();
    const styles = useStyles(theme);

    const { top, bottom } = useSafeAreaInsets();

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const scrollRef = useRef<ScrollView>(null);

    const scale = useMemo(
      () => (maxWidth - minWidth) / (prizeList.length - 1 || 1),
      [minWidth, maxWidth, prizeList.length]
    );

    const calcWidth = (max: number, index: number, scale: number) => {
      return max - index * scale;
    };

    useImperativeHandle(
      ref,
      () => ({
        dismiss: bottomSheetRef.current?.dismiss,
        present: bottomSheetRef.current?.present
      }),
      []
    );

    const separator = useMemo(() => {
      return (
        <View style={styles.separator}>
          <View style={styles.circle} />
          <View style={styles.circle} />
          <View style={styles.circle} />
        </View>
      );
    }, [theme.dark]);

    const RenderList = useCallback(
      ({
        count = 10,
        s,
        maxW,
        me
      }: {
        count?: number;
        s: number;
        maxW: number;
        me: ContestLeader | undefined;
        leaders: ContestLeader[];
      }) => {
        return (
          <View style={styles.list}>
            {!!prizeList.length &&
              prizeList.slice(0, count).map((item, index) => {
                const leader = leaders[index];

                if (!leader) return null;

                const width = calcWidth(maxW, index, s);

                return (
                  <PlaceBar
                    testID={testIDs.components.molecules.leaderBoard.place(item.id)}
                    key={`${item.id}-place`}
                    performance={leader.performance}
                    place={item.place}
                    price={item.prizeAmount}
                    width={width}
                    isMe={index + 1 === me?.position}
                  />
                );
              })}
            {me && me.position > count && (
              <>
                {separator}
                <PlaceBar testID={testIDs.components.molecules.leaderBoard.place(me.login)} performance={me.performance} place={me.position} price={0} width={250} isMe />
              </>
            )}
          </View>
        );
      },
      [theme.dark]
    );

    const LeaderBoardInside = useCallback(
      ({
        count,
        leaders,
        maxW,
        me,
        s,
        isSheet = false,
        title = ''
      }: {
        count: number;
        maxW: number;
        me: ContestLeader | undefined;
        leaders: ContestLeader[];
        s: number;
        isSheet?: boolean;
        title: string | undefined;
      }) => {
        const onSee = () => bottomSheetRef.current?.present();

        const hasTitle = !!title?.length;

        return (
          <View style={styles.container}>
            <View style={[styles.top, isSheet && styles.isSheet]}>
              {hasTitle && (
                <BaseText
                  style={[styles.leaderboard, isSheet && styles.textAlign]}
                  variant={isSheet ? BaseTextVariant.authSubTitle : BaseTextVariant.widgetTitle}
                >
                  {title}
                </BaseText>
              )}
              <TouchableOpacity testID={testIDs.components.molecules.leaderBoard.seeAll} onPress={onSee} activeOpacity={activeOpacity} style={styles.seeAllButton}>
                {isSheet || (
                  <BaseText style={styles.seeAll} variant={BaseTextVariant.titleXXS}>
                    {t('components.molecules.leader-board.see-all')}
                  </BaseText>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <BaseText style={styles.columnText} variant={BaseTextVariant.tiny}>
                {t('components.molecules.leader-board.prize')}
              </BaseText>
              <BaseText style={styles.columnText} variant={BaseTextVariant.tiny}>
                {t('components.molecules.leader-board.performance')}
              </BaseText>
            </View>
            <RenderList maxW={maxW} s={s} count={count} me={me} leaders={leaders} />
          </View>
        );
      },
      [theme.dark, t]
    );

    return (
      <>
        <LeaderBoardInside count={3} leaders={leaders} maxW={maxWidth} title={title} me={myLeaderPlace} s={scale} />
        <BottomSheetModal
          ref={bottomSheetRef}
          enableDynamicSizing
          handleStyle={styles.handle}
          handleIndicatorStyle={styles.indicator}
          enablePanDownToClose
          waitFor={scrollRef}
          onAnimate={onAnimate}
          onDismiss={onDismiss}
          backdropComponent={SheetBackdrop}
          enableDismissOnClose
          topInset={top}
        >
          <BottomSheetView style={styles.sheetView}>
            <ScrollView ref={scrollRef} contentContainerStyle={[styles.sheetList, { paddingBottom: bottom + 34 }]}>
              <LeaderBoardInside
                count={10}
                title={title}
                leaders={leaders}
                isSheet
                maxW={maxWidth}
                me={myLeaderPlace}
                s={scale}
              />
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  }
);

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { graphite, base, icon, purple } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      gap: 4,
      backgroundColor: base.white,
      marginHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      borderRadius: 12,
      ...shadow6Style
    },
    isSheet: { paddingBottom: 12, justifyContent: 'center', paddingTop: 12 },
    sheetList: { paddingTop: 20 },
    columnText: {
      color: '#8890A1'
    },
    seeAll: {
      color: purple[500]
    },
    leaderboard: {
      color: graphite['900'],
      flex: 1
    },
    seeAllButton: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end'
    },
    column: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 24,
      paddingLeft: 42,
      paddingBottom: 4
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      gap: 10
    },
    list: { gap: 8 },
    separator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      alignSelf: 'center',
      marginVertical: 4
    },
    circle: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: graphite[200]
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    handle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    sheetView: {
      backgroundColor: graphite['050']
    },
    textAlign: {
      textAlign: 'center'
    }
  });
};

export default memo(LeaderBoard);
