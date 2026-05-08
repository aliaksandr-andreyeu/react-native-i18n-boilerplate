import React, { FC, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { BaseText, BaseCaption, BaseTextVariant, BaseInvestmentCard } from '@/components';
import { config, UserTheme } from '@/constants';
import { IdeaData } from '@/types';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { IconSize } from '@/assets';

const {
  components: {
    links: { activeOpacity, hitSlop }
  },
} = config;

interface IdeasWidgetData {
  getIdeas: () => void;
  refreshing: boolean;
  ideas: {
    loading: boolean;
    data: IdeaData[];
    error: string | null;
  };
  testID?: string;
}


function getRandomFeaturedElements(arr: IdeaData[], count: number) {
  const n = arr.length;
  const selectedCount = Math.min(count, n);

  for (let i = 0; i < selectedCount; i++) {
    const j = i + Math.floor(Math.random() * (n - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, selectedCount)
}

const IdeasWidget: FC<IdeasWidgetData> = ({ getIdeas, ideas, refreshing, testID  }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { loading, data: ideasData, error } = ideas || {};

  const data = useMemo(() => {
    return getRandomFeaturedElements([...ideasData], 4);
  }, [ideasData, refreshing]);

  const { width } = useWindowDimensions();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const isEmpty = Boolean(!(data && Array.isArray(data) && data.length > 0));

  const ideasLoader = useMemo(() => {
    if (!loading) {
      return null;
    }

    const loaderHeight = 190;
    const widgetWidth = 154;
    const widgetHeight = 190
    const loaderWidth = widgetWidth * 4 + 3 * 12 + 40;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} testID={testID}>
        <ContentLoader
          speed={2}
          width={loaderWidth}
          style={{ minHeight: loaderHeight }}
          viewBox={`0 0 ${loaderWidth} ${loaderHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={graphite['050']}
        >
          <Rect x={20} y={0} rx='12' ry='12' width={widgetWidth} height={widgetHeight} />
          <Rect x={widgetWidth + 32} y={0} rx='12' ry='12' width={widgetWidth} height={widgetHeight} />
          <Rect x={widgetWidth * 2 + 44} y={0} rx='12' ry='12' width={widgetWidth} height={widgetHeight} />
          <Rect x={widgetWidth * 3 + 56} y={0} rx='12' ry='12' width={widgetWidth} height={widgetHeight} />
        </ContentLoader>
      </ScrollView>

    );
  }, [loading, styles, width]);

  const ideasError = useMemo(() => {
    if (!error) {
      return null;
    }
    const onPress = () => {
      getIdeas && typeof getIdeas === 'function' && getIdeas();
    };
    return (
      <View style={styles.noIdeas}>
        <View style={styles.noContent}>
          <BaseText style={styles.noContentTitle} variant={BaseTextVariant.textSemiBold}>
            {t('messages.problem-loading-data.title')}
          </BaseText>
          <BaseText style={styles.noContentDesc} variant={BaseTextVariant.small}>
            {t('messages.problem-loading-data.desc')}
          </BaseText>
          <TouchableOpacity
            style={styles.noContentLinkBox}
            hitSlop={hitSlop}
            activeOpacity={activeOpacity}
            onPress={onPress}
          >
            <BaseText style={styles.noContentLink}>{t('messages.problem-loading-data.link')}</BaseText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [t, styles, error, getIdeas]);

  const ideasEmpty = useMemo(() => {
    if (!isEmpty) {
      return null;
    }
    return (
      <View style={styles.noIdeas}>
        <View style={styles.noContent}>
          <BaseText style={styles.noContentTitle} variant={BaseTextVariant.textSemiBold}>
            {t('screens.ideas-hub.investment-ideas.no-data')}
          </BaseText>
        </View>
      </View>
    );
  }, [t, styles, isEmpty]);

  const goToCategories = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.WidgetList, { isInvestment: true });
  };

  const goToDetails = (ideaId: number) => {
    if (ideaId === undefined) {
      return;
    }
    navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, {
      id: ideaId,
      isInvestment: true
    });
  };

  const ideasComponent = useMemo(() => {
    if (loading) {
      return ideasLoader;
    }
    if (error) {
      return ideasError;
    }
    if (isEmpty) {
      return ideasEmpty;
    };

    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.contentStyle}
      >
        {data.map((item, index) => {
          return (
            <BaseInvestmentCard
              onPress={goToDetails}
              image={item.image}
              title={item.shortTitle}
              index={index}
              id={item.id}
              key={item.id}
            />
          )
        })}
      </ScrollView>
    );
  }, [styles, ideasLoader, ideasError, ideasEmpty, data]);

  return (
    <View style={styles.container}>
      <BaseCaption
        style={styles.caption}
        iconSize={IconSize.xsm}
        labelStyle={BaseTextVariant.captionSemiBold}
        label={t('screens.wallet.investment-ideas')}
        goTo={goToCategories}
      />
      {ideasComponent}
    </View>
  );
};

const useStyles = ({ palette: { purple } }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16
    },
    noIdeas: {
      paddingHorizontal: 20,
      paddingVertical: 16,

      alignItems: 'center',
      justifyContent: 'center'
    },
    noContent: {
      minHeight: 215,

      alignItems: 'center',
      justifyContent: 'center'
    },
    noContentTitle: {
      textAlign: 'center'
    },
    noContentDesc: {
      marginTop: 8,
      textAlign: 'center'
    },
    noContentLinkBox: {
      marginTop: 24
    },

    noContentLink: {
      textAlign: 'center',
      color: purple['500']
    },

    ideas: {
      flexDirection: 'row',
      gap: 12
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 0
    },
    widgetContainer: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center'
    },
    columnGap: { gap: 12 },
    caption: {
      paddingHorizontal: 20
    },
    contentStyle: {
      paddingBottom: 37,
      gap: 12,
      paddingHorizontal: 20
    }
  });

export default IdeasWidget;
