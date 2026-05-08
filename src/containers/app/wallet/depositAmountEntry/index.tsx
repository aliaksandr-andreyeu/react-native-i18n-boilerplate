import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParamListBase, useIsFocused, useTheme } from '@react-navigation/native';
import useStyles from './styles';
import {
  BaseButton,
  BaseButtonType,
  BaseCheckbox,
  BaseInput,
  BaseOptionList,
  BaseText,
  BaseTextVariant,
  ProgressHeader,
  TransactionForm
} from '@/components';
import { useTranslation } from 'react-i18next';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useGetPaymentDetailsQuery, useMakeDepositMutation, usePayoutMutation } from '@/store/api';
import { useAppSelector, useDepositTracking } from '@/hooks';
import {
  DepositResponse,
  Fees,
  Field,
  FirstPayloadMakeDeposit,
  PSP,
  ParsedPaymentMethod
} from '@/store/slices/wallet/types';
import { ActivityIndicator, Keyboard, Linking, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { config } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import getCurrency, { Currencies } from '@/helpers/currency';
import { depositGuideViewedMixpanel, formatTwoDecimals } from '@/helpers';
import { ToastType, useToast } from '@/providers';
import { UploadPaymentDetails } from '../components';

type DepositAmountEntryProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.DepositAmountEntry
>;

type Values = {
  [key: string]: any;
};

type Action = {
  type: 'SET_VALUE';
  key: string;
  value: any;
};

const { isIOS } = config;

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

export interface CurrentList {
  type: 'dynamic' | 'currency';
  list: string[];
  title: string;
  default: string;
  key: string;
}

function validateDecimalPlaces(input: string, decimalPlaces: number | string | undefined) {
  if (decimalPlaces === undefined) return true;
  const regex = new RegExp(`^(?!0\\.$)(0|[1-9]\\d*)(\\.\\d{0,${decimalPlaces}})?$|^$`);
  return regex.test(input);
}

const {
  buttons: { activeOpacity }
} = config;

let timeout: NodeJS.Timeout;

const maxBalanceForUnverified = 100;

const DepositAmountEntry: FC<DepositAmountEntryProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const [values, dispatch] = useReducer(valuesReducer, initialState);
  const [currentList, setCurrentList] = useState<CurrentList>({
    default: '',
    list: [],
    title: '',
    type: 'currency',
    key: ''
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currencies>('USD');
  const [hasCalculatedAmount, setHasCalculatedAmount] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<Record<string, string>>({});
  const [stepLoading, setStepLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [hideTransaction, setHideTransaction] = useState<boolean>(true);
  const [uplaodPaymentIsActive, setUplaodPaymentIsActive] = useState<boolean>(false);

  const [feeCurrency, setFeeCurrency] = useState<string | undefined>(undefined);
  const { openToast } = useToast();

  const [withdrawalRes, SetWithdrawalRes] = useState<DepositResponse>();
  const [transferLimits, setTransferLimits] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null
  });

  const formFields = useRef<DepositResponse | null>(null);
  const lastAmount = useRef<string>();
  const lastFormValues = useRef<any>();
  const lastCalculatedValue = useRef<string>('0');
  const aborted = useRef<boolean>(false);

  const isFirstWithdrawalRequrest = useRef<boolean>(true);
  const isFirstDepositRequest = useRef<boolean>(true);

  const updateTracking = useDepositTracking();

  const [getDepositFeeRate, { data: depositFeeRateData }] = useMakeDepositMutation();
  const [getPaymentDetails, { isFetching: paymentDetailsIsFetching }] = useGetPaymentDetailsQuery();

  const [makeDeposit, { data: makeDepositDataObj, isLoading: depositLoading }] = useMakeDepositMutation();
  const [payout, { isLoading: payoutLoading }] = usePayoutMutation();

  const paymentId = route.params?.paymentId;
  const isWithdrawal = route.params?.isWithdrawal;
  const withdrawalResponse = route.params?.withdrawalRes;
  const body = route.params?.body || null;
  const provider = route.params.provider;

  const wallet = useAppSelector((store) => store.wallet);

  const { accounts, payments } = useMemo(() => {
    return {
      accounts: wallet[isWithdrawal ? 'withdrawAccounts' : 'depositAccounts'] || [],
      payments: wallet[isWithdrawal ? 'withdrawPayments' : 'depositPayments'] || []
    };
  }, [wallet, isWithdrawal]);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const isLoading = useMemo(
    () => (isWithdrawal ? payoutLoading : depositLoading || paymentDetailsIsFetching),
    [isWithdrawal, payoutLoading, depositLoading, paymentDetailsIsFetching]
  );

  useEffect(() => {
    SetWithdrawalRes(withdrawalResponse);
  }, [withdrawalResponse]);

  const makeDepositData = useMemo(
    () => (isWithdrawal ? withdrawalRes : makeDepositDataObj),
    [makeDepositDataObj, isWithdrawal, withdrawalRes]
  );

  const firstLoginSidCanDeposit = useMemo(() => {
    const account = accounts.find((item) => item.type.clientPermissions[isWithdrawal ? 'canWithdraw' : 'canDeposit']);
    setBalance(account?.balance || 0);
    return account?.loginSid || '';
  }, [accounts, isWithdrawal]);

  const changeError = (field: string, value: string) => {
    setError((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const selectedPayment = useMemo((): {
    selectedP: PSP & ParsedPaymentMethod;
    currencies: string[];
    defaultSelected: string;
  } => {
    const selectedP = payments.find((item) => item.id === paymentId);
    const currencies = selectedP?.currencies || [];

    let defaultSelected: Currencies = 'USD';
    if (isWithdrawal) {
      setSelectedCurrency((selectedP?.currencies?.[0] as Currencies) || 'USD');
    } else {
      if (!currencies.includes('USD')) defaultSelected = (selectedP?.currencies?.[0] as Currencies) || 'USD';

      setSelectedCurrency(defaultSelected);
    }

    return {
      selectedP: selectedP as any,
      currencies,
      defaultSelected
    };
  }, [payments, paymentId, isWithdrawal]);

  const checkFeeCurrency = () => {
    const { fees, calculatedAmountCurrency } = makeDepositData?.step2AdditionalData || {};

    if (!(fees && Array.isArray(fees) && fees.length > 0)) {
      return;
    }

    const feesCurrencies: string[] = fees?.reduce((acc: string[], item: Fees): string[] => {
      const { feeType, minFeeType, maxFeeType } = item || {};

      let fees = [...acc];

      if (feeType !== '%' && feeType !== null && feeType !== calculatedAmountCurrency) {
        fees.push(feeType);
      }
      if (minFeeType !== '%' && minFeeType !== null && minFeeType !== calculatedAmountCurrency) {
        fees.push(minFeeType);
      }
      if (maxFeeType !== '%' && maxFeeType !== null && maxFeeType !== calculatedAmountCurrency) {
        fees.push(maxFeeType);
      }

      return [...new Set(fees)];
    }, []);

    if (!(feesCurrencies && feesCurrencies.length > 0)) {
      return;
    }

    const feesCurrency = feesCurrencies.find((el) => el);

    if (!feesCurrency) {
      return;
    }

    setFeeCurrency(feesCurrency);
  };

  useLayoutEffect(() => {
    checkFeeCurrency();
  }, [makeDepositData]);

  const getDepositFeeRateHandler = async () => {
    if (isWithdrawal || !feeCurrency) {
      return;
    }
    try {
      const body: FirstPayloadMakeDeposit = {
        account: firstLoginSidCanDeposit,
        paymentSystem: paymentId,
        currency: feeCurrency
      };

      await getDepositFeeRate(body);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    !isWithdrawal && updateTracking({ step: 2 });
  }, [isWithdrawal]);

  useLayoutEffect(() => {
    getDepositFeeRateHandler();
  }, [feeCurrency, isWithdrawal]);

  const getPercentageFeeValue = (feeValue: string | number, amountValue: string | number): number => {
    return (Number(feeValue) * Number(amountValue)) / 100;
  };

  const getRateFeeValue = (feeValue: string | number, rateValue: string | number): number => {
    return Number(feeValue) * Number(rateValue);
  };

  const calculatedFee = useMemo((): string => {
    const { fees, calculatedAmountCurrency, currency, rate } = makeDepositData?.step2AdditionalData || {};
    const { rate: feeRate, currency: feeCurrency } = depositFeeRateData?.step2AdditionalData || {};

    const feeAmountCurrency = isWithdrawal ? currency : calculatedAmountCurrency;

    let calculatedAmount = 0;

    if (rate && amount) {
      calculatedAmount = Number(rate) * Number(amount);
    } else if (amount === '') {
      calculatedAmount = 0;
    } else {
      calculatedAmount = Number(lastCalculatedValue.current || '0');
    }

    if (!(fees && Array.isArray(fees) && fees.length > 0)) {
      return '';
    }

    const feeValue: number = fees?.reduce((acc: number, item: Fees): number => {
      const { fee, feeType, minFee, minFeeType, maxFee, maxFeeType } = item || {};

      let val = 0;
      let minVal = 0;
      let maxVal = 0;

      if (feeType !== null) {
        if (feeType === feeAmountCurrency) {
          val = Number(fee);
        } else if (feeType == feeCurrency && feeRate) {
          val = getRateFeeValue(fee, feeRate);
        } else if (feeType === '%') {
          val = getPercentageFeeValue(fee, calculatedAmount);
        }
      }

      if (minFeeType !== null) {
        if (minFeeType === feeAmountCurrency) {
          minVal = Number(minFee);
        } else if (minFeeType == feeCurrency && feeRate) {
          minVal = getRateFeeValue(minFee, feeRate);
        }
        if (val < minVal) {
          val = minVal;
        }
      }

      if (maxFeeType !== null) {
        if (maxFeeType === feeAmountCurrency) {
          maxVal = Number(maxFee);
        } else if (maxFeeType == feeCurrency && feeRate) {
          maxVal = getRateFeeValue(maxFee, feeRate);
        }
        if (val > maxVal) {
          val = maxVal;
        }
      }

      return acc + val;
    }, 0);

    if (Number(calculatedAmount) === 0) {
      return '';
    }
    const formattedVal = parseInt(String(feeValue * 100), 10) / 100;

    return formattedVal ? formattedVal.toFixed(2) : '';
  }, [amount, makeDepositData, depositFeeRateData, isWithdrawal, lastCalculatedValue]);

  const calculatedValue = useMemo((): string => {
    const { rate } = makeDepositData?.step2AdditionalData || {};
    if (rate && amount) {
      const val = (Number(rate) * Number(amount) - Number(calculatedFee)).toFixed(2);
      lastCalculatedValue.current = val;
      return val;
    }
    if (amount === '') return '0';
    return lastCalculatedValue.current || '0';
  }, [amount, makeDepositData, calculatedFee]);

  const handleFormValues = (data: Field[] = []) => {
    let foundCalculated = false;
    if (data.length) {
      const body = data.reduce((acc: Record<string, any>, item: Field) => {
        if (item.type === 'calculated_amount' && !foundCalculated) {
          setHasCalculatedAmount(true);
          foundCalculated = true;
        } else if (item.type === 'form') {
          for (let i = 0; i < item.children.length; i++) {
            const subItem: Field = item.children[i];
            acc[item.name] = {
              ...acc[item.name],
              [subItem.name]: subItem.value
            };
          }
          return acc;
        }
        acc[item.name] = item.value;
        return acc;
      }, {});

      lastFormValues.current = body;

      return body;
    }
  };

  const formValues = useMemo(() => {
    return handleFormValues(makeDepositData?.form?.fields);
  }, [makeDepositData?.form]);

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
      case 'text':
      case 'required_text':
        return (
          <View key={key} style={{ gap: 8 }}>
            <BaseInput
              keyboardType='phone-pad'
              title={label || `${t('errors.phoneNumberFormat')}`}
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

      case 'wallet':
      case 'choice':
        if (choices?.length === 1 && type === 'choice') {
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
                  default: values[name],
                  key: name,
                  title: label || name,
                  type: 'dynamic'
                });
                Keyboard.dismiss();
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
    let makeDData = makeDepositData;
    if (formFields.current) makeDData = formFields.current;
    else formFields.current = makeDData || null;
    const fields = makeDData?.form?.fields;

    return renderConfigFields(fields || [], values, dispatch, error);
  }, [makeDepositData, JSON.stringify(values), error, t, selectedPayment?.selectedP?.id]);

  const hasWalletField = useMemo(() => {
    if (isWithdrawal) {
      setHideTransaction(false);
      return false;
    }
    if (makeDepositData?.form?.fields) {
      const hasWallet = makeDepositData.form.fields.some((item) => item.type === 'wallet');
      if (hasWallet) setHideTransaction(true);
      else setHideTransaction(false);
      return hasWallet;
    }

    return false;
  }, [makeDepositData?.form?.fields, isWithdrawal]);

  const makeDepositFn = async (extraField: any = {}): Promise<DepositResponse | null> => {
    try {
      if (paymentId !== undefined && firstLoginSidCanDeposit && selectedPayment && selectedCurrency && !isWithdrawal) {
        const body: FirstPayloadMakeDeposit = {
          account: firstLoginSidCanDeposit,
          paymentSystem: paymentId,
          currency: selectedCurrency,
          ...extraField
        };
        formFields.current = null;
        if (!aborted.current) return await makeDeposit(body).unwrap();
        isFirstDepositRequest.current = false;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setUplaodPaymentIsActive(false);
    }
  };

  const transferAmountDecimalPlace = useMemo(() => {
    if (!makeDepositData || !makeDepositData?.form?.fields) return undefined;
    const transferFrom =
      makeDepositData?.form?.fields.find((item) => item?.type === 'transferAmount')?.options?.attr?.[
        'data-decimal-places'
      ] ?? undefined;
    return transferFrom;
  }, [makeDepositData]);

  const calculatedAmountDecimalPlaces = useMemo(() => {
    if (!makeDepositData || !makeDepositData?.form?.fields) return undefined;
    const transferFrom =
      makeDepositData?.form?.fields.find((item) => item?.type === 'calculated_amount')?.options?.attr?.[
        'data-decimal-places'
      ] ?? undefined;
    return transferFrom;
  }, [makeDepositData]);

  const onAmountChange = useCallback(
    (val: string, min?: number | undefined, max?: number | undefined) => {
      if (error['amount']?.length > 0) changeError('amount', '');

      const currency = getCurrency(isWithdrawal ? 'USD' : selectedCurrency);
      let newVal = val
        .replaceAll(',', '.')
        .replace(/[^\d.]/g, '')
        .trim();

      const validated = validateDecimalPlaces(newVal, transferAmountDecimalPlace);

      if (transferAmountDecimalPlace === 0) newVal = newVal.replaceAll('.', '');
      if (!validated) return;
      if (isWithdrawal) {
        const hasBalanceError = error['wallet-balance'] === 'true';
        if (+newVal > balance && !hasBalanceError) changeError('wallet-balance', 'true');
        else if (hasBalanceError && +newVal <= balance) changeError('wallet-balance', '');
      }

      if (val === lastAmount.current) newVal = newVal.slice(0, -1);
      lastAmount.current = newVal;
      setAmount(newVal);
      if (!newVal.length) return changeError('amount', '');
      if (max !== undefined)
        +newVal > max && changeError('amount', `Maximum Deposit Amount is ${currency.text(transferLimits.max)}`);

      if (min !== undefined)
        +newVal < min && changeError('amount', `Minimum Deposit Amount is ${currency.text(transferLimits.min)}`);
      if (transferLimits.max)
        +newVal > transferLimits.max &&
          changeError('amount', `Maximum Deposit Amount is ${currency.text(transferLimits.max)}`);
      if (transferLimits.min)
        +newVal < transferLimits.min &&
          changeError('amount', `Minimum Deposit Amount is ${currency.text(transferLimits.min)}`);
    },
    [error, transferLimits, selectedCurrency, isWithdrawal, transferAmountDecimalPlace]
  );

  const makePayoutFn = async (b: FirstPayloadMakeDeposit) => {
    try {
      const res = await payout({
        ...b,
        currency: selectedCurrency
      }).unwrap();
      isFirstWithdrawalRequrest.current = false;
      SetWithdrawalRes(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isWithdrawal && body && !isFirstWithdrawalRequrest.current) {
      makePayoutFn(body);
    } else {
      if (!isFirstDepositRequest.current) {
        makeDepositFn();
      }
    }
    isFirstWithdrawalRequrest.current = false;
  }, [
    paymentId,
    firstLoginSidCanDeposit,
    selectedPayment,
    selectedCurrency,
    isWithdrawal,
    body,
    isFirstWithdrawalRequrest.current,
    isFirstDepositRequest.current
  ]);

  const bottomSheetRef = useRef<IBaseOptionList>(null);

  const isDisabled = useMemo(() => {
    if (isLoading || stepLoading) return true;

    const fields = makeDepositData?.form?.fields;

    if (fields?.length) {
      if (hasWalletField && fields?.length) {
        const walletField = fields.find((item) => item.type === 'wallet');
        if (walletField?.name) {
          if (values?.[walletField?.name] === undefined || values?.[walletField?.name]?.length === 0) return true;
          return false;
        }
      }

      if (amount.length < 1 || +amount <= 0 || isNaN(+amount)) return true;

      for (let i = 0; i < fields.length; i++) {
        const {
          options: { required },
          name,
          type,
          children
        } = fields[i];

        if ((['choice', 'phone', 'text', 'required_text', 'wallet'] as Field['type'][]).includes(type)) {
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
  }, [isLoading, amount, error, stepLoading, makeDepositData?.form, values, hasWalletField]);

  const onMakeDeposit = useCallback(async () => {
    try {
      setStepLoading(true);

      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }

      if (hasWalletField && values['wallet']) {
        const paymetDetails = await getPaymentDetails(selectedPayment.selectedP.id).unwrap();
        const walletValue = values['wallet'];
        const walletNumber =
          paymetDetails?.find((p) => p.data?.wallet?.value === walletValue)?.id ?? walletValue.match(/\d+/)?.[0];
        (await makeDepositFn({ wallet: walletNumber })) as DepositResponse;
        return setStepLoading(false);
      }

      if (makeDepositData?.form) {
        const depositFormValues = { ...formValues } as Record<string, any>;

        const hasTransferAmount = makeDepositData?.form?.fields.find((item: Field) => item.type === 'transferAmount');
        if (hasTransferAmount) depositFormValues[hasTransferAmount.name] = amount;
        const hasCalculatedAmountType = makeDepositData?.form.fields.find(
          (item: Field) => item.type === 'calculated_amount'
        );
        if (hasCalculatedAmountType) depositFormValues[hasCalculatedAmountType.name] = calculatedValue;

        const getChoiceValue = (label: string, choiceList?: { label: string; value: any }[] | null) =>
          choiceList?.find((item) => item?.label === label)?.value || '';

        const isChoiceType = (type: Field['type']) => ['choice', 'wallet'].includes(type);

        const isTextType = (type: Field['type']) => ['phone', 'required_text', 'text'].includes(type);

        for (const field of makeDepositData.form?.fields) {
          const { type, name, options, children } = field;
          const choices = options?.choices;

          if (['hidden', 'calculated_amount', 'transferAmount'].includes(type)) continue;

          if (type === 'form' && Array.isArray(children)) {
            depositFormValues[name] = {};

            for (const subItem of children) {
              const { type: subType, name: subName, options: subOptions } = subItem;
              const subChoices = subOptions?.choices;

              let value: any;

              if (subType === 'hidden') {
                value = subItem.value;
              } else if (isChoiceType(subType)) {
                value = getChoiceValue(values[subName], subChoices);
              } else if (isTextType(subType)) {
                value = `${values[subName] || ''}`;
              } else {
                value = getChoiceValue(values[subName], subChoices);
              }

              depositFormValues[name][subName] = value;
            }

            continue;
          }

          if (isChoiceType(type)) {
            const returnedValue = getChoiceValue(values[name], choices);
            let itemValue = choices?.length === 1 ? choices[0].value : returnedValue;
            depositFormValues[name] = itemValue;
            continue;
          }

          if (isTextType(type)) {
            let formValue = values[name];
            if (type === 'phone') {
              if (formValue && !formValue?.startsWith?.('+')) {
                formValue = `+${formValue}`;
              }
            }
            depositFormValues[name] = formValue;
            continue;
          }
          depositFormValues[name] = values[name] || '';
        }

        lastFormValues.current = depositFormValues;

        const payload = { form: depositFormValues };

        const fn = isWithdrawal ? payout : makeDeposit;

        if (aborted.current) return;
        const res = await fn(payload).unwrap();

        if (isWithdrawal) SetWithdrawalRes(res);

        if (aborted.current) return;
        if (res?.form?.fields) {
          const hasError = res.form.fields.some((item: { errors: string[] }) => item.errors.length);
          if (hasError) setStepLoading(false);
          else if (!isWithdrawal) {
            updateTracking({
              step: 3,
              completed: false,
              payload: JSON.stringify(payload || {})
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      setStepLoading(false);
    }
  }, [
    hasWalletField,
    formValues,
    amount,
    calculatedValue,
    makeDepositData,
    values,
    isWithdrawal,
    provider,
    paymentId,
    firstLoginSidCanDeposit,
    selectedPayment,
    selectedCurrency
  ]);

  const makeDeposit3Step = async () => {
    try {
      if (isWithdrawal && makeDepositData && makeDepositData?.step3AdditionalData) {
        setStepLoading(false);
        return navigation.navigate(ROOT_ROUTE_NAMES.WithdrawalConfirmation, {
          balance,
          confirmData: makeDepositData.step3AdditionalData,
          form: lastFormValues.current,
          provider,
          fields: makeDepositData?.form?.fields || []
        });
      }

      const fn = isWithdrawal ? payout : makeDeposit;

      const payload = { form: lastFormValues.current };

      if (aborted.current) return;
      setStepLoading(true);

      const res = await fn(payload).unwrap();

      if (aborted.current) return;

      if (!isWithdrawal && (res?.depositResult?.redirectUrl || res?.depositResult?.url || res.depositResult.content)) {
        updateTracking({
          step: 3,
          completed: false,
          response: JSON.stringify(res || {})
        });
      }
      if (res?.depositResult?.redirectUrl) {
        navigation.navigate(ROOT_ROUTE_NAMES.WebView, {
          transactionId: res?.depositResult?.transactionId,
          redirectUrl: res?.depositResult?.redirectUrl,
          isDeposit: true,
          provider: route.params.provider,
          currency: selectedCurrency,
          amount: calculatedValue
        });
      } else if (res?.depositResult?.redirectUrl === null && res?.depositResult?.url !== null) {
        const params = new URLSearchParams(res?.depositResult?.params);
        const url = res?.depositResult?.url;
        const redirectUrl = url + '?' + params;
        navigation.navigate(ROOT_ROUTE_NAMES.WebView, {
          transactionId: res?.depositResult?.transactionId,
          redirectUrl: redirectUrl,
          isDeposit: true,
          provider: route.params.provider,
          currency: selectedCurrency,
          amount: calculatedValue
        });
      } else if (
        res?.depositResult?.redirectUrl === null &&
        res?.depositResult?.url === null &&
        res.depositResult.content !== null
      ) {
        navigation.navigate(ROOT_ROUTE_NAMES.WebView, {
          transactionId: res?.depositResult?.transactionId,
          redirectUrl: '',
          isDeposit: true,
          provider: route.params.provider,
          currency: selectedCurrency,
          amount: calculatedValue,
          content: res.depositResult.content
        });
      }
    } catch (error) {
      console.error(error);
      setStepLoading(false);
    }
  };

  const handleDefaultValues = (data: Field[]) => {
    for (let i = 0; i < data.length; i++) {
      const {
        type,
        value,
        options: { choices },
        name,
        children
      } = data[i];
      if (['hidden', 'calculated_amount', 'transferAmount'].includes(type)) continue;
      if (type === 'choice' && (value || choices?.length === 1) && name && choices) {
        if (choices?.length === 1) dispatch({ key: name, type: 'SET_VALUE', value: choices[0].label });
        else {
          const indexOfChoice = choices?.findIndex((item) => item.value === value);
          dispatch({ key: name, type: 'SET_VALUE', value: choices[indexOfChoice]?.label });
        }
      } else if (type === 'form') handleDefaultValues(children);
      else if (value && name) dispatch({ key: name, type: 'SET_VALUE', value });
    }
  };

  const handleDepositData = () => {
    if (isWithdrawal && isFirstWithdrawalRequrest.current) return (isFirstWithdrawalRequrest.current = false);
    if (!isWithdrawal && isFirstDepositRequest.current) {
      return (isFirstDepositRequest.current = false);
    }

    try {
      if (makeDepositData) {
        if (makeDepositData?.form?.fields) {
          const hasError = makeDepositData.form.fields.find((item) => item.errors.length > 0);
          if (hasError) {
            if (hasError?.errors[0]?.includes('You need to wait')) {
              openToast({
                desc: hasError.errors[0],
                type: ToastType.error
              });
            }
            console.error(hasError.name, hasError.errors[0]);
            return changeError(hasError.name, hasError.errors[0]);
          }
        }

        if (makeDepositData.step2AdditionalData) {
          if (isWithdrawal) handleDefaultValues(makeDepositData.form.fields);
          const min = +makeDepositData.step2AdditionalData.minAmount;
          let max = +makeDepositData.step2AdditionalData.maxAmount || null;

          if (!isVerified) {
            max = maxBalanceForUnverified - balance;
            if (max <= min) {
              max = null;
            }
          }

          setTransferLimits({
            max,
            min
          });
        } else if (makeDepositData.step3AdditionalData && lastFormValues.current) {
          if (aborted.current) return;
          makeDeposit3Step();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pageIsFocused = useIsFocused();

  useEffect(() => {
    aborted.current = !pageIsFocused;
  }, [pageIsFocused]);

  useEffect(() => {
    if (aborted.current) return;
    handleDepositData();
  }, [makeDepositData, isVerified, balance, provider, isWithdrawal]);

  useEffect(() => {
    onAmountChange(amount);
  }, [transferLimits]);

  const onChevronPress = useCallback(() => {
    timeout && clearTimeout(timeout);

    if (stepLoading || isLoading) return;

    setCurrentList({
      list: selectedPayment.currencies,
      default: selectedPayment.defaultSelected,
      key: '',
      title: 'Choose currency',
      type: 'currency'
    });
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      timeout = setTimeout(() => {
        bottomSheetRef.current?.open();
      }, 350);
    } else bottomSheetRef.current?.open();
  }, [stepLoading || isLoading, selectedPayment]);

  const infoText = useMemo(() => {
    const maxLimit = getCurrency(isWithdrawal ? 'USD' : selectedCurrency).text(transferLimits.max);
    const minLimit = getCurrency(isWithdrawal ? 'USD' : selectedCurrency).text(transferLimits.min);
    if (!transferLimits.min && !transferLimits.max) return t('screens.deposit.any-amount');
    else if (transferLimits.max && !transferLimits.min) return t('screens.deposit.any-amount-to', { max: maxLimit });
    else if (!transferLimits.max && transferLimits.min) return t('screens.deposit.any-amount-from', { min: minLimit });
    else return t('screens.deposit.any-amount-from-to', { min: minLimit, max: maxLimit });
  }, [transferLimits, isWithdrawal, t]);

  const onSelectCurrency = useCallback(
    (curr: Currencies) => {
      changeError(currentList.key, '');
      if (currentList.type === 'currency') {
        lastAmount.current = undefined;
        setSelectedCurrency(curr);
      } else {
        dispatch({ key: currentList.key, type: 'SET_VALUE', value: curr });
      }
    },
    [currentList]
  );

  const hasAccountDetails = useMemo(() => {
    const form = formFields.current?.form || makeDepositData?.form;
    if (form) {
      const hasExtraTypes = form.fields.some((item) =>
        (['phone', 'custom', 'checkbox', 'form', 'text', 'required_text', 'wallet'] as Field['type'][]).includes(
          item.type
        )
      );
      const hasChoice = form.fields.some((item) => item.type === 'choice');
      let hasChoiceValues = false;
      if (hasChoice) {
        const choices = form.fields.filter((item) => item.type === 'choice');
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
  }, [makeDepositData?.form]);

  const maxLimit = useMemo(() => {
    if (transferLimits.max === null) return false;
    else if (+amount > transferLimits.max) return true;
    return false;
  }, [amount, transferLimits.max]);

  const hasExceedWallet = useMemo(() => {
    if (!isVerified) {
      const max = maxBalanceForUnverified - balance;
      if (transferLimits.min !== null && max <= transferLimits.min) {
        return true;
      }
    }
    return error?.['wallet-balance']?.length > 0 || false;
  }, [error, isVerified, balance, transferLimits]);

  const accountError = useMemo(() => {
    const accountError = error?.['account'];
    if (accountError && accountError.includes('pending withdrawal for'))
      return t('screens.deposit.account-pending-error');
    return '';
  }, [error, t]);

  const Doc = ({ title, url }: { title: string; url: string }) => {
    const onPress = async () => {
      if (!url) return;
      const canOpen = await Linking.canOpenURL(url);
      depositGuideViewedMixpanel(selectedPayment.selectedP?.systemId, selectedPayment.selectedP?.displayName, title);
      if (!canOpen) return;
      Linking.openURL(url);
    };

    return (
      <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={styles.doc}>
        <SvgIcon name={SvgXmlIconNames.file} color={theme.palette.purple[500]} size={IconSize.sm} />
        <BaseText variant={BaseTextVariant.small}>{title}</BaseText>
      </TouchableOpacity>
    );
  };

  const guides = useMemo(() => {
    if (!selectedPayment.selectedP?.depositGuides?.length) return null;
    return (
      <View style={styles.docContainer}>
        <BaseText variant={BaseTextVariant.captionSemiBold}>{t('screens.deposit.step-by-step-guide')}</BaseText>
        <View style={styles.guidesContainer}>
          {selectedPayment.selectedP?.depositGuides.map((item) => {
            return <Doc key={`${item.caption}-${item.url}`} title={item.caption} url={item.url} />;
          })}
        </View>
      </View>
    );
  }, [selectedPayment.selectedP?.depositGuides, t, theme.dark, selectedPayment.selectedP]);

  const toggleUploadPayments = useCallback(() => setUplaodPaymentIsActive((prev) => !prev), []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.avoidView}>
        <View style={styles.container}>
          <Animated.ScrollView
            keyboardShouldPersistTaps='always'
            contentContainerStyle={{ paddingBottom: 24 }}
            layout={CurvedTransition}
          >
            <ProgressHeader
              image={provider.image}
              title={provider.title}
              hideProgressBar
              leftIconType={SvgXmlIconNames.arrowLeft}
              stepsCount={0}
              currentStep={0}
            />
            <BaseText style={styles.title} variant={BaseTextVariant.title}>
              {isWithdrawal ? t('screens.withdrawal.request-withdrawal') : t('screens.deposit.title')}
            </BaseText>
            <BaseText style={[styles.balance, hasExceedWallet && styles.error]} variant={BaseTextVariant.small}>
              {t('screens.withdrawal.wallet-balance', { balance: formatTwoDecimals(balance) })}
            </BaseText>
            {(isLoading || stepLoading) && hideTransaction ? (
              <ActivityIndicator size={'small'} color={theme.palette.graphite['900']} />
            ) : hideTransaction ? null : (
              <TransactionForm
                feeDescription={
                  isWithdrawal
                    ? t('screens.wallet.withdrawal-estimated-amount')
                    : t('screens.wallet.deposit-estimated-amount')
                }
                feeAmount={calculatedFee}
                limitsInfo={infoText}
                maxLimitError={maxLimit}
                pendigError={accountError || ''}
                showErrorAsInfo
                hideAnim={hideTransaction || isLoading || stepLoading}
                calculatedDecimalPlaces={calculatedAmountDecimalPlaces}
                amount={amount ? getCurrency(isWithdrawal ? 'USD' : selectedCurrency).text(amount) : ''}
                onAmoutChange={onAmountChange}
                placeholder={getCurrency(isWithdrawal ? 'USD' : selectedCurrency)?.text?.('0.00') || ''}
                hasCalculatedAmount={hasCalculatedAmount}
                isWithdrawal={isWithdrawal}
                calculatedValue={stepLoading ?? isLoading ? lastCalculatedValue.current : calculatedValue}
                selectedCurrency={selectedCurrency}
                onChevronPress={onChevronPress}
                hasDropDown={selectedPayment.currencies.length > 1}
              />
            )}
            <Animated.View layout={CurvedTransition} style={styles.accountDetails}>
              {guides}
              {!(isLoading || stepLoading) && hasWalletField && (
                <UploadPaymentDetails
                  onToggle={toggleUploadPayments}
                  active={uplaodPaymentIsActive}
                  onSubmit={makeDepositFn}
                  configId={selectedPayment.selectedP.paymentDetailsConfigId}
                />
              )}
              {!((isLoading || stepLoading) && hideTransaction) && hasAccountDetails && !uplaodPaymentIsActive && (
                <>
                  <BaseText style={styles.detailText} variant={BaseTextVariant.captionSemiBold}>
                    {t('screens.deposit.account-details')}
                  </BaseText>
                  <View style={styles.inputContainer}>{newComponents}</View>
                </>
              )}
            </Animated.View>
            <BaseText style={styles.secure} variant={BaseTextVariant.small}>
              {t('screens.common.fully-secured')}
            </BaseText>
          </Animated.ScrollView>
          <Animated.View style={{ marginBottom: 44 }} layout={CurvedTransition}>
            {isLoading || stepLoading ? (
              <ActivityIndicator size={'small'} color={theme.palette.graphite['900']} />
            ) : (
              !uplaodPaymentIsActive && (
                <BaseButton
                  style={styles.button}
                  disabled={isDisabled}
                  type={BaseButtonType.primary}
                  label={isWithdrawal ? t('screens.deposit.review-withdrawal') : t('screens.deposit.make-deposit')}
                  onPress={onMakeDeposit}
                />
              )
            )}
          </Animated.View>
          <BaseOptionList
            title={currentList.title}
            hasSearch={false}
            data={currentList.list}
            defaultSelected={currentList.default}
            onSelect={onSelectCurrency}
            ref={bottomSheetRef}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DepositAmountEntry;
