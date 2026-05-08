import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseButton, BaseButtonType, BaseInput, BaseText, BaseTextVariant } from '@/components';
import { useUploadMutation } from '@/store/api';
import { t } from 'i18next';

interface IUploadPaymentDetails {
  configId: number;
  onSubmit(): void;
  active: boolean;
  onToggle(): void;
}

const UploadPaymentDetails: React.FC<IUploadPaymentDetails> = ({ configId, onSubmit, active, onToggle }) => {
  const [name, setName] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [uplaod, { isLoading }] = useUploadMutation();

  const theme = useTheme();
  const styles = useStyles(theme);


  const onUpload = useCallback(async () => {
    try {
      const phone = value.startsWith('+') ? value : `+${value}`;

      await uplaod({
        data: [
          { key: 'phone_number', value: phone.trim() },
          { key: 'wallet', value: name.trim() }
        ],
        configId
      }).unwrap();
      onSubmit && onSubmit();
    } catch (error: any) {
      const field = error?.data?.errors?.children?.data?.errors?.[0];
      if (field) {
        const cleaned = field.split(/:(.+)/)[1].trim();
        setError(cleaned);
      }
    }
  }, [configId, value, name]);

  const isDisabled = useMemo(() => {
    return isLoading || !value.trim().length || !name.trim().length || value === '+';
  }, [value, isLoading, name]);

  const onChange = useCallback(
    (val: string) => {
      val = `${val.replaceAll(',', '').replaceAll('.', '')}`;
      if (error?.length > 0) setError('');

      setValue(val);
    },
    [error]
  );

  const handlePhoneValue = useMemo(() => {
    if (!value.startsWith('+')) return `+${value.replace(/[^0-9]/g, '')}`;

    if (value === '') return '+';
    return value;
  }, [value])

  return (
    <View style={styles.container}>
      <BaseButton
        style={styles.uploadBtn}
        type={BaseButtonType.primary}
        label={active ? t('screens.deposit.cancel') : t('screens.deposit.upload-payment-details')}
        onPress={onToggle}
      />
      {active && (
        <View style={styles.activeContainer}>
          <BaseInput
            title={t('screens.deposit.name')}
            hideClearButton
            required={true}
            value={name || ''}
            inputContainerStyle={{ flex: 1 }}
            error={!!error.length}
            onChange={setName}
          />
          <View style={styles.inputContainer}>
            <BaseInput
              keyboardType='number-pad'
              title={t('screens.deposit.phone')}
              hideClearButton
              required={true}
              value={handlePhoneValue}
              inputContainerStyle={{ flex: 1 }}
              error={!!error.length}
              onChange={onChange}
            />
            <BaseButton
              style={styles.submit}
              disabled={isDisabled}
              loading={isLoading}
              type={BaseButtonType.primary}
              label={t('screens.deposit.submit')}
              onPress={onUpload}
            />
          </View>
          <BaseText style={styles.infoText} variant={BaseTextVariant.small}>
            {t('screens.deposit.include-country-code')}
          </BaseText>
          {!!error?.length && (
            <BaseText variant={BaseTextVariant.small} style={styles.errorText}>
              {error}
            </BaseText>
          )}
        </View>
      )}
    </View>
  );
};

const useStyles = ({ palette: { text } }: UserTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 10,
      gap: 10
    },
    uploadBtn: {
      alignSelf: 'flex-start',
      marginLeft: 16
    },
    errorText: {
      color: text.status.negative
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1
    },
    submit: {
      height: 44
    },
    activeContainer: {
      paddingHorizontal: 16,
      gap: 10
    },
    infoText: {
      color: text.base.tertiary
    }
  });

export default memo(UploadPaymentDetails);
