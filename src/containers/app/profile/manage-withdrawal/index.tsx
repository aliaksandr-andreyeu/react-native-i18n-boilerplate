import {
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseRadioButton,
  BaseText,
  BaseTextVariant,
  PaymentDetail,
  SheetBackdrop
} from '@/components';
import { config, UserTheme } from '@/constants';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector, useCommonStyles } from '@/hooks';
import {
  View,
  StyleSheet,
  Image,
  ListRenderItemInfo,
  ActivityIndicator,
  BackHandler,
  LayoutChangeEvent
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { ParsedPaymentMethod, PSP, WithdrawPayments } from '@/store/slices/wallet/types';
import {
  useGetPaymentDetailsQuery,
  useGetPaymentMethodConfigsQuery,
  useGetWithdrawAccountsMutation,
  useGetWithdrawPaymentsQuery
} from '@/store/api';
import { FlatList as GestureFlatList, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated';
import Config from 'react-native-config';
import { useTranslation } from 'react-i18next';

const { DASHBOARD_URL } = Config || {};

type IManageWithdrawal = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.ManageWithdrawal>;

interface Payment {
  provider: string;
  image: string;
  displayOrder: number;
  payments: {
    name: string;
    status: 'approved' | 'pending' | 'declined';
    id: number;
    configId: number;
  }[];
}

const { screenWidth, isIOS, screenHeight } = config;

const ManageWithdrawal: React.FC<IManageWithdrawal> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSelectedPayment, setLastSelectedPayment] = useState<number | undefined>(undefined);
  const [paymentData, setPaymentData] = useState<Payment[]>([]);
  const [withdrawData, setWithdrawData] = useState<Partial<WithdrawPayments & ParsedPaymentMethod>[]>();
  const [isLarger, setIsLarger] = useState<boolean>(false);

  const [getWithdrawPayments] = useGetWithdrawPaymentsQuery();
  const [getWithdrawAccounts] = useGetWithdrawAccountsMutation();
  const [getPaymentMethodConfigs] = useGetPaymentMethodConfigsQuery();
  const [getPaymentDetails] = useGetPaymentDetailsQuery();

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const { top } = useSafeAreaInsets();

  const modalRef = useRef<BottomSheetModal>(null);
  const sheetListRef = useRef<ScrollView>(null);
  const loginSid = useRef<string>('');

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);

  const isVerified = userInfo?.isVerified || false;

  const openSheet = useCallback(() => modalRef.current?.present(), []);
  const closeSheet = useCallback(() => modalRef.current?.dismiss(), []);

  const onDismiss = useCallback(() => setLastSelectedPayment(undefined), []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.isFocused() && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
    });

    return backHandler.remove;
  }, [navigation]);

  const getSheetData = async () => {
    try {
      setLoading(true);
      const paymentMethods = await getPaymentMethodConfigs().unwrap();
      const accounts = await getWithdrawAccounts().unwrap();
      if (accounts.length) {
        const firstCanPermission = accounts.find((item) => item.type.clientPermissions['canWithdraw']);

        if (firstCanPermission) {
          loginSid.current = firstCanPermission.loginSid;

          const withdrawalData = await getWithdrawPayments(firstCanPermission.loginSid).unwrap();
          let paymentAndAccounts: Payment[] = [];
          await new Promise(async (resp) => {
            if (withdrawalData.length) {
              let response = await getPaymentDetails(undefined).unwrap();

              const paymentMethodsMap = new Map(paymentMethods.map((item) => [item.systemId, item]));
              const newWithdrawPaymentsAsArray = [...withdrawalData] as Partial<
                WithdrawPayments & ParsedPaymentMethod
              >[];
              await new Promise((res) => {
                for (let i = 0; i < withdrawalData.length; i++) {
                  const withdrawPayment = withdrawalData[i];
                  const stringID = `${withdrawPayment.id}`;

                  const config = paymentMethodsMap.get(stringID);

                  if (config) {
                    const { displayName, methodGroup, logo } = config;
                    newWithdrawPaymentsAsArray[i] = {
                      ...withdrawPayment,
                      ...(methodGroup && { methodGroup }),
                      ...(displayName && { displayName }),
                      ...(logo && { logo })
                    };
                  } else {
                    newWithdrawPaymentsAsArray[i] = {
                      ...withdrawPayment,
                      logo: withdrawPayment?.logo ? `${DASHBOARD_URL}${withdrawPayment?.logo}` : ''
                    };
                  }
                }
                res('');
              });

              setWithdrawData(newWithdrawPaymentsAsArray);
              if (response.length) {
                const filteredFlatted = new Map();
                for (let i = 0; i < response.length; i++) {
                  const item = response[i];
                  const hasItem = filteredFlatted.has(item.id);
                  if (!hasItem) filteredFlatted.set(item.id, item);
                }
                response = [...filteredFlatted.values()];
                const paymentAndAccountsMap: Map<number, Payment> = new Map();

                for (let i = 0; i < response.length; i++) {
                  const detail = response[i];
                  const itemId = detail.uploadConfig.id;
                  const data = newWithdrawPaymentsAsArray.find((item) => item.paymentDetailsConfigId === itemId);
                  if (!data) continue;
                  const item = paymentAndAccountsMap.get(itemId);
                  if (item) {
                    item.payments = [
                      ...item.payments,
                      {
                        configId: itemId,
                        id: detail.id,
                        name: detail.number,
                        status: detail.status as 'approved' | 'pending' | 'declined'
                      }
                    ];
                    paymentAndAccountsMap.set(itemId, item);
                  } else {
                    const obj = {
                      provider: data?.displayName || detail.uploadConfig.title,
                      image: data?.logo,
                      displayOrder: data?.displayOrder,
                      payments: [{ configId: itemId, name: detail.number, status: detail.status, id: detail.id }]
                    };
                    paymentAndAccountsMap.set(itemId, obj as never as Payment);
                  }
                }
                paymentAndAccounts = [...paymentAndAccountsMap.values()].sort(
                  (a, b) => a.displayOrder - b.displayOrder
                );
              }
              resp('');
            }
          });
          setPaymentData(paymentAndAccounts);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSheetData();
    }, [])
  );

  const Loader = useCallback(() => {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <ActivityIndicator color={theme.palette.graphite['900']} size={'small'} style={styles.indicator} />
      </Animated.View>
    );
  }, [theme.dark]);

  const EmptyDetails = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Image source={images.search} style={styles.img} />
        <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.textAlign}>
          {t('screens.profile.no-payment')}
        </BaseText>
      </View>
    );
  }, [theme.dark, loading, t]);

  const _renderItem = useCallback(
    ({ item }: { item: Partial<PSP & ParsedPaymentMethod>; index: number }) => {
      const onSelectP = () => {
        if (item.id === lastSelectedPayment) setLastSelectedPayment(undefined);
        else setLastSelectedPayment(item.id);
      };

      const hasLogo = Boolean(item.logo);

      return (
        <BaseRadioButton
          icon={
            hasLogo ? (
              <BaseImage resizeMode='cover' source={{ uri: item.logo }} style={styles.paymentImg} />
            ) : (
              <SvgIcon name={SvgXmlIconNames.bankCard} />
            )
          }
          type={BaseRadioButtonType.secondary}
          contentStyle={styles.radioStyle}
          isSelected={item.id === lastSelectedPayment}
          checkBoxWrapperStyle={IconSize.sm}
          label={item.displayName}
          subTitle={item.description}
          onPress={onSelectP}
        />
      );
    },
    [lastSelectedPayment, theme.dark]
  );

  const _keyExtractor = useCallback((item: Partial<PSP>) => `${item?.id}-payment`, []);

  const onSelectPayment = useCallback(() => {
    closeSheet();
    setTimeout(() => {
      navigation.navigate(COMMON_ROUTE_NAMES.CreatePaymentDetail, {
        id: lastSelectedPayment,
        loginSid: loginSid.current
      });
    }, 300);
  }, [lastSelectedPayment]);

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

  const _renderPayments = useCallback(({ item }: ListRenderItemInfo<Payment>) => {
    const onAccountPress = (id: number, configId: number) => {
      // const obj = paymentData.find(item=>item.payments.find(p=>p.id===id));

      navigation.navigate(COMMON_ROUTE_NAMES.PaymentDetail, { id, configId });
    };

    return (
      <PaymentDetail onPress={onAccountPress} provider={item.provider} payments={item.payments} image={item.image} />
    );
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const lay = e.nativeEvent.layout.height + 74;
    if (lay > screenHeight / 1.5) setIsLarger(true);
    else setIsLarger(false);
  }, []);

  const snapPoints = useMemo(() => {
    return isLarger ? [screenHeight - top] : [screenHeight / 1.5];
  }, [isLarger, screenHeight, top]);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.flex}>
        <View style={styles.head}>
          <BaseBackButton isChevron={false} />
          <BaseText variant={BaseTextVariant.caption}>{t('screens.profile.payment-details')}</BaseText>
          <View style={styles.replacer} />
        </View>
        <View style={styles.container}>
          <View style={styles.flex}>
            <BaseText variant={BaseTextVariant.small} style={[styles.grayText, styles.margin, styles.marginVertical]}>
              {t('screens.profile.preferred-payments')}
            </BaseText>
            {loading ? (
              <Loader />
            ) : (
              <Animated.FlatList
                entering={FadeIn}
                key={`${paymentData.length}-payment-list`}
                data={paymentData}
                ListEmptyComponent={EmptyDetails}
                contentContainerStyle={styles.paymentListContent}
                renderItem={_renderPayments}
              />
            )}
          </View>
          {isVerified && (
            <View style={styles.btnContianer}>
              <BaseButton
                style={styles.margin}
                type={BaseButtonType.primary}
                size={BaseButtonSize.large}
                label={t('screens.profile.add-payment-details')}
                disabled={loading}
                onPress={openSheet}
              />
            </View>
          )}
        </View>
      </View>
      <BottomSheetModal
        ref={modalRef}
        style={styles.sheetModal}
        snapPoints={snapPoints}
        backdropComponent={SheetBackdrop}
        onDismiss={onDismiss}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicator}
        waitFor={sheetListRef}
      >
        <BottomSheetView style={styles.sheetView}>
          <View style={styles.sheetTop}>
            <BaseText style={styles.margin} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.select-provider')}
            </BaseText>
            <ScrollView ref={sheetListRef} contentContainerStyle={styles.sheetScrollContent}>
              <GestureFlatList
                onLayout={handleLayout}
                showsVerticalScrollIndicator={false}
                data={withdrawData}
                scrollEnabled={false}
                style={styles.sheetList}
                renderItem={_renderItem}
                keyExtractor={_keyExtractor}
              />
            </ScrollView>
          </View>
          <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.selectContainer}>
            <View style={styles.btnContianer}>
              <BaseButton
                style={styles.margin}
                type={BaseButtonType.primary}
                disabled={!lastSelectedPayment}
                size={BaseButtonSize.large}
                label={t('screens.profile.select')}
                onPress={onSelectPayment}
              />
            </View>
          </Animated.View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    flex: {
      flex: 1
    },
    container: {
      justifyContent: 'space-between',
      flex: 1
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    grayText: {
      color: '#5D7278'
    },
    margin: {
      marginHorizontal: 20
    },
    replacer: {
      width: 20,
      height: 20,
      marginRight: 20
    },
    marginVertical: {
      marginVertical: 12
    },
    emptyContainer: {
      gap: 16,
      marginHorizontal: 20,
      alignItems: 'center',
      marginTop: 64
    },
    img: {
      width: 90,
      height: 90
    },
    paymentImg: {
      width: 24,
      height: 24,
      borderRadius: 13
    },
    textAlign: {
      textAlign: 'center'
    },
    btnContianer: {
      paddingBottom: 34,
      paddingTop: 12,
      backgroundColor: 'rgba(247, 248, 250, 0.75)'
    },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetList: {
      width: screenWidth - 40,
      alignSelf: 'center',
      backgroundColor: base.white,
      borderRadius: 12,
      marginTop: 4,
      ...shadow6Style
    },
    selectContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0
    },
    radioStyle: { marginBottom: 0 },
    sheetModal: {
      flex: 1
    },
    sheetView: {
      flex: 1,
      backgroundColor: graphite['050']
    },
    sheetTop: {
      paddingTop: 20,
      gap: 12,
      flex: 1
    },
    sheetScrollContent: {
      paddingBottom: 112
    },
    seperatorContainer: {
      width: screenWidth,
      height: 40,
      backgroundColor: '#E1DFE5',
      gap: 8,
      marginTop: 4
    },
    seperatorUp: {
      width: '100%',
      height: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    paymentListContent: {
      paddingBottom: 132,
      paddingTop: 6,
      gap: 16
    },
    indicator: {
      marginTop: 40,
      alignSelf: 'center'
    }
  });
};

export default ManageWithdrawal;
