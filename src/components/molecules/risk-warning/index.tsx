import React, { useCallback, useEffect, FC, useMemo } from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, Text, Linking } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import { Trans, useTranslation } from 'react-i18next';
import { useGetTermsAndConditionsMutation } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { getLegalRemoteDocumentFileURL } from '@/helpers';
import { actions } from '@/store';
import { images } from '@/assets';

const {
  application: { openModal }
} = actions;

export enum BaseRiskWarningVariant {
  common = 'common',
  signup = 'signup'
}

export interface BaseRiskWarningProps {
  warningTextStyle?: TextStyle;
  variant?: BaseRiskWarningVariant;
}

const cookiePolicyKey = 'cookie policy';
const privacyPolicyKey = 'privacy policy';

const BaseRiskWarning: FC<BaseRiskWarningProps> = ({ warningTextStyle, variant = BaseRiskWarningVariant.common }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [getDocument] = useGetTermsAndConditionsMutation();

  const documents = useAppSelector((state) => state.legalDocuments);
  const { termsOfUseURL, legalDocuments = [] } = documents || {};

  const legalDocs = useMemo(() => {
    if (!legalDocuments) {
      return [];
    }
    return legalDocuments?.reduce((acc: any, item: any) => {
      return [...acc, ...item?.data];
    }, []);
  }, [legalDocuments]);

  const cookiePolicyURL = useMemo(() => {
    return (
      legalDocs.find((el) => el.attributes?.title?.toLowerCase() === cookiePolicyKey)?.attributes?.documentFile?.data
        ?.attributes?.url || ''
    );
  }, [legalDocs]);

  const privacyPolicyURL = useMemo(() => {
    return (
      legalDocs.find((el) => el.attributes?.title?.toLowerCase() === privacyPolicyKey)?.attributes?.documentFile?.data
        ?.attributes?.url || ''
    );
  }, [legalDocs]);

  useEffect(() => {
    if (!termsOfUseURL) getDocument();
  }, []);

  const showErrorPopUp = useCallback(() => {
    dispatch(
      openModal({
        title: t('errors.modal-error-title'),
        subTitle: t('errors.modal-error-subtitle'),
        icon: images.depositError,
        iconSize: {
          width: 96,
          height: 90
        },
        button: {
          text: t('errors.modal-got-it')
        }
      })
    );
  }, []);

  const handleDocumentPress = async (url: string) => {
    if (!url) {
      return;
    }
    try {
      const fileURL = getLegalRemoteDocumentFileURL(url);
      const canOpen = await Linking.canOpenURL(fileURL);
      if (canOpen) Linking.openURL(fileURL);
    } catch (error) {
      console.log(error);
      showErrorPopUp();
    }
  };

  const i18nKey = useMemo(() => {
    if (variant === BaseRiskWarningVariant.common) {
      return 'warning.commonCapital';
    }
    return 'warning.signup';
  }, [variant]);

  return (
    <View style={styles.container}>
      <BaseText variant={BaseTextVariant.authSmall} style={warningTextStyle}>
        <Trans
          i18nKey={i18nKey}
          components={{
            underline: (
              <Text key={'underline'} style={styles.link} onPress={() => handleDocumentPress(termsOfUseURL)} />
            ),
            terms: <Text key={'terms'} style={styles.link} onPress={() => handleDocumentPress(termsOfUseURL)} />,
            cookie: <Text key={'cookie'} style={styles.link} onPress={() => handleDocumentPress(cookiePolicyURL)} />,
            privacy: <Text key={'privacy'} style={styles.link} onPress={() => handleDocumentPress(privacyPolicyURL)} />
          }}
        />
      </BaseText>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  link: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {},
    link: {
      fontWeight: '500',
      fontSize: 13,
      color: palette.purple[800],
      textDecorationLine: 'underline'
    }
  });

export default BaseRiskWarning;
