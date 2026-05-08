import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { TopicEventScheduleElement } from '@/store/slices/ideas-hub/types';
import { useCommonStyles } from '@/hooks';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';

interface IUpcomingEvent {
  title: string;
  events: TopicEventScheduleElement[];
}

interface IEvent {
  primaryText: string;
  secondaryText: string;
  day: string;
  time: string;
  index: number;
  testID?: string;

}

const UpcomingEvent: React.FC<IUpcomingEvent> = ({ events = [], title = '' }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const Event = useCallback(
    ({ day, primaryText, secondaryText, time, index, testID }: IEvent) => {
      const delay = index * 400 + 200;

      return (
        <View testID={testID} style={styles.eventContainer}>
          <View style={styles.top}>
            <Animated.View entering={FadeInDown.delay(delay).springify()}>
              <BaseText variant={BaseTextVariant.titleXXS} style={styles.textAlign}>
                {primaryText}
              </BaseText>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(delay + 200).springify()}>
              <BaseText variant={BaseTextVariant.extraSmall} style={[styles.textAlign, styles.grayText]}>
                {secondaryText}
              </BaseText>
            </Animated.View>
          </View>
          <View style={styles.bottom}>
            <Animated.View entering={FadeInLeft.delay(delay).springify()} style={styles.wrapper}>
              <SvgIcon size={IconSize.xs} name={SvgXmlIconNames.calendar} color={theme.palette.base.white} />
              <BaseText style={styles.whiteText} variant={BaseTextVariant.tiny}>
                {day}
              </BaseText>
            </Animated.View>
            <Animated.View entering={FadeInRight.delay(delay).springify()} style={styles.wrapper}>
              <SvgIcon size={IconSize.xs} name={SvgXmlIconNames.roundClock} color={theme.palette.base.white} />
              <BaseText style={styles.whiteText} variant={BaseTextVariant.tiny}>
                {time}
              </BaseText>
            </Animated.View>
          </View>
        </View>
      );
    },
    [theme.dark]
  );

  return (
    <View style={styles.container}>
      {!!title.length && <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>}
      <View style={styles.list}>
        {events.map((item, index) => {
          return <Event testID={testIDs.components.molecules.upcomingEventTopics.upcomingEvent(item.primaryText || index)} {...item} index={index} key={`${item.id}-event-topic`} />;
        })}
      </View>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, purple }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      gap: 16,
      paddingHorizontal: 20
    },
    eventContainer: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 24,
      borderRadius: 16,
      backgroundColor: base.white,
      ...shadow6Style
    },
    top: {
      gap: 4
    },
    bottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    wrapper: {
      paddingVertical: 4,
      paddingLeft: 6,
      paddingRight: 8,
      gap: 4,
      backgroundColor: purple[500],
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center'
    },
    textAlign: {
      textAlign: 'center'
    },
    grayText: {
      color: '#8890A1'
    },
    whiteText: {
      color: base.white
    },
    list: { gap: 12 }
  });
};

export default memo(UpcomingEvent);
