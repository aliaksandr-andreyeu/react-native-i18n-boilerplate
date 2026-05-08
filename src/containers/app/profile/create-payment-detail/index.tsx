import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { ParamListBase, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Image, Keyboard, Pressable, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseInput,
  BaseOptionList,
  BaseText,
  BaseTextVariant
} from '@/components';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { useGetPaymentDetailsConfigQuery, useUploadMutation } from '@/store/api';
import { PaymentDetails, WithdrawUploadBody, WithdrawUploadData } from '@/store/slices/wallet/types';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import { IBaseOptionList } from '@/components/molecules/option-list';
import getAccessStatus from '@/helpers/picker/media';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { actions } from '@/store';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { ToastType, useToast } from '@/providers';
import { useTranslation } from 'react-i18next';
import useDynamicTranslations from '@/hooks/dynamicTranslations';

type ICreatePaymentDetail = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.CreatePaymentDetail
>;

const {
  buttons: { activeOpacity },
  screenWidth,
  isIOS
} = config;

const {
  application: { openModal }
} = actions;

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

const CreatePaymentDetail: React.FC<ICreatePaymentDetail> = ({ route, navigation }) => {
  const [values, dispatch] = useReducer(valuesReducer, initialState);

  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<{ config: Config }>({ config: {} });
  const [currentChoiceConfig, setCurrentChoiceConfig] = useState<ConfigField>();
  const [selectedImages, setSelectedImages] = useState<Asset[] | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const { openToast, closeToast } = useToast();

  const scrollRef = useRef<AnimatedScrollView>(null);
  const bottomSheetRef = useRef<IBaseOptionList>();
  const libraryLaunched = useRef<boolean>(false);
  const aborted = useRef<boolean>(false);

  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const providerId = route.params.id;
  const loginSid = route.params.loginSid;

  const withdrawData = useAppSelector((store) => store.wallet.withdrawPayments);
  const appDispatch = useAppDispatch();

  const [getPaymentDetailsConfig] = useGetPaymentDetailsConfigQuery();
  const [upload] = useUploadMutation();

  const translate = useDynamicTranslations('screens.create-payment-detail');

  const provider = useMemo(() => {
    return withdrawData.find((item) => item.id === providerId) || {};
  }, [providerId, withdrawData]);

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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.isFocused() && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
    });

    return backHandler.remove;
  }, [navigation]);

  const getDetailsConfig = async () => {
    try {
      const paymentConfigs = await getPaymentDetailsConfig(undefined).unwrap();
      const currentPaymentConfig = paymentConfigs.find(
        (item: PaymentDetails) => item.id === provider.paymentDetailsConfigId
      );

      if (currentPaymentConfig) {
        setCurrentConfig(currentPaymentConfig);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPaymentDetails = async () => {
    try {
      setLoading(true);
      await getDetailsConfig();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedImages(null);
      dispatch({ key: 'reset', type: 'RESET', value: '' });
      if (provider.paymentDetailsRequired) getPaymentDetails();
    }, [provider])
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
        if (!isGranted) return;
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
      <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.selectedImageContainer}>
        <View style={styles.selectedImageLeft}>
          <BaseImage source={{ uri: sImage.uri }} resizeMode='cover' style={styles.img} />
          <BaseText>{sImage.fileName || `image.${sImage.type}`}</BaseText>
        </View>
        <TouchableOpacity activeOpacity={activeOpacity} hitSlop={5} onPress={onDiscardImage}>
          <SvgIcon name={SvgXmlIconNames.close} size={{ width: 10, height: 10 }} />
        </TouchableOpacity>
      </Animated.View>
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

  const lessThan5MB = useMemo(() => {
    if (!selectedImages?.length) return null;
    if (selectedImages.every((item) => item.fileSize !== undefined)) {
      for (let i = 0; i < selectedImages.length; i++) {
        const imageSize = selectedImages[i].fileSize || 0;
        const asMB = imageSize / 1048576;
        if (asMB > 5) return t('errors.file-size-is-too-big');
      }
      return null;
    }

    return t('errors.file-size-is-too-big');
  }, [selectedImages]);

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
    if (lessThan5MB !== null || loading) return true;
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleConfigField = (
    field: ConfigField,
    values: Values,
    dispatch: React.Dispatch<Action>,
    configId: number | undefined
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

  const renderConfigFields = (
    config: Config,
    values: Values,
    dispatch: React.Dispatch<Action>,
    configId: number | undefined
  ) => {
    return Object.keys(config)
      .map((key) => {
        const field = config[key];
        return handleConfigField(field, values, dispatch, configId);
      })
      .filter((field) => field !== null);
  };

  const newPaymentComponents = useMemo(() => {
    return renderConfigFields(currentConfig?.config, values, dispatch, provider.paymentDetailsConfigId);
  }, [currentConfig.config, JSON.stringify(values), selectedImages, t, provider.paymentDetailsConfigId]);

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

  const withdrawUpload = async () => {
    try {
      setCreating(true);
      const configEntries = Object.entries(currentConfig.config);

      const uploadData: WithdrawUploadData[] = configEntries.map((item) => {
        const name = item[0];
        const config: ConfigField = item[1];
        const { key } = config;
        const value = values[key];

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
        configId: provider.paymentDetailsConfigId || 0
      };

      const uploadRes = await upload(body).unwrap();

      if (uploadRes?.id) {
        setTimeout(() => {
          showPopUp({
            title: t('screens.withdrawal.payment-account-added', { account: uploadRes?.number || '' }),
            closeTime: 5,
            icon: images.depositSuccess,
            iconSize: {
              width: 115,
              height: 90
            }
          });
        }, 350);
        if (navigation.isFocused() && navigation.canGoBack()) navigation.goBack();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCreating(false);
    }
  };

  const Loader = useCallback(() => {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={'small'} color={theme.palette.graphite['900']} />
      </View>
    );
  }, [theme.dark]);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.head}>
        <BaseBackButton isChevron={false} />
        <View style={styles.headerTitle}>
          <Image source={{ uri: provider.logo }} style={styles.logo} />
          <BaseText variant={BaseTextVariant.caption}>{provider.displayName}</BaseText>
        </View>
        <View style={styles.replacer} />
      </View>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.componentsContainer}>
        <Animated.ScrollView contentContainerStyle={styles.scroll} ref={scrollRef}>
          {loading ? <Loader /> : newPaymentComponents}
        </Animated.ScrollView>
      </KeyboardAvoidingView>
      <BaseOptionList
        title={currentChoiceConfig?.label || ''}
        hasSearch={false}
        hasIcons={false}
        data={currentChoiceConfig?.choiceLabels || []}
        defaultSelected={values[currentChoiceConfig?.key || ''] || ''}
        onSelect={onSelect}
        ref={bottomSheetRef}
      />
      <View style={styles.btnContianer}>
        <BaseButton
          style={styles.margin}
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          loading={creating}
          label={t('screens.withdrawal.add-payment-detail')}
          disabled={continueIsDisabled() || loading}
          onPress={withdrawUpload}
        />
      </View>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, red, base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    flex: {
      flex: 1
    },
    imagesContainer: {
      gap: 16
    },
    scroll: {
      gap: 16,
      paddingBottom: 88,
      paddingTop: 12
    },
    componentsContainer: {
      gap: 16,
      flex: 1
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    btnContianer: {
      paddingBottom: 34,
      paddingTop: 12,
      backgroundColor: 'rgba(247, 248, 250, 0.75)'
    },
    margin: {
      marginHorizontal: 20
    },
    replacer: {
      width: 30,
      height: 30,
      marginRight: 20
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    logo: {
      width: 28,
      height: 28,
      borderRadius: 15
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
      marginTop: 8
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
    btn: {
      width: '100%'
    }
  });
};

export default CreatePaymentDetail;
