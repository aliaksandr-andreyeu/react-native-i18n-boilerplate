import { BaseText, BaseTextVariant } from '@/components';
import { UserTheme } from '@/constants';
import { formatTwoDecimals } from '@/helpers';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import { StyleSheet, ViewStyle, View, TextStyle } from 'react-native';

interface IProgressBar {
  value: number;
  maxValue: number;
  color?: string;
  legend?: string;
}

const ProgressBar: FC<IProgressBar> = ({ value, maxValue, color, legend }) => {
  const { t } = useTranslation();

  const theme = useTheme();

  const progress = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const styles = useStyles(theme, color, progress);

  const amount = `${formatTwoDecimals(maxValue - value)}$`;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={styles.progress} />
      </View>
      {legend || (
        <BaseText style={styles.legend} variant={BaseTextVariant.text}>
          {t('components.atoms.progressBar.left-to-withdraw', { amount })}
        </BaseText>
      )}
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  progressBar?: ViewStyle;
  progress?: ViewStyle;
  legend?: TextStyle;
}

const useStyles = (theme: UserTheme, color = '', progress = 50) => {
  const { palette } = theme;

  return StyleSheet.create<Styles>({
    container: {
      flexDirection: 'column',
      rowGap: 4
    },
    progressBar: {
      width: '100%',
      height: 5,
      borderRadius: 16,
      position: 'relative',
      backgroundColor: palette.graphite[100]
    },
    progress: {
      height: '100%',
      borderRadius: 16,
      position: 'absolute',
      left: 0,
      top: 0,
      backgroundColor: color || palette.green[400],
      width: `${progress}%`
    },
    legend: {
      color: palette.graphite[400]
    }
  });
};

export default ProgressBar;
