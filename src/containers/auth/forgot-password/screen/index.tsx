import React, { FC, useMemo, useState, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import { Keyboard } from 'react-native';
import { ForgotPasswordForm, ResetPasswordForm } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import useStyles from './styles';

type ForgotPasswordScreenProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.ForgotPassword>;

const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = ({ route, navigation }) => {
  const [isResetPassword, setResetPassword] = useState<boolean>(false);
  const [isKeyboard, setKeyboard] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const theme = useTheme();
  const styles = useStyles(theme);

  const setInitialState = () => {
    setResetPassword(false);
    setKeyboard(false);
    setEmail('');
  };

  useFocusEffect(
    useCallback(() => {
      const showKeyboard = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
      const hideKeyboard = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

      setInitialState();
      return () => {
        showKeyboard.remove();
        hideKeyboard.remove();

        setInitialState();
      };
    }, [route, navigation])
  );

  const onKeyboardDidShow = () => {
    setKeyboard(true);
  };
  const onKeyboardDidHide = () => {
    setKeyboard(false);
  };

  const formComponent = useMemo(() => {
    if (isResetPassword) {
      return <ResetPasswordForm email={email} setResetPassword={setResetPassword} />;
    }
    return <ForgotPasswordForm setEmail={setEmail} setResetPassword={setResetPassword} />;
  }, [isKeyboard, isResetPassword, setEmail, email]);

  return <SafeAreaView style={styles.safe}>{formComponent}</SafeAreaView>;
};

export default ForgotPasswordScreen;
