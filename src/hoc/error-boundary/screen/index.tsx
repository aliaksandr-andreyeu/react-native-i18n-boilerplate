import React, { FC } from 'react';
import {
  Image,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import RNRestart from 'react-native-restart';
import { theme, UserTheme, config } from '@/constants';
import { useTranslation } from 'react-i18next';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  headerBar: { height },
  fonts: { generalSans },
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const ErrorBoundaryScreen: FC = () => {
  const { t } = useTranslation();

  const { lightTheme, darkTheme } = theme;
  const scheme = useColorScheme();

  const currentTheme = scheme === 'dark' ? darkTheme : lightTheme;
  const styles = useStyles(currentTheme);

  const { colors } = currentTheme;

  const reloadAppHandler = () => {
    RNRestart.Restart();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <SvgIcon name={SvgXmlIconNames.logo} size={IconSize.lg} color={colors.accent} />
      </View>
      <ScrollView keyboardShouldPersistTaps={'never'} style={styles.content} contentContainerStyle={styles.scrollBox}>
        <View style={styles.body}>
          <Image style={styles.img} resizeMode='contain' source={images.depositError} />
          <View style={styles.control}>
            <View style={styles.text}>
              <Text style={styles.title}>{t('errors.modal-error-title')}</Text>
              <Text style={styles.subtitle}>{t('errors.common')}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              hitSlop={hitSlop}
              style={styles.button}
              onPress={reloadAppHandler}
            >
              <Text style={styles.buttonDesc}>{t('errors.reload-app')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface Styles extends CommonStyles {
  safe: ViewStyle;
  content: ViewStyle;
  scrollBox: ViewStyle;
  header: ViewStyle;
  body: ViewStyle;
  img: ImageStyle;
  control: ViewStyle;
  text: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  button: ViewStyle;
  buttonDesc: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base }
  } = theme;

  const commonStyles = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    ...commonStyles,
    safe: {
      flexGrow: 1
    },
    content: {
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1,
      justifyContent: 'center'
    },
    header: {
      height,
      paddingHorizontal: 20,
      justifyContent: 'center'
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 96,
      gap: 12
    },
    img: {
      width: 96,
      height: 90,
      alignSelf: 'center'
    },
    control: {
      gap: 24
    },
    text: {
      alignItems: 'center',
      alignSelf: 'center',
      gap: 12
    },
    title: {
      color: graphite['900'],
      textAlignVertical: 'top',
      textAlign: 'center',
      fontSize: 16,
      fontFamily: generalSans.semiBold
    },
    subtitle: {
      textAlignVertical: 'top',
      textAlign: 'center',
      fontSize: 13,
      fontFamily: generalSans.medium,
      color: '#5D7278'
    },
    button: {
      paddingVertical: 2,
      paddingHorizontal: 20,
      borderRadius: 8,
      height: 42,
      backgroundColor: graphite['900'],
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    buttonDesc: {
      fontSize: 14,
      fontFamily: generalSans.medium,
      color: base.white,
      textAlignVertical: 'top',
      textAlign: 'center'
    }
  });
};

export default ErrorBoundaryScreen;
