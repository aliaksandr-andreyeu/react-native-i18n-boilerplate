import { SvgXmlIconNames, images } from '@/assets';
import {
  BaseButton,
  BaseButtonType,
  BaseCheckbox,
  BaseInput,
  BaseOptionList,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { ConfirmItem, Field } from '@/store/slices/wallet/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePayoutMutation } from '@/store/api';
import { actions } from '@/store';
import { useAppDispatch, useCallAccountWallets, useCommonStyles } from '@/hooks';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { CurrentList } from '../depositAmountEntry';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { formatTwoDecimals } from '@/helpers';

type WithdrawalConfirmationScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.WithdrawalConfirmation
>;

const {
  application: { openModal }
} = actions;

const { isIOS, screenWidth } = config;

type Values = {
  [key: string]: any;
};

type Action = {
  type: 'SET_VALUE';
  key: string;
  value: any;
};

const initialState: Values = {};

const valuesReducer = (state: Values, action: Action): Values => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        [action.key]: action.value
      };
    default:
      return state;
  }
};

const WithdrawalConfirmation: React.FC<WithdrawalConfirmationScreenProps> = ({ route, navigation }) => {
  const [values, dispatch] = useReducer(valuesReducer, initialState);
  const [error, setError] = useState<Record<string, string>>({});
  const [currentList, setCurrentList] = useState<CurrentList>({
    default: '',
    list: [],
    title: '',
    type: 'currency',
    key: ''
  });

  const bottomSheetRef = useRef<IBaseOptionList>(null);
  const payoutRequest = useRef<{ abort?: () => void }>();
  const balance = route.params.balance ?? 0;
  const data = route.params.confirmData?.confirmData || [];
  const form = route.params.form;
  const provider = route.params.provider;
  const fields = route.params.fields;

  const callWallets = useCallAccountWallets();
  const [payout, { isLoading, data: payoutData }] = usePayoutMutation();

  const appDispatch = useAppDispatch();

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const abort = () => payoutRequest.current && payoutRequest.current?.abort?.();

  const goBack = () => {
    abort();
    if (navigation.canGoBack() && navigation.isFocused()) navigation.goBack();
  };

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

  const handleData = async () => {
    if (payoutData && payoutData.transactionId) {
      await callWallets();
      navigation.isFocused() && navigation.navigate(ROOT_ROUTE_NAMES.App);
      setTimeout(() => {
        showPopUp({
          title: t('screens.withdrawal.withdrawal-success'),
          subTitle: t('screens.withdrawal.usually-takes'),
          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      }, 400);
    }
  };

  useEffect(() => {
    handleData();
  }, [payoutData, t]);

  const pageIsFocused = useIsFocused();

  const translatons: Record<string, string> = useMemo(
    () => ({
      'Withdraw From': t('screens.withdrawal.withdraw-from'),
      'Withdraw To': t('screens.withdrawal.withdraw-to'),
      Amount: t('screens.withdrawal.amount'),
      'Amount To Be Credited': t('screens.withdrawal.amount-credited')
    }),
    [t]
  );

  useEffect(() => {
    if (!pageIsFocused) abort();
  }, [pageIsFocused]);

  const Item = useCallback(
    ({ label, value }: { label: string; value: string }) => {
      let l = label;
      let v = value;
      if (l === 'Deposit Wallet') {
        l = t('screens.withdrawal.withdrawal-account');
        v = v?.replace?.(provider.title, '');
      } else {
        l = translatons[l];
      }
      return (
        <View style={styles.item}>
          <BaseText style={styles.label} variant={BaseTextVariant.small}>
            {l}
          </BaseText>
          <BaseText style={styles.value} variant={BaseTextVariant.small}>
            {v}
          </BaseText>
        </View>
      );
    },
    [theme.dark, provider, t, translatons]
  );

  const _keyExtractor = useCallback((item: ConfirmItem) => item?.label + item.value, []);

  const _renderItem = useCallback(({ item }: { item: ConfirmItem; index: number }) => {
    return <Item {...item} />;
  }, []);

  const onConfirm = useCallback(async () => {
    try {
      let payoutValues = { ...form } as Record<string, any>;

      for (let i = 0; i < fields.length; i++) {
        const field: Field = fields[i];
        const {
          type,
          name,
          options: { choices }
        } = field;

        if (['hidden', 'calculated_amount', 'transferAmount'].includes(type)) continue;
        if (type === 'choice') {
          if (choices?.length === 1) {
            payoutValues[name] = choices[0].value || form[name];
          } else {
            const index = choices?.findIndex((item) => item?.label === values[name]);
            payoutValues[name] = choices?.[index || 0]?.value || form[name] || '';
          }
        } else if (type === 'phone') {
          payoutValues[name] = `${values[name]}` || form[name] || '';
        } else if (type === 'form') {
          for (let j = 0; j < field.children.length; j++) {
            const subItem = field.children[j];
            if (subItem.type === 'hidden') {
              payoutValues[name] = {
                ...payoutValues[name],
                [subItem.name]: subItem.value || form[name]
              };
            } else if (subItem.type === 'choice') {
              const index = subItem?.options?.choices?.findIndex((item) => item?.label === values[subItem.name]);
              const value = subItem?.options?.choices?.[index || 0]?.value || form[subItem.name];
              payoutValues[name] = {
                ...payoutValues[name],
                [subItem.name]: value
              };
            } else {
              payoutValues[name] = {
                ...payoutValues[name],
                [subItem.name]:
                  (subItem.type === 'phone' || subItem.type === 'required_text'
                    ? `${values[subItem.name]}` || form[name]
                    : values[subItem.name] || form[name]) || ''
              };
            }
          }
        } else {
          payoutValues[name] = form[name] || values[name] || '';
        }
      }

      payoutRequest.current = payout({ form: payoutValues });
    } catch (error) {
      console.log(error);
    }
  }, [form, values, fields]);

  const changeError = (field: string, value: string) => {
    setError((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleConfigField = (
    field: Field & { isForm?: boolean },
    values: Values,
    dispatch: React.Dispatch<Action>,
    errors: Record<string, string>
  ): any => {
    const {
      name,
      type,
      options: { required, label = '', choices } = { required: false, label: '', choices: undefined },
      children
    } = field;

    if (type === 'hidden') return null;

    const key = `${name}-${label}-${type}`;

    const currentValue = values[name];

    const errs = errors?.[name];
    switch (type) {
      case 'phone':
        return (
          <View key={key} style={{ gap: 8 }}>
            <BaseInput
              keyboardType='phone-pad'
              title={label || name}
              hideClearButton
              required={required}
              value={`${currentValue || ''}`}
              error={required && currentValue?.length === 0}
              onChange={(val: string) => {
                val = `${val.replaceAll(',', '').replaceAll('.', '')}`;
                if (errs?.length > 0) changeError(name, '');

                dispatch({ value: val, key: name, type: 'SET_VALUE' });
              }}
              inputContainerStyle={styles.input}
            />
            {((required && currentValue?.length === 0) || errs?.length > 0) && (
              <BaseText variant={BaseTextVariant.small} style={styles.errorText}>
                {errs || t('errors.required')}
              </BaseText>
            )}
          </View>
        );
      case 'required_text':
        return (
          <View key={key} style={{ gap: 8 }}>
            <BaseInput
              keyboardType='phone-pad'
              title={label || name}
              hideClearButton
              required={required}
              value={`${currentValue || ''}`}
              error={required && currentValue?.length === 0}
              onChange={(val: string) => {
                val = `${val.replaceAll(',', '').replaceAll('.', '')}`;
                if (errs?.length > 0) changeError(name, '');

                dispatch({ value: val, key: name, type: 'SET_VALUE' });
              }}
              inputContainerStyle={styles.input}
            />
            {((required && currentValue?.length === 0) || errs?.length > 0) && (
              <BaseText variant={BaseTextVariant.small} style={styles.errorText}>
                {errs || t('errors.required')}
              </BaseText>
            )}
          </View>
        );

      case 'checkbox':
        return (
          <BaseCheckbox
            key={key}
            hasCheck
            containerStyle={{ marginLeft: 20, marginVertical: 4 }}
            textFont={BaseTextVariant.text}
            selected={currentValue}
            onChange={(value) => dispatch({ value, key: name, type: 'SET_VALUE' })}
            label={label || name}
          />
        );

      case 'choice':
        if (choices?.length === 1) {
          dispatch({ value: choices[0].value, key: name, type: 'SET_VALUE' });
          return null;
        }

        return (
          <View key={key} style={{ gap: 8 }}>
            <Pressable
              style={{ marginHorizontal: 20 }}
              onPress={() => {
                setCurrentList({
                  list: choices?.map((item) => item?.label || '') || [],
                  default: '',
                  key: name,
                  title: label || name,
                  type: 'dynamic'
                });
                bottomSheetRef.current?.open();
              }}
            >
              <BaseInput
                required={required}
                hideClearButton
                title={label || name}
                error={required && (!values[name] === undefined || values[name]?.length === 0)}
                editable={false}
                value={values[name]}
                dropdown
              />
            </Pressable>
            {((required && currentValue?.length === 0) || errs?.length > 0) && (
              <BaseText variant={BaseTextVariant.small} style={styles.errorText}>
                {errs || t('errors.required')}
              </BaseText>
            )}
          </View>
        );

      case 'form':
        if (!children?.length) return null;

        return children.map((formItem: Field) => {
          const newFields = { ...formItem, isForm: true };
          return handleConfigField(newFields, values, dispatch, errors);
        });

      default:
        return null;
    }
  };

  const renderConfigFields = (
    fields: Field[],
    values: Values,
    dispatch: React.Dispatch<Action>,
    errors: Record<string, string>
  ) => {
    return fields.map((item) => {
      return handleConfigField(item, values, dispatch, errors);
    });
  };

  const newComponents = useMemo(() => {
    return renderConfigFields(fields || [], values, dispatch, error);
  }, [fields, error, t, values]);

  const hasAccountDetails = useMemo(() => {
    if (fields.length) {
      const hasExtraTypes = fields.some((item) => ['phone', 'custom', 'checkbox', 'form'].includes(item.type));
      const hasChoice = fields.some((item) => item.type === 'choice');
      let hasChoiceValues = false;
      if (hasChoice) {
        const choices = fields.filter((item) => item.type === 'choice');
        for (let i = 0; i < choices.length; i++) {
          const {
            options: { choices: choicesArr }
          } = choices[i];
          if ((choicesArr?.length || 0) <= 1) continue;
          else hasChoiceValues = true;
        }
      }
      return hasExtraTypes || hasChoiceValues;
    }
    return false;
  }, [fields]);

  const onSelectCurrency = useCallback(
    (value: any) => {
      changeError(currentList.key, '');
      dispatch({ key: currentList.key, type: 'SET_VALUE', value });
    },
    [currentList]
  );

  const isDisabled = useMemo(() => {
    if (isLoading) return true;
    if (fields?.length) {
      for (let i = 0; i < fields.length; i++) {
        const {
          options: { required },
          name,
          type,
          children
        } = fields[i];

        if (['choice', 'phone'].includes(type)) {
          if (!required) continue;
          if (values?.[name] === undefined || values?.[name]?.length === 0) return true;
        } else if (type === 'form') {
          for (let j = 0; j < children.length; j++) {
            const subItem = children[j];
            if (!subItem.options.required) continue;
            if (
              values?.[subItem.name] === undefined ||
              (typeof values?.[subItem.name] === 'string' && values?.[subItem.name]?.length === 0) ||
              (typeof values?.[subItem.name] === 'boolean' && values?.[subItem.name] === false)
            )
              return true;
          }
        }
      }
    }

    const errorValues = Object.values(error);
    const hasError = errorValues.some((item) => item.length > 0);

    if (hasError) return true;

    return false;
  }, [isLoading, error, fields, values]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.avoidView}>
        <View style={styles.general}>
          <ProgressHeader
            title={provider.title}
            image={provider.image}
            onBackPressed={goBack}
            hideProgressBar
            leftIconType={SvgXmlIconNames.arrowLeft}
            stepsCount={0}
            currentStep={0}
          />
          <BaseText style={styles.title} variant={BaseTextVariant.title}>
            {t('screens.withdrawal.request-withdrawal')}
          </BaseText>
          <BaseText style={styles.balance} variant={BaseTextVariant.small}>
            {t('screens.withdrawal.wallet-balance', { balance: formatTwoDecimals(balance) })}
          </BaseText>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <FlatList
              data={data}
              style={styles.list}
              scrollEnabled={false}
              contentContainerStyle={styles.contentStyle}
              showsVerticalScrollIndicator={false}
              keyExtractor={_keyExtractor}
              renderItem={_renderItem}
            />
            {hasAccountDetails && (
              <>
                <BaseText style={styles.detailText} variant={BaseTextVariant.captionSemiBold}>
                  {t('screens.deposit.account-details')}
                </BaseText>
                <View style={styles.inputContainer}>{newComponents}</View>
              </>
            )}
          </ScrollView>
          {isLoading ? (
            <ActivityIndicator style={styles.indicator} color={theme.palette.graphite['900']} size={'small'} />
          ) : (
            <View style={styles.button}>
              <BaseButton
                disabled={isDisabled}
                style={styles.btn}
                type={BaseButtonType.primary}
                label={t('screens.withdrawal.withdraw')}
                onPress={onConfirm}
              />
              <BaseText style={styles.secure} variant={BaseTextVariant.small}>
                {t('screens.common.fully-secured')}
              </BaseText>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <BaseOptionList
        title={currentList.title}
        hasSearch={false}
        data={currentList.list}
        defaultSelected={currentList.default}
        onSelect={onSelectCurrency}
        ref={bottomSheetRef}
      />
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, red }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      flex: 1
    },
    general: { flex: 1 },
    title: {
      marginTop: 12,
      marginBottom: 8,
      marginHorizontal: 20
    },
    balance: {
      color: '#5D7278',
      marginLeft: 20,
      marginBottom: 24
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10
    },
    label: {
      color: '#8fa6ae',
      flex: 1
    },
    contentStyle: {
      marginHorizontal: 20,
      borderRadius: 12,
      paddingTop: 12,
      backgroundColor: base.white,
      ...shadow6Style
    },
    list: {
      paddingVertical: 12,
      paddingBottom: 20
    },
    button: {
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
    },
    secure: {
      alignSelf: 'center',
      textAlign: 'center',
      paddingTop: 8,
      marginBottom: 20,
      color: '#5D7278'
    },
    scrollContent: {
      paddingBottom: 124
    },
    indicator: {
      marginBottom: 44
    },
    value: { flex: 1, textAlign: 'right' },
    avoidView: {
      flex: 1
    },
    inputContainer: {
      gap: 12,
      marginTop: 24
    },
    detailText: {
      marginLeft: 20
    },
    errorText: {
      color: red['600'],
      marginLeft: 20
    },
    input: {
      width: screenWidth - 40,
      alignSelf: 'center'
    }
  });
};

export default WithdrawalConfirmation;
