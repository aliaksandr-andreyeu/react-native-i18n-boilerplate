import React, { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText } from '@/components/atoms';
import Clipboard from '@react-native-clipboard/clipboard';

import { ToastType, useToast } from '@/providers';
import { useTranslation } from 'react-i18next';

interface IBaseCopy {
  copy: string;
  text: string;
  toastText: string;
}

const {
  buttons: { activeOpacity }
} = config;


const BaseCopy: React.FC<IBaseCopy> = ({ copy = '', text = '', toastText }) => {
  const { openToast } = useToast()

  const { t } = useTranslation();


  const theme = useTheme();
  const styles = useStyles(theme);



  const onCopy = useCallback(() => {
    if (!copy) return;
    Clipboard.setString(copy);
    openToast({
      title: toastText,
      type: ToastType.regular,
    })

  }, [copy, t, toastText]);


  if (!copy) return null;

  return (
    <TouchableOpacity testID={testIDs.components.molecules.copy.button(text)} onPress={onCopy} activeOpacity={activeOpacity} style={styles.container}>
      <SvgIcon color={theme.palette.graphite['900']} size={IconSize.sm} name={SvgXmlIconNames.paste} />
      <BaseText>{text}</BaseText>
    </TouchableOpacity>
  );
};

const useStyles = ({ palette: { purple, base } }: UserTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 25,
      backgroundColor: purple['100'],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      alignSelf: 'center'
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderLeftColor: purple[500],
      borderRadius: 16,
      position: 'absolute',
      backgroundColor: base.white,
      borderLeftWidth: 4,
      gap: 8,
      alignSelf: 'center'
    }
  });

export default memo(BaseCopy);
