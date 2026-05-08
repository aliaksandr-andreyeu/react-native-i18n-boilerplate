import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { View, StyleSheet, BackHandler, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseText,
  BaseTextVariant,
  SheetBackdrop
} from '@/components';
import { useDeletePaymentAccountMutation, useGetPaymentDetailsQuery } from '@/store/api';
import { images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useAppDispatch, useAppSelector, useIntercom, useCommonStyles } from '@/hooks';
import { PaymentDetails } from '@/store/slices/wallet/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { actions } from '@/store';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { useTranslation } from 'react-i18next';
import useDynamicTranslations from '@/hooks/dynamicTranslations';

type IPaymentDetail = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.PaymentDetail>;

type Statuses = 'approved' | 'declined' | 'pending';

interface StatusComponent {
  status: Statuses;
  reason: string | null | undefined;
}

type Types = 'text' | 'file';

interface DetailValue {
  type: Types;
  label?: string;
  value: string;
}

interface Detail {
  [key: string]: DetailValue;
}

const {
  application: { openModal }
} = actions;

const capitalizeWord = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const sleep = async (time: number) => await new Promise((res) => setTimeout(res, time));
const PaymentDetailScreen: React.FC<IPaymentDetail> = ({ route, navigation }) => {
  const { intercomPresent } = useIntercom();

  const accountId = route.params.id;
  const configId = route.params.configId;

  const sheetRef = useRef<BottomSheetModalMethods>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const [getPaymentDetails, { data: paymentData, isFetching }] = useGetPaymentDetailsQuery();
  const [deleteAccount, { isLoading: isDeleting }] = useDeletePaymentAccountMutation();

  const appDispatch = useAppDispatch();

  const translate = useDynamicTranslations('screens.create-payment-detail');

  const withdrawData = useAppSelector((store) => store.wallet.withdrawPayments);

  const openSheet = useCallback(() => sheetRef.current?.present(), []);
  const closeSheet = useCallback(() => sheetRef.current?.dismiss(), []);

  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);
  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);

  const data = useMemo(() => {
    if (paymentData) {
      const wData = withdrawData.find((item) => item.paymentDetailsConfigId == configId);
      const pData = paymentData.find((item) => item.id === accountId);

      return {
        ...pData,
        logo: wData?.logo,
        displayName: wData?.displayName || pData?.uploadConfig?.title
      } as PaymentDetails & { logo: string | undefined; displayName: string | undefined };
    }

    return {} as PaymentDetails & { logo: string | undefined; displayName: string | undefined };
  }, [paymentData, accountId, withdrawData, configId]);

  const showPopUp = useCallback(
    ({ title = '', subTitle, button, secondaryButton, closeTime, icon, iconSize }: Partial<DefaultModalConfig>) => {
      appDispatch(
        openModal({
          title,
          subTitle,
          icon,
          iconSize,
          button,
          secondaryButton,
          closeTime
        })
      );
    },
    []
  );

  useEffect(() => {
    getPaymentDetails(undefined);
  }, []);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) {
        closeSheet();
        return true;
      } else if (navigation.isFocused() && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
    });

    return backHandler.remove;
  }, [navigation]);

  const Status = useCallback(
    ({ status, reason = '' }: StatusComponent) => {
      const getStyle = () => {
        switch (status) {
          case 'approved':
            return { variant: BaseTextVariant.titleXXS, style: { color: theme.palette.graphite['900'] } };

          case 'declined':
            return { variant: BaseTextVariant.small, style: { color: theme.palette.red['600'] } };

          case 'pending':
            return { variant: BaseTextVariant.small, style: { color: theme.palette.graphite[500] } };

          default:
            return { variant: BaseTextVariant.small, style: { color: theme.palette.graphite['900'] } };
        }
      };

      const statusText = getStyle();

      return (
        <View style={styles.statusContainer}>
          <View style={[styles.statusTop, styles.paddingVertical]}>
            <BaseText style={[styles.textAlignLeft, styles.grayText700]}>{t('screens.profile.status')}</BaseText>
            <BaseText variant={statusText.variant} style={[styles.textAlignRight, statusText.style]}>
              {capitalizeWord(status)}
            </BaseText>
          </View>
          {status === 'declined' && !!reason && (
            <BaseText style={[styles.textAlignLeft, styles.grayText1000, styles.paddingVertical]}>{reason}</BaseText>
          )}
        </View>
      );
    },
    [theme.dark]
  );

  const DetailContainer = useCallback(
    ({ title, info }: { title: string; info: string }) => {
      return (
        <View style={styles.detailContainer}>
          <BaseText variant={BaseTextVariant.tiny} style={[styles.textAlignLeft, styles.grayText700]}>
            {title?.toLocaleLowerCase?.() || ''}
          </BaseText>
          <BaseText selectable selectionColor={theme.palette.purple['100']} style={styles.textAlignLeft}>
            {info}
          </BaseText>
        </View>
      );
    },
    [theme.dark]
  );

  const hasLogo = useMemo(() => {
    return data?.logo?.length;
  }, [data]);

  const details = useMemo(() => {
    if (!data?.data) return [];
    const keys = Object.keys(data.uploadConfig.config);

    const detail = data.data as Detail;
    const values: DetailValue[] = Object.values(detail);
    if (!values.length) return [];

    const detailsData = [];

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value.type === 'file' || value.value === null) continue;
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (data.uploadConfig.config[key]?.label !== value?.label) continue;
        const obj = {
          label: translate(key, value?.label, configId),
          value: value.value
        };
        detailsData.push(obj);
      }
    }

    return detailsData;
  }, [data, t, configId]);

  const Loader = useCallback(() => {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.indicator}>
        <ActivityIndicator color={theme.palette.graphite['900']} size={'small'} />
      </Animated.View>
    );
  }, [theme.dark]);

  const Logo = useCallback(() => {
    if (hasLogo) return <BaseImage resizeMode='cover' source={{ uri: data?.logo }} style={styles.img} />;
    return <SvgIcon name={SvgXmlIconNames.bankCard} />;
  }, [hasLogo, theme.dark, data]);

  const contactSupport = () => {
    intercomPresent();
  };

  const confirmDelete = useCallback(async () => {
    try {
      closeSheet();
      await sleep(200);
      await deleteAccount(accountId).unwrap();
      setTimeout(() => {
        showPopUp({
          title: t('screens.profile.has-deleted', { account: data.number }),
          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      }, 300);
      if (navigation.isFocused() && navigation.canGoBack()) navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  }, [accountId, data, t]);

  return (
    <SafeAreaView style={styles.flex}>
      <BaseBackButton isClose />
      {isFetching ? (
        <Loader />
      ) : (
        <>
          <Animated.ScrollView entering={FadeIn} exiting={FadeOut} contentContainerStyle={styles.content}>
            <View style={[styles.header, styles.paddingVertical]}>
              <BaseText>{data?.displayName || data?.uploadConfig?.title}</BaseText>
              <Logo />
            </View>
            <Status reason={data.declineReason} status={data.status as Statuses} />
            <View style={[styles.infoContainer, styles.paddingVertical]}>
              {details.map((item) => {
                return (
                  <DetailContainer
                    key={`${item.label}-${item.value}`}
                    info={item.value || ''}
                    title={(item?.label || '') as string}
                  />
                );
              })}
            </View>
          </Animated.ScrollView>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.btnContianer}>
            {data.status === 'declined' && (
              <BaseButton
                style={styles.margin}
                type={BaseButtonType.accent}
                size={BaseButtonSize.large}
                label={t('screens.profile.contact-support')}
                disabled={isFetching || isDeleting}
                onPress={contactSupport}
              />
            )}
            <BaseButton
              style={styles.margin}
              type={BaseButtonType.link}
              size={BaseButtonSize.large}
              loading={isDeleting}
              label={t('screens.profile.delete-payment-account')}
              disabled={isFetching || isDeleting}
              onPress={openSheet}
            />
          </Animated.View>
        </>
      )}
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={SheetBackdrop}
        handleStyle={styles.sheet}
        onDismiss={onDismiss}
        onAnimate={onAnimate}
        handleIndicatorStyle={styles.bgGray500}
        style={styles.sheet}
      >
        <BottomSheetView style={styles.sheetView}>
          <View style={styles.sheetTop}>
            <Image source={images.cancel} style={styles.sheetImage} />
            <BaseText style={styles.textAlignCenter} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.want-delete-payment')}
            </BaseText>
          </View>
          <View style={[styles.sheetBtns, styles.margin]}>
            <BaseButton
              type={BaseButtonType.accent}
              size={BaseButtonSize.large}
              label={t('screens.profile.delete')}
              disabled={isFetching || isDeleting}
              onPress={confirmDelete}
            />
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.profile.go-back')}
              disabled={isFetching || isDeleting}
              onPress={closeSheet}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    flex: {
      flex: 1
    },
    margin: {
      marginHorizontal: 20
    },
    textAlignLeft: {
      textAlign: 'left'
    },
    textAlignRight: {
      textAlign: 'right'
    },
    textAlignCenter: {
      textAlign: 'center'
    },
    grayText1000: {
      color: '#5D7278'
    },
    grayText700: {
      color: '#8fa6ae'
    },
    bgGray500: { backgroundColor: icon?.base?.tertiary },
    sheetBtns: { gap: 12, marginTop: 12, marginBottom: 34 },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: graphite['050']
    },
    sheetTop: {
      gap: 16
    },
    sheetImage: { width: '100%', height: 243 },
    sheetView: { gap: 48, paddingTop: 64, backgroundColor: graphite['050'] },
    img: {
      width: 32,
      height: 32,
      borderRadius: 17
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 64,
      gap: 12
    },
    indicator: { marginTop: 40 },
    infoContainer: {
      paddingHorizontal: 16,
      backgroundColor: base.white,
      borderRadius: 12,
      gap: 8,
      ...shadow6Style
    },
    paddingVertical: {
      paddingVertical: 12
    },
    statusTop: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statusContainer: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      borderRadius: 12,
      backgroundColor: base.white,
      ...shadow6Style
    },
    detailContainer: {
      paddingVertical: 6,
      gap: 1
    },
    btnContianer: {
      paddingBottom: 34,
      paddingTop: 12,
      backgroundColor: 'rgba(247, 248, 250, 0.75)',
      gap: 12
    }
  });
};

export default PaymentDetailScreen;
