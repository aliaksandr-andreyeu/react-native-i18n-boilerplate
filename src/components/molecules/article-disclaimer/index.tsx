import { BaseText } from '@/components/atoms';
import { testIDs, UserTheme } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';

type ArticleDisclaimerProps = {
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
};

const ArticleDisclaimer = ({ textStyle, containerStyle }: ArticleDisclaimerProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  return (
    <View testID={testIDs.components.molecules.articleDisclaimer.container} style={[styles.lastSection, containerStyle]}>
      <BaseText style={[styles.disclaimer, textStyle]}>{t('screens.ideas-hub.disclaimer')}</BaseText>
    </View>
  );
};

export default ArticleDisclaimer;

const useStyles = ({ palette: { graphite, base, purple, green, red } }: UserTheme) =>
  StyleSheet.create({
    lastSection: {
      paddingHorizontal: 30,
      paddingVertical: 40,
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      marginTop: 5
    },
    disclaimer: {
      lineHeight: 23
    }
  });
