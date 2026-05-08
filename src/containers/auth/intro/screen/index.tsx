import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { AUTH_ROUTE_NAMES, AuthRootParamsList, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { config, testIDs } from '@/constants';
import {
  View,
  TouchableOpacity,
  ImageSourcePropType,
  FlatList,
  ListRenderItemInfo,
  ImageBackground
} from 'react-native';
import {
  BaseText,
  BaseTextVariant,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseRiskWarning,
  BaseImage
} from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { images } from '@/assets';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnUI,
  runOnJS,
  FadeInRight,
  FadeOutLeft,
  CurvedTransition,
  cancelAnimation,
  useAnimatedScrollHandler,
  useAnimatedReaction
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import useAsyncStorage from '@/hooks/asyncstorage';
import { useAppDispatch } from '@/hooks';
import { actions } from '@/store';
import useStyles from './styles';
import { mixpanelCreateAccountButtonPressTracker, mixpanelExploreModeTappedTracker } from '@/helpers';

const {
  components: {
    links: { activeOpacity, hitSlop }
  },
  screenWidth
} = config;

const {
  auth: { setSeenIntro }
} = actions;

type IntroScreenProps = StackScreenProps<ParamListBase & AuthRootParamsList, AUTH_ROUTE_NAMES.Intro>;

interface Steps {
  title: string;
  desc: string;
  image: ImageSourcePropType | undefined;
  bg: ImageSourcePropType | undefined;
  key: string;
}

const AnimatedImageBg = Animated.createAnimatedComponent(ImageBackground);

const IntroScreen: FC<IntroScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const anim = useSharedValue(0);
  const translationX = useSharedValue(0);
  const step = useSharedValue(0);
  const scrollRef = useRef<FlatList>(null);

  const steps: Steps[] = useMemo(
    () => [
      {
        title: t('screens.intro.steps.step1.title-alt'),
        desc: t('screens.intro.steps.step1.desc-alt'),
        image: images.foreground2,
        bg: images.sliderBg1,
        key: 'item-2'
      },
      {
        title: t('screens.intro.steps.step2.title'),
        desc: t('screens.intro.steps.step2.desc-alt'),
        image: images.foreground3,
        bg: images.sliderBg2,
        key: 'item-3'
      },
      {
        title: t('screens.intro.steps.step3.title-alt'),
        desc: t('screens.intro.steps.step3.desc-alt'),
        image: images.foreground1,
        bg: images.sliderBg3,
        key: 'item-1'
      }
    ],
    [t]
  );

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { set } = useAsyncStorage<'intro'>();

  const scrollTo = useCallback((step: number) => {
    scrollRef.current?.scrollToIndex({
      index: step,
      animated: true
    });
  }, []);

  const onScrollToIndexFailed = useCallback(
    (error: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      scrollRef.current?.scrollToOffset({ offset: error.averageItemLength * error.index, animated: true });
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current?.scrollToIndex({ index: error.index, animated: true });
        }
      }, 0);
    },
    []
  );

  useAnimatedReaction(
    () => anim.value,
    (value) => {
      if (value >= 0.5 && value < 1 && step.value < 1) {
        step.value = 1;
        runOnJS(scrollTo)(step.value);
      } else if (value >= 1 && step.value < 2) {
        step.value = 2;
        runOnJS(scrollTo)(step.value);
      }
    }
  );

  const remove = () => {
    cancelAnimation(anim);
  };

  const tap = Gesture.Tap()
    .onEnd((evet) => {
      const xCoo = evet.x;
      if (xCoo <= screenWidth / 2 && step.value !== 0) {
        step.value = step.value - 1;
        runOnJS(scrollTo)(step.value);
      } else if (xCoo > screenWidth / 2 && step.value !== 2) {
        step.value = step.value + 1;
        runOnJS(scrollTo)(step.value);
      }
    })
    .maxDistance(0)
    .maxDelay(350);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      translationX.value = event.contentOffset.x;
      if (event.contentOffset.x <= screenWidth / 2) {
        step.value = 0;
      } else if (event.contentOffset.x > screenWidth / 2 && event.contentOffset.x <= screenWidth * 1.5) {
        step.value = 1;
      } else step.value = 2;

      let diff = 0;
      if (anim.value >= 1) diff = anim.value - 1;
      const value = event.contentOffset.x / (screenWidth * 2);
      anim.value = value + diff;
      let timing = 15000;
      if (step.value === 1) timing = 10000;
      else if (step.value === 2) timing = 5000;
      anim.value = withTiming(1.5, { duration: timing });
    },
    onMomentumEnd: (event) => {
      const roundOffset = Math.floor(event.contentOffset.x);
      const roundWidth = Math.floor(screenWidth * 2);
      const diff = Math.abs(1 - roundOffset / roundWidth);
      const timing = diff === 0 && roundOffset !== 0 ? 0.3 : diff;
      anim.value = withTiming(1.5, { duration: 15000 * timing });
    }
  });

  useEffect(() => {
    set('intro', true);
  }, []);

  const goToSignIn = () => {
    navigation.navigate(AUTH_ROUTE_NAMES.SignIn);
  };

  const goToSignUpIntro = () => {
    mixpanelCreateAccountButtonPressTracker('Intro');
    navigation.navigate(AUTH_ROUTE_NAMES.BonusSignUp);
  };

  const goToPulseAI = () => {
    mixpanelExploreModeTappedTracker('Intro');
    dispatch(setSeenIntro(true));

    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROOT_ROUTE_NAMES.App,
          params: {
            screen: APP_ROUTE_NAMES.Pulse,
            params: {
              screen: PULSEAI_ROUTE_NAMES.PulseAI
            }
          }
        }
      ]
    });
  };

  useEffect(() => {
    anim.value = withTiming(1.5, { duration: 15000 });
    return () => {
      runOnUI(remove);
    };
  }, []);

  const animBar1 = useAnimatedStyle(() => {
    const width = interpolate(anim.value, [0, 0.5], [0, 100], 'clamp');

    return {
      height: '100%',
      width: `${width}%`,
      backgroundColor: theme.palette.graphite['900'],
      borderRadius: 30
    };
  }, [theme.dark]);

  const animBar2 = useAnimatedStyle(() => {
    const width = interpolate(anim.value, [0.5, 1], [0, 100], 'clamp');

    return {
      width: `${width}%`,
      height: '100%',
      backgroundColor: theme.palette.graphite['900'],
      borderRadius: 30
    };
  }, [theme.dark]);

  const animBar3 = useAnimatedStyle(() => {
    const width = interpolate(anim.value, [1, 1.5], [0, 100], 'clamp');

    return {
      width: `${width}%`,
      height: '100%',
      backgroundColor: theme.palette.graphite['900'],
      borderRadius: 30
    };
  }, [theme.dark]);

  const Title = useCallback(
    ({ title, desc }: { title: string; desc: string }) => {
      return (
        <Animated.View
          layout={CurvedTransition}
          style={styles.titleContainer}
          entering={FadeInRight.duration(500)}
          exiting={FadeOutLeft.duration(500)}
        >
          <BaseText variant={BaseTextVariant.authTitle}>{title}</BaseText>
          <BaseText variant={BaseTextVariant.authSmall}>{desc}</BaseText>
        </Animated.View>
      );
    },
    [theme.dark]
  );

  const renderStep = useCallback(
    ({ item }: ListRenderItemInfo<Steps>) => (
      <Animated.View style={styles.step} key={item.key}>
        <BaseImage resizeMode='contain' style={styles.img} source={item.image} />
      </Animated.View>
    ),
    [theme.dark]
  );

  const animImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -translationX.value }],
      width: screenWidth * 3,
      height: '100%'
    };
  }, []);

  const animTitleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -translationX.value }]
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToSignIn}
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          testID={testIDs.intro.signIn}
        >
          <BaseText variant={BaseTextVariant.authLink}>{t('screens.intro.signin')}</BaseText>
        </TouchableOpacity>
      </View>
      <Animated.View layout={CurvedTransition} style={styles.animContainer}>
        <Animated.View style={[styles.titleListContainer, animTitleStyle]}>
          {steps.map((item) => {
            return <Title key={item.title} title={item.title} desc={item.desc} />;
          })}
        </Animated.View>
        <GestureDetector gesture={tap}>
          <View style={styles.flex}>
            <AnimatedImageBg
              resizeMode={screenWidth > 360 ? 'stretch' : undefined}
              style={animImageStyle}
              source={images.introBg}
            />
            <Animated.FlatList
              ref={scrollRef}
              horizontal
              bounces={false}
              initialNumToRender={3}
              layout={CurvedTransition}
              style={styles.stepsList}
              contentContainerStyle={styles.stepsListContainer}
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              data={steps}
              pagingEnabled
              decelerationRate={0.85}
              onScrollToIndexFailed={onScrollToIndexFailed}
              snapToInterval={screenWidth}
              renderItem={renderStep}
            />
          </View>
        </GestureDetector>
      </Animated.View>
      <Animated.View layout={CurvedTransition} style={styles.bar}>
        <View style={styles.barContainer}>
          <Animated.View style={animBar1} />
        </View>
        <View style={styles.barContainer}>
          <Animated.View style={animBar2} />
        </View>
        <View style={styles.barContainer}>
          <Animated.View style={animBar3} />
        </View>
      </Animated.View>
      <Animated.View layout={CurvedTransition} style={styles.buttonBox}>
        <BaseButton
          fullWidth={true}
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          label={t('screens.intro.goto-signup-intro')}
          onPress={goToSignUpIntro}
        />
        <BaseButton
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.intro.goto-app')}
          type={BaseButtonType.accent}
          onPress={goToPulseAI}
        />

        <BaseRiskWarning />
      </Animated.View>
    </SafeAreaView>
  );
};

export default IntroScreen;
