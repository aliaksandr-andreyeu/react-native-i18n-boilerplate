import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import {
  BaseButton,
  BaseButtonType,
  BaseImage,
  BaseInput,
  BaseOptionList,
  BaseRadioButton,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { UserTheme, config } from '@/constants';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import {
  ParsedPaymentMethod,
  PaymentDetails,
  WithdrawPayments,
  WithdrawUploadBody,
  WithdrawUploadData
} from '@/store/slices/wallet/types';
import { useAppSelector, useCommonStyles } from '@/hooks';
import {
  useGetPaymentDetailsConfigQuery,
  useGetPaymentDetailsQuery,
  usePayoutMutation,
  useUploadMutation
} from '@/store/api';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import Animated, { CurvedTransition, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import getAccessStatus from '@/helpers/picker/media';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import { ToastType, useToast } from '@/providers';
import useDynamicTranslations from '@/hooks/dynamicTranslations';

type WithdrawalAccountScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.WithdrawalAccount
>;

const {
  buttons: { activeOpacity },
  screenWidth,
  isIOS,
  screenHeight
} = config;

const newPaymentObj = {
  id: -1,
  number: 'Use new payment details',
  uploadConfig: {
    description: ''
  }
};

let launchLibraryTimeout: NodeJS.Timeout;

type ConfigField = {
  label: string;
  key: string;
  dataType: string;
  fieldType: string;
  description: string;
  required: boolean;
  choices?: string[] | null;
  choiceLabels?: string[] | null;
  example?: string | string[] | null;
  validators?: { requiredIf?: { [key: string]: string[] } };
  multiple: boolean;
  help?: string | null;
};

type Config = {
  [key: string]: ConfigField;
};

type Values = {
  [key: string]: string;
};

type Action = {
  type: 'SET_VALUE' | 'RESET';
  key: string;
  value: string;
};

const initialState: Values = {};

const valuesReducer = (state: Values, action: Action): Values => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        [action.key]: action.value
      };
    case 'RESET':
      return {};
    default:
      return state;
  }
};

const WithdrawalAccount: React.FC<WithdrawalAccountScreenProps> = ({ route, navigation }) => {
  const [values, dispatch] = useReducer(valuesReducer, initialState);

  const [availablePayments, setAvailablePayments] = useState<PaymentDetails[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Asset[] | null>(null);
  const [currentConfig, setCurrentConfig] = useState<{ config: Config }>({ config: {} });
  const [newPaymentLoading, setNewPaymentLoading] = useState<boolean>(false);
  const [currentChoiceConfig, setCurrentChoiceConfig] = useState<ConfigField>();
  const [stepLoading, setStepLoading] = useState<boolean>(false);

  const scrollRef = useRef<AnimatedScrollView>(null);
  const bottomSheetRef = useRef<IBaseOptionList>();
  const configIsLoaded = useRef<boolean>(false);
  const libraryLaunched = useRef<boolean>(false);
  const aborted = useRef<boolean>(false);
  const lastCreatedNumber = useRef<number>();

  const { openToast, closeToast } = useToast();

  const translate = useDynamicTranslations('screens.create-payment-detail');

  const [getPDetails] = useGetPaymentDetailsQuery();
  const [getPaymentDetailsConfig] = useGetPaymentDetailsConfigQuery();
  const [upload] = useUploadMutation();
  const [payout] = usePayoutMutation();

  const paymentId = route.params.paymentId;
  const loginSid = route.params.loginSid;
  const provider = route.params.provider;
  const balance = route.params.balance;

  const payments = useAppSelector((store) => store.wallet.withdrawPayments);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const selectedPayment = useMemo((): WithdrawPayments & ParsedPaymentMethod => {
    const selectedP = payments.find((item) => item.id === paymentId);

    return selectedP as WithdrawPayments & ParsedPaymentMethod;
  }, [payments, paymentId]);

  const getDetailsConfig = async () => {
    try {
      if (configIsLoaded.current) return;
      setNewPaymentLoading(true);
      configIsLoaded.current = true;
      const paymentConfigs = await getPaymentDetailsConfig(undefined).unwrap();
      const currentPaymentConfig = paymentConfigs.find(
        (item: PaymentDetails) => item.id === selectedPayment.paymentDetailsConfigId
      );

      if (currentPaymentConfig) {
        setCurrentConfig(currentPaymentConfig);
      }
    } catch (error) {
      configIsLoaded.current = false;
      console.log(error);
    } finally {
      setNewPaymentLoading(false);
    }
  };

  const getPaymentDetails = async () => {
    try {
      setLoading(true);
      const userPaymentDetails = await getPDetails(paymentId).unwrap();

      const availablePS = userPaymentDetails.filter(
        (item) => item.uploadConfig.id === selectedPayment.paymentDetailsConfigId && item.status !== 'declined'
      );

      if (availablePS.length) {
        availablePS.push(newPaymentObj as PaymentDetails);
        setAvailablePayments(availablePS);
      } else {
        getDetailsConfig();
        setSelectedAccount(-1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedImages(null);
      if (lastCreatedNumber.current) setSelectedAccount(lastCreatedNumber.current);
      dispatch({ key: 'reset', type: 'RESET', value: '' });
      if (selectedPayment.paymentDetailsRequired) getPaymentDetails();
    }, [selectedPayment, paymentId])
  );

  const isFocused = useIsFocused();

  useEffect(() => {
    aborted.current = !isFocused;
  }, [isFocused]);

  const onLibraryLaunch = () => {
    const launch = async () => {
      try {
        if (libraryLaunched.current) return;
        libraryLaunched.current = true;
        const isGranted = await getAccessStatus();
        if (!isGranted) return (libraryLaunched.current = false);
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 1,
          selectionLimit: 5 - (selectedImages?.length || 0),
          includeBase64: true
        });

        libraryLaunched.current = false;

        if (result?.assets) {
          function mergeUniqueObjects(a: Asset[], b: Asset[] = []) {
            const map = new Map();
            a.forEach((item) => map.set(`${item.fileName}`, item));
            b.forEach((item) => map.set(`${item.fileName}`, item));

            return Array.from(map.values());
          }
          setSelectedImages((prev) => {
            if (!prev?.length) {
              return result.assets || null;
            } else {
              return mergeUniqueObjects(prev, result.assets);
            }
          });
        }
      } catch (error) {
        libraryLaunched.current = false;
        console.log(error);
      }
    };

    if (Keyboard.isVisible()) {
      launchLibraryTimeout && clearTimeout(launchLibraryTimeout);
      launchLibraryTimeout = setTimeout(launch, 350);
    } else {
      launch();
    }
  };

  const ActionText = useCallback(
    ({ choose }: { choose: boolean }) => {
      const text = choose ? t('screens.withdrawal.choose-withdrawal') : t('screens.withdrawal.add-account');

      return (
        <BaseText style={styles.actionText} variant={BaseTextVariant.captionSemiBold}>
          {text}
        </BaseText>
      );
    },
    [t]
  );

  const SelectedImage = useCallback(({ sImage }: { sImage: Asset | null }) => {
    if (!sImage) {
      setSelectedImages(null);
      return null;
    }

    const onDiscardImage = () => {
      setSelectedImages((prev) => {
        if (prev?.length) {
          const current = prev?.findIndex((item) => item.uri === sImage.uri);
          if (current !== -1) {
            const newData = [...prev];
            newData.splice(current, 1);
            return newData;
          }
        }
        return prev;
      });
    };

    return (
      <View style={styles.selectedImageContainer}>
        <View style={styles.selectedImageLeft}>
          <BaseImage source={{ uri: sImage.uri }} resizeMode='cover' style={styles.img} />
          <BaseText>{sImage.fileName || `image.${sImage.type}`}</BaseText>
        </View>
        <TouchableOpacity activeOpacity={activeOpacity} hitSlop={5} onPress={onDiscardImage}>
          <SvgIcon name={SvgXmlIconNames.close} size={{ width: 10, height: 10 }} />
        </TouchableOpacity>
      </View>
    );
  }, []);

  const DashedButton = useCallback(
    ({ sImages, required }: { sImages: Asset[] | null; required: boolean }) => {
      if (sImages && sImages.length)
        return (
          <View style={styles.imagesContainer}>
            {sImages.map((image) => {
              return <SelectedImage key={`${image.fileName}-${image.uri}`} sImage={image} />;
            })}
            {!!(sImages.length - 5) && (
              <TouchableOpacity onPress={onLibraryLaunch} activeOpacity={activeOpacity} style={styles.button}>
                <SvgIcon name={SvgXmlIconNames.attach} size={IconSize.lg} />
                <BaseText variant={BaseTextVariant.text} style={styles.text}>
                  <BaseText variant={BaseTextVariant.text} style={styles.link}>
                    {t('screens.withdrawal.attach')}
                  </BaseText>{' '}
                  {t('screens.withdrawal.provider-document')}
                </BaseText>
              </TouchableOpacity>
            )}
          </View>
        );

      return (
        <TouchableOpacity onPress={onLibraryLaunch} activeOpacity={activeOpacity} style={styles.button}>
          <SvgIcon name={SvgXmlIconNames.attach} size={IconSize.lg} />
          <BaseText variant={BaseTextVariant.text} style={styles.text}>
            <BaseText variant={BaseTextVariant.text} style={styles.link}>
              {t('screens.withdrawal.attach')}
            </BaseText>{' '}
            {t('screens.withdrawal.provider-document')}{' '}
            {required && (
              <BaseText variant={BaseTextVariant.text} style={styles.required}>
                *
              </BaseText>
            )}
          </BaseText>
        </TouchableOpacity>
      );
    },
    [theme.dark, t, selectedImages?.length]
  );

  const hasPayment = useMemo(() => availablePayments.length > 1, [availablePayments.length]);

  const _keyExtractor = useCallback((item: PaymentDetails, index: number) => `${item.id}-${item.number}-${index}`, []);

  const _renderItem = useCallback(
    ({ item }: { item: PaymentDetails }) => {
      const onSelectPayment = () => {
        if (item.id === selectedAccount) setSelectedAccount(undefined);
        else setSelectedAccount(item.id);
        if (item.id === -1) getDetailsConfig();
      };

      // const hasLogo = Boolean(item.logo);

      return (
        <BaseRadioButton
          //   icon={
          //     hasLogo ? (
          //       <BaseImage resizeMode='cover' source={{ uri: item.logo }} style={styles.img} />
          //     ) : (
          //       <SvgIcon name={SvgXmlIconNames.bankCard} />
          //     )
          //   }
          icon={undefined}
          type={BaseRadioButtonType.secondary}
          contentStyle={styles.radioStyle}
          isSelected={item.id === selectedAccount}
          checkBoxWrapperStyle={IconSize.sm}
          label={item.number}
          subTitle={item.uploadConfig.description}
          onPress={onSelectPayment}
        />
      );
    },
    [selectedAccount]
  );

  const Separator = useCallback(() => <View style={styles.separator} />, []);

  const lessThan5MB = useMemo(() => {
    if (!selectedImages?.length || selectedAccount !== -1) return null;
    if (selectedImages.every((item) => item.fileSize !== undefined)) {
      for (let i = 0; i < selectedImages.length; i++) {
        const imageSize = selectedImages[i].fileSize || 0;
        const asMB = imageSize / 1048576;
        if (asMB > 5) return t('errors.file-size-is-too-big');
      }
      return null;
    }

    return t('errors.file-size-is-too-big');
  }, [selectedImages, selectedAccount, t]);

  const errorToastHandler = () => {
    if (!lessThan5MB) {
      closeToast();
      return;
    }

    openToast({
      desc: lessThan5MB,
      type: ToastType.error
    });
  };

  useLayoutEffect(() => {
    errorToastHandler();
  }, [lessThan5MB]);

  const continueIsDisabled = () => {
    if (selectedAccount !== -1 && selectedAccount !== undefined) return false;
    if (selectedAccount === undefined || lessThan5MB !== null || newPaymentLoading) return true;
    const configValues = Object.values(currentConfig.config);

    for (let i = 0; i < configValues.length; i++) {
      const { fieldType, key, required, validators, label } = configValues[i];

      let next = false;

      if (validators && validators.requiredIf) {
        for (let refKey in validators.requiredIf) {
          const refValues = validators.requiredIf[refKey];
          const currentValue = values[refKey];

          if (
            refValues.includes(currentValue) &&
            required &&
            (values[key] === undefined || values[key]?.length === 0)
          ) {
            return true;
          } else {
            next = true;
          }
        }
      }

      if (next) continue;

      switch (fieldType) {
        case 'file':
          if (!selectedImages?.length && required) {
            return true;
          }
          break;

        case 'text':
          if (required && (values[key] === undefined || values[key].length === 0)) {
            return true;
          }

          break;

        case 'choice':
          if (required && (values[key] === undefined || values[key].length === 0)) {
            return true;
          }
          break;
      }
    }
    return false;
  };

  const onContentSizeChange = useCallback(() => {
    if (selectedAccount === -1 && selectedImages?.length && lessThan5MB !== null) scrollRef.current?.scrollToEnd();
  }, [selectedAccount, selectedImages]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleConfigField = (
    field: ConfigField,
    values: Values,
    dispatch: React.Dispatch<Action>,
    configId: number
  ) => {
    const { fieldType, label: fieldLabel, required, choices, choiceLabels, key, validators } = field;

    const label = translate(key, fieldLabel, configId);

    if (validators && validators.requiredIf) {
      for (let refKey in validators.requiredIf) {
        const refValues = validators.requiredIf[refKey];
        if (!refValues.includes(values[refKey])) {
          return null;
        }
      }
    }

    switch (fieldType) {
      case 'text':
        const currentValue = values[key];
        return (
          <View key={key} style={styles.inputContainer}>
            <BaseInput
              title={label as string}
              required={required}
              value={currentValue}
              error={currentValue?.length === 0}
              onChange={(val) => dispatch({ value: val, key, type: 'SET_VALUE' })}
              inputContainerStyle={styles.input}
            />
            {required && currentValue?.length === 0 && (
              <BaseText variant={BaseTextVariant.small} style={styles.errorText}>
                {t('errors.required')}
              </BaseText>
            )}
          </View>
        );
      case 'choice':
        const valueIndex = choices?.findIndex((item) => item === values[key]) || 0;

        return (
          <Pressable
            key={key}
            style={styles.choiceContainer}
            onPress={() => {
              setCurrentChoiceConfig(field);
              bottomSheetRef.current?.open();
            }}
          >
            <BaseInput
              required={required}
              hideClearButton
              title={label as string}
              error={required && (!values[key] === undefined || values[key]?.length === 0)}
              editable={false}
              value={choiceLabels?.[valueIndex]}
              dropdown
            />
          </Pressable>
        );
      case 'file':
        return (
          <View key={key} style={{ gap: 24 }}>
            <DashedButton required={required} sImages={selectedImages} />
            <BaseText style={[styles.text, styles.infoText]} variant={BaseTextVariant.small}>
              {t('screens.withdrawal.scanned-copy-text')}
            </BaseText>
          </View>
        );
      default:
        return null;
    }
  };

  const renderConfigFields = (config: Config, values: Values, dispatch: React.Dispatch<Action>, configId: number) => {
    return Object.keys(config)
      .map((key) => {
        const field = config[key];
        return handleConfigField(field, values, dispatch, configId);
      })
      .filter((field) => field !== null);
  };

  const newPaymentComponents = useMemo(() => {
    return renderConfigFields(currentConfig?.config, values, dispatch, selectedPayment.paymentDetailsConfigId);
  }, [currentConfig.config, JSON.stringify(values), selectedImages, t, selectedPayment.paymentDetailsConfigId]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const onSelect = useCallback(
    (val: string) => {
      const indexOfLabel = currentChoiceConfig?.choiceLabels?.findIndex((item: string) => item === val) || 0;
      dispatch({
        key: currentChoiceConfig?.key || '',
        value: currentChoiceConfig?.choices?.[indexOfLabel] || '',
        type: 'SET_VALUE'
      });
    },
    [currentChoiceConfig]
  );

  const withdrawPayout = async (id?: number | undefined) => {
    const body = {
      paymentSystem: paymentId,
      account: loginSid,
      currency: selectedPayment?.currencies?.[0] || 'USD',
      wallet: id
    };
    const res = await payout(body).unwrap();
    return {
      res,
      body
    };
  };

  const withdrawUpload = async () => {
    const configEntries = Object.entries(currentConfig.config);

    const uploadData: WithdrawUploadData[] = configEntries.map((item) => {
      const name = item[0];
      const config: ConfigField = item[1];
      const { key } = config;
      const value = values[key];
      // if (config?.fieldType === "datetime") {
      //     return {
      //         key: item[0],
      //         value: values[config?.label].replace(/T/g, " "),
      //     };
      // }

      if (config?.fieldType === 'choice' && config?.dataType === 'array') {
        return {
          key: name,
          value: [value]
        };
      } else if (config?.fieldType === 'file') {
        return {
          key: name,
          value:
            selectedImages?.map((item) => ({
              name: item.fileName || 'image',
              file: item.base64?.replace?.(/^data:image\/[a-z]+;base64,/, '') || ''
            })) || []
        };
      }
      return {
        key: name,
        value: value || ''
      };
    });

    const body: WithdrawUploadBody = {
      data: uploadData,
      configId: selectedPayment.paymentDetailsConfigId
    };

    const uploadRes = await upload(body).unwrap();
    return uploadRes?.id;
  };

  const nextStep = async (): Promise<undefined> => {
    let id = selectedAccount;
    try {
      setStepLoading(true);
      if (aborted.current) return;
      if (selectedAccount === -1) id = await withdrawUpload();

      if (aborted.current) return;
      let { res, body } = await withdrawPayout(id);

      if (aborted.current) return;

      lastCreatedNumber.current = id;

      navigation.navigate(ROOT_ROUTE_NAMES.DepositAmountEntry, {
        isWithdrawal: true,
        paymentId,
        withdrawalRes: res,
        body,
        provider
      });
    } catch (error) {
      console.log(error);
    } finally {
      setStepLoading(false);
    }
  };

  if (loading)
    return (
      <ContentLoader
        speed={2}
        width={screenWidth}
        height={screenHeight}
        viewBox={`0 0 ${screenWidth} ${screenHeight}`}
        backgroundColor={'#E2E6F2'}
        foregroundColor={theme.palette.graphite['050']}
      >
        <Rect x={20} y={80} rx={4} ry={4} width={300} height={20} />
        <Rect x={20} y={163} rx={4} ry={4} width={250} height={19} />
        <Rect x={20} y={195} rx={12} ry={12} width={screenWidth - 40} height={screenHeight / 3} />
        <Rect x={20} y={screenHeight - 110} rx={8} ry={8} width={screenWidth - 40} height={42} />
      </ContentLoader>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1 }} layout={CurvedTransition}>
        <ProgressHeader
          title={provider.title}
          image={provider.image}
          hideProgressBar
          leftIconType={SvgXmlIconNames.arrowLeft}
          stepsCount={0}
          currentStep={0}
        />
        <View style={styles.textContainer}>
          <BaseText variant={BaseTextVariant.title}>{t('screens.withdrawal.request-withdrawal')}</BaseText>
          <BaseText style={styles.balance} variant={BaseTextVariant.small}>
            {t('screens.withdrawal.wallet-balance', { balance })}
          </BaseText>
          <ActionText choose={hasPayment} />
        </View>
        <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.avoidView}>
          <Animated.ScrollView
            onContentSizeChange={onContentSizeChange}
            ref={scrollRef}
            layout={CurvedTransition}
            contentContainerStyle={{ paddingBottom: 134 }}
          >
            <Animated.FlatList
              layout={CurvedTransition}
              data={availablePayments}
              style={styles.list}
              scrollEnabled={false}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
              renderItem={_renderItem}
              keyExtractor={_keyExtractor}
            />
            {newPaymentLoading ? (
              <ActivityIndicator style={styles.loader} size={'small'} color={theme.palette.graphite['900']} />
            ) : (
              selectedAccount === -1 && <View style={{ gap: 24, marginTop: 24 }}>{newPaymentComponents}</View>
            )}
          </Animated.ScrollView>
        </KeyboardAvoidingView>
        {stepLoading ? (
          <View style={styles.continue}>
            <ActivityIndicator size={'small'} color={theme.palette.graphite['900']} />
          </View>
        ) : (
          selectedAccount !== undefined &&
          isFocused && (
            <Animated.View style={styles.cbutton} entering={FadeInDown} exiting={FadeOutDown}>
              <BaseButton
                disabled={continueIsDisabled()}
                type={BaseButtonType.primary}
                label={t('screens.deposit.continue')}
                onPress={nextStep}
                fullWidth
              />
              <BaseText style={styles.secure} variant={BaseTextVariant.small}>
                {t('screens.common.fully-secured')}
              </BaseText>
            </Animated.View>
          )
        )}
        <BaseOptionList
          title={currentChoiceConfig?.label || ''}
          hasSearch={false}
          hasIcons={false}
          data={currentChoiceConfig?.choiceLabels || []}
          defaultSelected={values[currentChoiceConfig?.key || ''] || ''}
          onSelect={onSelect}
          ref={bottomSheetRef}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { red, purple, base, text } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      flex: 1
    },
    textContainer: {
      paddingHorizontal: 20,
      marginVertical: 12
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#8fa6ae',
      borderStyle: 'dashed',
      borderRadius: 8,
      justifyContent: 'center',
      marginHorizontal: 20,
      paddingVertical: 9
    },
    text: {
      color: '#8fa6ae'
    },
    link: {
      color: purple[800]
    },
    required: {
      color: red['600']
    },
    input: {
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    balance: {
      marginTop: 8,
      color: text.title.secondary
    },
    actionText: {
      marginTop: 32
    },
    list: {
      width: screenWidth - 40,
      alignSelf: 'center',
      backgroundColor: base.white,
      borderRadius: 12,
      marginTop: 4,
      ...shadow6Style
    },
    radioStyle: { marginBottom: 0 },
    separator: {
      width: '100%',
      height: 0.5,
      backgroundColor: 'rgba(180, 196, 201, 0.5)'
    },
    continue: {
      marginBottom: 56,
      marginHorizontal: 20
    },
    newPayment: {
      marginTop: 16,
      gap: 24
    },
    infoText: {
      textAlign: 'left',
      marginHorizontal: 20
    },
    avoidView: {
      flex: 1
    },
    selectedImageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: base.white,
      marginHorizontal: 20,
      paddingRight: 12,
      paddingLeft: 16,
      paddingVertical: 9,
      borderRadius: 8,
      gap: 8,
      ...shadow6Style
    },
    img: {
      width: 26,
      height: 26,
      borderRadius: 4
    },
    selectedImageLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
      paddingRight: 22
    },
    errorText: {
      color: red['600'],
      marginLeft: 20
    },
    inputContainer: {
      gap: 8
    },
    loader: {
      marginTop: 24
    },
    choiceContainer: {
      marginHorizontal: 20
    },
    requiredSelect: {
      borderWidth: 1,
      borderColor: red['600']
    },
    balanceError: {
      color: red['600']
    },
    cbutton: {
      bottom: 0,
      gap: 12,
      width: '100%',
      backgroundColor: 'rgba(247, 248, 250, 0.75)',
      alignItems: 'center',
      paddingHorizontal: 20,
      position: 'absolute',
      paddingTop: 12
    },
    secure: {
      alignSelf: 'center',
      textAlign: 'center',
      paddingTop: 8,
      marginBottom: 20,
      color: '#5D7278'
    },
    imagesContainer: {
      gap: 16
    }
  });
};

export default WithdrawalAccount;
