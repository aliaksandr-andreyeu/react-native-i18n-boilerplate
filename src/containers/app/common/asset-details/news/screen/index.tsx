import React, { FC, memo } from 'react';
import { ScrollView } from 'react-native';
import { BaseText } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface AssetDetailsNewsScreenProps { }

const AssetDetailsNewsScreen: FC<AssetDetailsNewsScreenProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <BaseText>{t('screens.common.news')}</BaseText>
      </ScrollView>
    </SafeAreaView>
  );
};

export default memo(AssetDetailsNewsScreen);
