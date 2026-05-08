import React, { createRef, RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ViewStyle, View, Text, TouchableOpacity, Keyboard } from 'react-native';
import { useIsFocused, useNavigation, useTheme } from '@react-navigation/native';
import { UserTheme, config, websocketUrls, testIDs } from '@/constants';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseFormField,
  BaseSwitch,
  BaseText,
  BaseTextVariant
} from '@/components';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { WS, formatTwoDecimals, jsonParse, debouncedState } from '@/helpers';
import dateHelper from '@/helpers/dateHelper';
import { SymbolConfig } from '@/store/slices/portfolio/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { actions } from '@/store';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';

interface BaseMessageProps {
  openPrice: number;
  volume: number;
  contractSize: number;
  action: number;
  onSubmit: (stopLoss: number, takeProfit: number, price?: string, date?: Date | null) => void;
  getLimits: (price: number) => { takeProfit: number; stopLoss: number };
  stopLossValue: number | undefined;
  takeProfitValue: number | undefined;
  isPosition: boolean;
  timeExpiration: string | number | undefined;
  navigation: any;
  title: string;
  isVisible: boolean;
  stopLevel: number;
  symbolConfigsData?: SymbolConfig;
  profitSymbol: string | undefined;
  profitSymbolDirect: boolean | undefined;
  averagePrice: number;
  sheetRef: RefObject<BottomSheetModalMethods>;
}

const {
  validation: { floatRegex },
  buttons: { activeOpacity }
} = config;

const {
  portfolio: { setLastValues, setLastErrors }
} = actions;

let timeout: NodeJS.Timeout;

const websocket = new WS();
let canUpdate: boolean = true;
let updateTimeout: ReturnType<typeof setTimeout> | undefined;

const EditPosition = ({
  openPrice,
  volume,
  contractSize,
  action,
  onSubmit,
  stopLossValue,
  takeProfitValue,
  isPosition = true,
  getLimits,
  title,
  isVisible,
  symbolConfigsData,
  profitSymbol,
  profitSymbolDirect,
  averagePrice,
  sheetRef
}: BaseMessageProps) => {
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  const theme = useTheme();
  const styles = useStyles(theme);

  const lastValues = useAppSelector((store) => store.portfolio.lastValues);
  const lastErrors = useAppSelector((store) => store.portfolio.lastErrors);

  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
    setError,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      isStopEnabled: !!stopLossValue,
      isTakeEnabled: !!takeProfitValue,
      stopLoss: '',
      takeProfit: '',
      buyWhen: '',
      isPosition: !isPosition
    }
  });

  const { isStopEnabled, isTakeEnabled, stopLoss, takeProfit, buyWhen } = watch();

  const limits = getLimits(Number(buyWhen));

  useEffect(() => {
    if ((stopLossValue || isVisible) && !lastValues) {
      setValue('stopLoss', stopLossValue ? `${stopLossValue}` : '');
      setValue('isStopEnabled', !!stopLossValue);
    }
  }, [stopLossValue, isVisible, lastValues]);

  useEffect(() => {
    if ((takeProfitValue || isVisible) && !lastValues) {
      setValue('takeProfit', takeProfitValue ? `${takeProfitValue}` : '');
      setValue('isTakeEnabled', !!takeProfitValue);
    }
  }, [takeProfitValue, isVisible, lastValues]);

  useEffect(() => {
    if (!lastValues) {
      if (!isPosition && (openPrice || isVisible)) {
        setValue('buyWhen', openPrice ? `${openPrice}` : '', { shouldValidate: true });
      }
    }
  }, [openPrice, isVisible, lastValues]);

  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0);

  const onConfirmHandler = async (data: {
    isStopEnabled: boolean;
    isTakeEnabled: boolean;
    stopLoss: string;
    takeProfit: string;
    buyWhen: string;
    isPosition: boolean;
  }) => {
    if (!data) {
      return;
    }

    if (isPosition) onSubmit(data.stopLoss as never as number, data.takeProfit as never as number);
    else onSubmit(data.stopLoss as never as number, data.takeProfit as never as number, data.buyWhen, selectedDate);
  };

  const isBuy = useMemo(() => action % 2 === 0, [action]);

  const calculatePnL = useCallback(
    (targetPrice: number) => {
      const num = isPosition ? openPrice : Number(buyWhen);
      const diff = action !== 0 ? num - targetPrice : targetPrice - num;
      const pnl = diff * volume * contractSize;

      if (profitSymbol && averagePrice) {
        return (profitSymbolDirect ? pnl * averagePrice : pnl / averagePrice).toFixed(2);
      }

      return pnl.toFixed(2);
    },
    [action, volume, contractSize, openPrice, buyWhen, isPosition, profitSymbol, averagePrice, profitSymbolDirect]
  );

  useEffect(() => {
    !lastValues && trigger('stopLoss');
  }, [limits.stopLoss, lastValues]);

  useEffect(() => {
    !lastValues && trigger('takeProfit');
  }, [limits.takeProfit, lastValues]);

  useEffect(() => {
    if (!lastValues) {
      if (isStopEnabled) {
        if (stopLossValue) {
          setValue('stopLoss', `${stopLossValue}`);
        }
      } else {
        setValue('stopLoss', '', { shouldValidate: true });
      }
    }
  }, [isStopEnabled, lastValues]);

  useEffect(() => {
    if (!lastValues) {
      if (isTakeEnabled) {
        if (takeProfitValue) {
          setValue('takeProfit', `${takeProfitValue}`);
        }
      } else {
        setValue('takeProfit', '', { shouldValidate: true });
      }
    }
  }, [isTakeEnabled, lastValues]);

  const onDatePress = useCallback(() => {
    const keyboardIsOpen = Keyboard.isVisible();
    const timeout = keyboardIsOpen ? 250 : 0;
    Keyboard.dismiss();
    const values = getValues();
    dispatch(setLastValues(values));
    dispatch(setLastErrors(errors));
    setTimeout(() => {
      sheetRef.current?.dismiss?.();
      setTimeout(() => {
        //@ts-ignore
        navigation.navigate(ROOT_ROUTE_NAMES.SelectDate, {
          date: selectedDate,
          onSubmit: (d: Date) => {
            sheetRef.current?.present?.();
            if (values) {
              setTimeout(() => {
                dispatch(setLastValues({ ...values, date: `${d}` }));
                setSelectedDate(d);
              }, 200);
            }
          }
        });
      }, 200);
    }, timeout);
  }, [navigation, selectedDate, lastValues]);

  const pageIsFocused = useIsFocused();

  useEffect(() => {
    if (lastValues) {
      reset(lastValues);
      for (const i in lastErrors) {
        const value = lastErrors[i];
        setError(i as 'stopLoss' | 'takeProfit' | 'buyWhen' | 'isStopEnabled' | 'isTakeEnabled' | 'isPosition', value);
      }
      lastValues?.['date'] && setSelectedDate(lastValues?.['date']);
    }
  }, [lastValues, lastErrors]);

  useEffect(() => {
    if (isVisible && pageIsFocused) makeSocketConnection();
    else closeSocketConnection();

    return closeSocketConnection;
  }, [isVisible, pageIsFocused]);

  const onSocketClosed = useCallback(() => {
    if (!isVisible || !pageIsFocused) {
      return closeSocketConnection();
    }
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (isVisible && pageIsFocused) {
        makeSocketConnection();
      }
    }, 1500);
  }, [isVisible, timeout, pageIsFocused]);

  const onSocketOpened = useCallback(() => {
    if (!isVisible) {
      return closeSocketConnection();
    }

    websocket.send(`unsubscribe ALL`);

    let temp: number | undefined;
    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const data = jsonParse(event?.data);
      if (!data) {
        return;
      }

      const { ask, bid, symbol: dataSymbol } = data || {};
      if (ask === undefined || bid === undefined || dataSymbol === undefined) {
        return;
      }

      if (dataSymbol === title) {
        if (!canUpdate) {
          temp = action ? ask : bid;
          return;
        }

        temp = undefined;

        canUpdate = false;

        updateTimeout && clearTimeout(updateTimeout);

        updateTimeout = setTimeout(() => {
          canUpdate = true;
          if (temp !== undefined) {
            setTick(temp);
            temp = undefined;
          }
        }, 1000);

        if (action) setTick(ask);
        else setTick(bid);
      }
    });

    websocket.send(`subscribe ${title}`);
  }, [isVisible, action, title, tick]);

  const makeSocketConnection = useCallback(() => {
    websocket.init(websocketUrls.tickersPrices, onSocketOpened, onSocketClosed, onSocketClosed);
  }, [onSocketOpened, onSocketClosed]);

  const closeSocketConnection = useCallback(() => {
    timeout && clearTimeout(timeout);
    websocket.close();
  }, [timeout]);

  const disableConfirm = () => {
    const SL_TP_CHANGED = `${takeProfitValue || ''}` === takeProfit && stopLoss === `${stopLossValue || ''}`;
    if (isPosition) {
      return isStopEnabled || isTakeEnabled ? Boolean(isFormErrors) || SL_TP_CHANGED : SL_TP_CHANGED;
    }
    return Boolean(isFormErrors) || (SL_TP_CHANGED && buyWhen === `${openPrice || ''}`);
  };

  const handleDebouncedChange = debouncedState();

  const handleInputChange = (
    fieldName: string,
    value: string,
    onChange: (val: string) => void,
  ) => {
    onChange(value.replace(',', '.'));
    handleDebouncedChange(fieldName, value, onChange, symbolConfigsData?.digits);
  };

  return (
    <View style={styles.layout}>
      <View style={styles.container}>
        <BaseText variant={BaseTextVariant.title}>
          {isPosition ? t('screens.portfolio.edit-position') : 'Edit order'}
        </BaseText>
        <View>
          {isPosition || (
            <Controller
              name='buyWhen'
              control={control}
              rules={{
                validate: {
                  required: (value) => {
                    if (!value && !isPosition) return t('screens.portfolio.required');
                    return true;
                  }
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View style={styles.buyWhenContainer}>
                    <BaseText variant={BaseTextVariant.caption}>
                      {isBuy ? t('screens.portfolio.buy-when') : t('screens.portfolio.sell-when')}
                    </BaseText>
                  </View>
                  <BaseFormField
                    inputContainerStyle={styles.formField}
                    keyboardType='numeric'
                    returnKeyType={'next'}
                    error={errors.buyWhen?.message}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value}
                    title={t('screens.portfolio.price')}
                    testID={testIDs.portfolio.positionInfo.buySellWhenPrice}
                    accessibilityValue={{
                      text: testIDs.portfolio.positionInfo.buySellWhenPrice
                    }}
                    accessibilityLabel={testIDs.portfolio.positionInfo.buySellWhenPrice}
                    accessible={true}
                    isBottomSheet
                  />
                  <View style={styles.bottom}>
                    <BaseText variant={BaseTextVariant.small}>
                      <Text style={{ color: '#8fa6ae' }}>{t('screens.portfolio.valid-till')}:</Text>
                    </BaseText>
                    <View style={styles.validContainer}>
                      <TouchableOpacity hitSlop={8} activeOpacity={activeOpacity} onPress={onDatePress}>
                        <BaseText style={{ color: theme.palette.purple[800] }}>
                          {selectedDate === null
                            ? t('screens.portfolio.add-date')
                            : dateHelper.to(selectedDate, 'HH:mm, DD/MM/YYYY')}
                        </BaseText>
                      </TouchableOpacity>
                      {selectedDate !== null && (
                        <TouchableOpacity
                          style={styles.icon}
                          hitSlop={8}
                          activeOpacity={activeOpacity}
                          onPress={() => setSelectedDate(null)}
                        >
                          <SvgIcon
                            color={theme.palette.purple[800]}
                            name={SvgXmlIconNames.closePurple}
                            size={IconSize.xxs}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            />
          )}
          <Controller
            name='isStopEnabled'
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.row}>
                <BaseText variant={BaseTextVariant.caption}>{t('screens.portfolio.stop-loss')}</BaseText>
                <BaseSwitch value={value} onChange={onChange} />
              </View>
            )}
          />
          {isStopEnabled && (
            <>
              <Controller
                name='stopLoss'
                control={control}
                rules={{
                  validate: {
                    required: (value) => {
                      if (!isPosition) return true;
                      if (!value && getValues('isStopEnabled')) return t('screens.portfolio.required');
                      return true;
                    },
                    greaterThanMinimum: (value) => {
                      if (action === 0) {
                        if (parseFloat(value) > limits.stopLoss) {
                          return t('screens.portfolio.max-validation', {
                            max: formatTwoDecimals(limits.stopLoss?.toFixed(symbolConfigsData?.digits))
                          });
                        }
                      } else {
                        if (parseFloat(value) < limits.stopLoss) {
                          return t('screens.portfolio.min-validation', {
                            min: formatTwoDecimals(limits.stopLoss?.toFixed(symbolConfigsData?.digits))
                          });
                        }
                      }
                      return true;
                    },
                    validFloat: (value) => {
                      const normalizedValue = value.replace(',', '.');
                      if (!floatRegex.test(normalizedValue)) {
                        return t('errors.invalidFloat');
                      }
                      return true;
                    }
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <BaseFormField
                    keyboardType={'numeric'}
                    inputContainerStyle={styles.formField}
                    returnKeyType={'next'}
                    error={errors.stopLoss?.message}
                    onBlur={onBlur}
                    onChange={(val: any) => {
                      handleInputChange('stopLoss', val, onChange)
                    }}
                    value={value}
                    title={t('screens.portfolio.price')}
                    testID={testIDs.portfolio.positionInfo.stopLossPrice}
                    accessibilityValue={{
                      text: testIDs.portfolio.positionInfo.stopLossPrice
                    }}
                    accessibilityLabel={testIDs.portfolio.positionInfo.stopLossPrice}
                    accessible={true}
                    isBottomSheet
                  />
                )}
              />
              {stopLoss && !errors.stopLoss && (
                <BaseText style={styles.margin} variant={BaseTextVariant.small}>
                  <Text style={{ color: '#8fa6ae' }}>PnL, $:</Text> {calculatePnL(Number(stopLoss))}
                </BaseText>
              )}
            </>
          )}
          <Controller
            name='isTakeEnabled'
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.row}>
                <BaseText variant={BaseTextVariant.caption}>{t('screens.portfolio.take-profit')}</BaseText>
                <BaseSwitch value={value} onChange={onChange} />
              </View>
            )}
          />
          {isTakeEnabled && (
            <>
              <Controller
                name='takeProfit'
                control={control}
                rules={{
                  validate: {
                    required: (value) => {
                      if (!isPosition) return true;
                      if (!value && getValues('isTakeEnabled')) return t('screens.portfolio.required');
                      return true;
                    },
                    greaterThanMinimum: (value) => {
                      if (action === 0) {
                        if (parseFloat(value) < limits.takeProfit) {
                          return t('screens.portfolio.min-validation', {
                            min: formatTwoDecimals(limits.takeProfit?.toFixed(symbolConfigsData?.digits))
                          });
                        }
                      } else {
                        if (parseFloat(value) > limits.takeProfit) {
                          return t('screens.portfolio.max-validation', {
                            max: formatTwoDecimals(limits.takeProfit?.toFixed(symbolConfigsData?.digits))
                          });
                        }
                      }
                      return true;
                    },
                    validFloat: (value) => {
                      const normalizedValue = value.replace(',', '.');
                      if (!floatRegex.test(normalizedValue)) {
                        return t('errors.invalidFloat');
                      }
                      return true;
                    }
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <BaseFormField
                    keyboardType={'numeric'}
                    inputContainerStyle={styles.formField}
                    returnKeyType={'next'}
                    error={errors.takeProfit?.message}
                    onBlur={onBlur}
                    onChange={(val: any) => {
                      handleInputChange('takeProfit', val, onChange)
                    }}
                    value={value}
                    title={t('screens.portfolio.price')}
                    testID={testIDs.portfolio.positionInfo.takeProfitPrice}
                    accessibilityValue={{
                      text: testIDs.portfolio.positionInfo.takeProfitPrice
                    }}
                    accessibilityLabel={testIDs.portfolio.positionInfo.takeProfitPrice}
                    accessible={true}
                    isBottomSheet
                  />
                )}
              />
              {takeProfit && !errors.takeProfit && (
                <BaseText style={styles.margin} variant={BaseTextVariant.small}>
                  <Text style={{ color: '#8fa6ae' }}>{t('screens.portfolio.pnl')}:</Text>{' '}
                  {calculatePnL(Number(takeProfit))}
                </BaseText>
              )}
            </>
          )}
        </View>
        <BaseButton
          disabled={disableConfirm()}
          type={BaseButtonType.primary}
          style={styles.button}
          size={BaseButtonSize.large}
          onPress={handleSubmit(onConfirmHandler)}
          label={t('screens.portfolio.confirm')}
        />
      </View>
    </View>
  );
};

interface Styles {
  layout: ViewStyle;
  container: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  row: ViewStyle;
  button: ViewStyle;
  formField: ViewStyle;
  buyWhenContainer: ViewStyle;
  bottom: ViewStyle;
  validContainer: ViewStyle;
  margin: ViewStyle;
  icon: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    layout: {
      flex: 1
    },
    container: {
      paddingTop: 20,
      paddingBottom: 24,
      paddingHorizontal: 20,
      justifyContent: 'space-between'
    },
    keyboardContainer: {
      flex: 1,
      flexGrow: 1
    },
    keyboardContent: {
      flex: 1,
      flexGrow: 1
    },
    formField: {
      ...shadow6Style
    },
    row: {
      marginTop: 30,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    button: {
      marginBottom: 0,
      marginTop: 32
    },
    buyWhenContainer: {
      marginTop: 30,
      marginBottom: 20
    },
    bottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 12,
      paddingLeft: 16
    },
    validContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    margin: {
      marginLeft: 16
    },
    icon: {
      top: 1
    }
  });
};

export default EditPosition;
