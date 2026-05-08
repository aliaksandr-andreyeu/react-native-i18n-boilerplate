import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { FAQData } from '@/store/slices/ideas-hub/types';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { BaseFAQ } from '..';
import { useTranslation } from 'react-i18next';

interface IPromoFAQ {
  faqList: FAQData[];
}

const PromoFAQ: React.FC<IPromoFAQ> = ({ faqList = [] }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <BaseText variant={BaseTextVariant.captionSemiBold}>{t('components.molecules.promo-faq.faq')}</BaseText>
      <View style={styles.list}>
        {faqList &&
          !!faqList?.length &&
          faqList.map((item) => {
            return <BaseFAQ testID={testIDs.components.molecules.faq.button(item.id)} key={`${item.id}-faq`} answer={item.answer} question={item.question} />;
          })}
      </View>
    </View>
  );
};

const useStyles = ({ palette: { } }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16,
      marginHorizontal: 20
    },
    list: {
      gap: 8
    }
  });

export default memo(PromoFAQ);
