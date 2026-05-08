import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ViewStyle, BackHandler } from 'react-native';
import { ParamListBase, useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseInput, BaseText, BaseTextVariant } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useAppSelector, useCommonStyles } from '@/hooks';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { setStoredInvitePassed } from '@/helpers';
import { useTranslation } from 'react-i18next';

type InviteScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Invite>;

const InviteScreen: React.FC<InviteScreenProps> = ({ navigation }) => {
  const [currentCase, setCurrentCase] = useState<number>(0);
  const [code, setCode] = useState('');

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const onSubmit = useCallback(() => {
    if (code === '123') setCurrentCase(1);
    else setCurrentCase(-1);
  }, [code]);

  const onChange = useCallback(
    (v: string) => {
      if ([-1, 1].includes(currentCase)) setCurrentCase(0);
      setCode(v);
    },
    [currentCase]
  );

  const inputCaseStyle = useMemo((): ViewStyle | null => {
    if (currentCase === 1) return { borderWidth: 0.7, borderColor: theme.palette.green[400] };

    return null;
  }, [currentCase, theme.dark]);

  const rightIcon = useMemo(() => {
    if (currentCase === 1)
      return <SvgIcon name={SvgXmlIconNames.check} size={IconSize.sm} color={theme.palette.green[400]} />;
    else if (currentCase === -1) return <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={'#EA4335'} />;
    return null;
  }, [currentCase]);

  const goToPulseAI = () => {
    requestAnimationFrame(() => {
      setStoredInvitePassed(userInfo.email);
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
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return backHandler.remove;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View>
          <View style={styles.header}>
            <BaseText variant={BaseTextVariant.header}>{t('screens.invite.got-an-invite')}</BaseText>
            <BaseText>{t('screens.invite.enter-it')}</BaseText>
          </View>
          <BaseInput
            inputContainerStyle={{ ...styles.inputContainer, ...inputCaseStyle }}
            title={t('screens.invite.invite-code')}
            error={currentCase === -1}
            hideClearButton
            value={code}
            rightIcon={<View style={styles.rightIcon}>{rightIcon}</View>}
            onChange={onChange}
          />
        </View>
        <View style={styles.btnContainer}>
          <BaseButton
            type={BaseButtonType.accent}
            size={BaseButtonSize.large}
            label={t('screens.invite.submit-code')}
            onPress={onSubmit}
            disableOpacity={currentCase === -1}
            disabled={currentCase === -1}
            style={[styles.submitCode, { backgroundColor: currentCase === -1 ? '#D9DDE5' : theme.palette.green[400] }]}
          />
          <BaseButton
            type={BaseButtonType.accent}
            size={BaseButtonSize.large}
            label={t('screens.invite.skip')}
            onPress={goToPulseAI}
            style={styles.skip}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: {
      base: { white }
    }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: { flex: 1 },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: 134,
      paddingTop: 34,
      paddingHorizontal: 20
    },
    header: { gap: 8 },
    inputContainer: { marginTop: 43 },
    rightIcon: { alignItems: 'center', justifyContent: 'center', right: 11 },
    submitCode: { ...shadow6Style },
    skip: { backgroundColor: white, ...shadow6Style },
    btnContainer: { gap: 19 }
  });
};

export default InviteScreen;
