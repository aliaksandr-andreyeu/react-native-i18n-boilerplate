import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { useCommonStyles, useDateRange } from '@/hooks';
import { useGetPromoLegalDocumentsQuery } from '@/store/api';
import { LegalDocumentData, ParsedPromoLegalDocs } from '@/store/slices/ideas-hub/types';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';

const { screenWidth } = config;

interface IPromoDocs {
  promoDocs: LegalDocumentData[];
  title: string;
}

const PromoDocs: React.FC<IPromoDocs> = ({ promoDocs = [], title }) => {
  const {
    i18n: { language }
  } = useTranslation();

  const [getPromoDocs] = useGetPromoLegalDocumentsQuery();

  const { addData, newData } = useDateRange<ParsedPromoLegalDocs>();

  useEffect(() => {
    if (promoDocs.length) {
      let promoFilters = '';
      const ids = promoDocs.map((item) => item.id);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        promoFilters += `${promoFilters.length ? '&' : '?'}filters[id][$in][${i}]=${id}`;
      }
      promoFilters += `&populate=*`;
      const makeLocale = (lang: string) => `&locale=${lang}`;

      (async () => {
        try {
          const docsData = await getPromoDocs(promoFilters + makeLocale(language)).unwrap();
          addData(docsData, 'promo-docs');
          if (language === 'en' || docsData.length) return;
          getPromoDocs(promoFilters + makeLocale('en'));
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [promoDocs, language]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const docs = useMemo(() => {
    const docData = newData['promo-docs'];
    if (!docData || !docData?.length) return [];

    return docData.sort((a, b) => b.sortOrder - a.sortOrder);
  }, [newData]);

  const Doc = useCallback(
    ({ title, url, testID }: { title: string; url: string, testID: string }) => {
      const onPress = async () => {
        if (url) {
          const canOpen = await Linking.canOpenURL(url);
          if (!canOpen) return;
          Linking.openURL(url);
        }
      };

      return (
        <Pressable testID={testID} onPress={onPress} style={styles.doc}>
          <SvgIcon name={SvgXmlIconNames.file} color={theme.palette.purple[500]} size={IconSize.sm} />
          <BaseText variant={BaseTextVariant.small}>{title}</BaseText>
        </Pressable>
      );
    },
    [theme.dark]
  );

  const Seperator = useCallback(() => {
    return (
      <Animated.View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  if (!docs.length) return null;

  return (
    <>
      <Seperator />
      <View style={styles.container}>
        {!!title?.length && <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>}
        <View style={styles.list}>
          {docs.map((item) => {
            return <Doc testID={testIDs.components.molecules.promoDocs.button(item.id)} title={item.title} url={item.url} key={`${item.id}-legal-docs`} />;
          })}
        </View>
      </View>
    </>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      gap: 16,
      marginHorizontal: 20
    },
    list: {
      gap: 8
    },
    doc: {
      paddingVertical: 25,
      backgroundColor: base.white,
      paddingLeft: 16,
      paddingRight: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      ...shadow6Style
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: graphite[100],
      gap: 8,
      marginTop: 10
    },
    seperatorUp: {
      width: '100%',
      height: 20,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    }
  });
};

export default memo(PromoDocs);
