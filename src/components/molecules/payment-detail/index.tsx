import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useCommonStyles } from '@/hooks';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import AccordionItem from '../accordion-item';
import { useTranslation } from 'react-i18next';

interface Payment {
  name: string;
  status: Statuses;
  id: number;
  configId: number;
}

interface IPaymentDetail {
  payments: Payment[];
  provider: string;
  image: string | undefined;
  onPress(id: number, configId: number): void;
}

type Statuses = 'approved' | 'pending' | 'declined';
const statusOrder: Record<Statuses, number> = { approved: 0, pending: 1, declined: 2 };

const {
  buttons: { activeOpacity }
} = config;

const capitalizeWord = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
const PaymentDetail: React.FC<IPaymentDetail> = ({ payments = [], image = '', provider = '', onPress }) => {
  const isExpanded = useSharedValue(false);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const sortedPayments = useMemo(() => {
    if (!payments.length) return [];
    return payments.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.name?.localeCompare?.(b.name));
  }, [payments]);

  const hasPayments = useMemo(() => payments.length > 0, [payments]);

  const hasImage = useMemo(() => image.length > 0, []);

  const onPaymentPress = useCallback(() => (isExpanded.value = !isExpanded.value), []);

  const derivedRotate = useDerivedValue(() => withTiming(isExpanded.value ? 180 : 0, { duration: 350 }), []);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${derivedRotate.value}deg` }] }), []);

  const Payment = useCallback(
    ({ name, status, onPress, id, configId }: Payment & { onPress(id: number, configId: number): void }) => {
      const handleStatus = (s: Statuses) => {
        switch (s) {
          case 'approved':
            return { color: undefined, text: '' };
          case 'declined':
            return { color: theme.palette.red['600'], text: t('components.molecules.payment-detail.declined') };
          case 'pending':
            return { color: theme.palette.graphite['900'], text: t('components.molecules.payment-detail.pending') };
        }
      };

      const paymentData = handleStatus(status);
      const onAccountPress = () => onPress(id, configId);

      return (
        <TouchableOpacity activeOpacity={activeOpacity} onPress={onAccountPress} style={styles.paymentContainer}>
          <BaseText style={[styles.textAlignLeft, styles.flex]}>{name}</BaseText>
          <BaseText style={[styles.textAlignRight, { color: paymentData.color }]} variant={BaseTextVariant.small}>
            {capitalizeWord(paymentData.text)}
          </BaseText>
        </TouchableOpacity>
      );
    },
    [theme.dark, t]
  );

  return (
    <Pressable onPress={hasPayments ? onPaymentPress : undefined} style={styles.container}>
      <View style={styles.top}>
        <View style={styles.left}>
          {hasImage ? (
            <Image source={{ uri: image }} resizeMode='cover' style={styles.img} />
          ) : (
            <SvgIcon name={SvgXmlIconNames.bankCard} size={IconSize.lg} />
          )}
          <BaseText>{provider}</BaseText>
        </View>
        {hasPayments && (
          <Animated.View style={iconStyle}>
            <SvgIcon size={IconSize.sm} name={SvgXmlIconNames.chevronBottom} color={styles.grayColor.color} />
          </Animated.View>
        )}
      </View>
      {hasPayments && (
        <AccordionItem isExpanded={isExpanded}>
          {sortedPayments.map((item, index) => {
            return (
              <Payment
                configId={item.configId}
                key={`${item.name}-${item.status}-${index}-payment`}
                name={item.name}
                status={item.status}
                onPress={onPress}
                id={item.id}
              />
            );
          })}
        </AccordionItem>
      )}
    </Pressable>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: base.white,
      borderRadius: 12,
      marginHorizontal: 20,
      paddingVertical: 12,
      ...shadow6Style
    },
    grayColor: {
      color: '#8fa6ae'
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    paymentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: '100%',
      gap: 8
    },
    textAlignLeft: {
      textAlign: 'left'
    },
    textAlignRight: {
      textAlign: 'right'
    },
    flex: {
      flex: 1
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      marginRight: 42
    },
    img: {
      width: 24,
      height: 24,
      borderRadius: 13
    }
  });
};

export default memo(PaymentDetail);
