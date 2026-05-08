import React, {
  forwardRef,
  memo,
  ReactNode,
  RefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { StyleSheet, Modal, View, Pressable, ViewStyle, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { config, UserTheme, testIDs } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import LinearGradient from 'react-native-linear-gradient';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ORDER_TYPES } from '@/types';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_ROUTE_NAMES } from '@/navigation/app/stacks';

export type PositionModalStatus = 'success' | 'error';

export interface PositionModalRes {
  status: PositionModalStatus;
  direction: 'buy' | 'sell';
  orderType: ORDER_TYPES;
  margin: number | string;
  value: number | string;
  infoText: string;
  errorText: string;
}

export interface PositionModalRef {
  open(obj: Partial<PositionModalRes>): void;
  hide(): void;
}

interface IPositionModal {
  ref: RefObject<PositionModalRef>;
  positionRef: RefObject<BottomSheetModal | null>;
  onTryAgain?(): void;
}

const {
  headerBar: {
    buttons: { activeOpacity }
  }
} = config;

const PositionModal = forwardRef<PositionModalRef, IPositionModal>(({ positionRef, onTryAgain }, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [lastDataObj, setLastDataObj] = useState<Partial<PositionModalRes> | null>(null);
  const navigation = useNavigation<any>();

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const onClose = useCallback(() => setVisible(false), []);
  const onContentPress = useCallback(() => {}, []);

  const IconWrapper = ({
    status,
    children,
    style,
    isIcon = true
  }: {
    isIcon?: boolean;
    status: PositionModalStatus;
    children: ReactNode;
    style: ViewStyle;
  }) => {
    if (status === 'success') {
      return (
        <LinearGradient
          colors={['#2ECC71', '#27AE60']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={isIcon ? styles.linear : style}
        >
          <View style={isIcon && style}>{children}</View>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.linear, styles.redBg]}>
        <View style={style}>{children}</View>
      </View>
    );
  };

  const Row = ({
    text,
    hasSeparator = false,
    value,
    testID
  }: {
    text: string;
    value: string | number;
    hasSeparator?: boolean;
    testID?: string;
  }) => {
    return (
      <>
        {hasSeparator && <View style={styles.rowSeparator} />}
        <View
          style={styles.row}
          testID={testID}
          accessibilityValue={{ text: testID }}
          accessibilityLabel={testID}
          accessible={true}
        >
          <BaseText style={styles.rowStyle} variant={BaseTextVariant.extraSmall}>
            {text}
          </BaseText>
          <BaseText variant={hasSeparator ? BaseTextVariant.smallSpace : BaseTextVariant.small}>{value}</BaseText>
        </View>
      </>
    );
  };

  const content = useMemo(() => {
    switch (lastDataObj?.status) {
      case 'success':
        const isBuy = lastDataObj.direction === 'buy';
        const successTitle =
          lastDataObj.orderType === 'market_order'
            ? t('components.templates.position-modal.position-opened')
            : t('components.templates.position-modal.pending-opened');

        return (
          <View
            testID={testIDs.components.templates.app?.pulse?.positionModal?.successContent}
            accessibilityValue={{ text: testIDs.components.templates.app?.pulse?.positionModal?.successContent }}
            accessibilityLabel={testIDs.components.templates.app?.pulse?.positionModal?.successContent}
            accessible={true}
          >
            <View style={styles.head}>
              <IconWrapper style={styles.iconContainer} status='success'>
                <SvgIcon name={SvgXmlIconNames.check} size={IconSize.sm} color={theme.palette.base.white} />
              </IconWrapper>
              <BaseText variant={BaseTextVariant.pageTitle}>{successTitle}</BaseText>
            </View>
            <View style={styles.infoSuccessText}>
              <BaseText variant={BaseTextVariant.smallRegular}>{lastDataObj?.infoText || ''}</BaseText>
              <SvgIcon
                style={!isBuy && styles.rotate}
                name={SvgXmlIconNames.triangle}
                size={{ width: 8.17, height: 7 }}
                color={isBuy ? '#1DBF73' : '#F6465D'}
              />
            </View>
            <View style={styles.rows}>
              <Row
                text={t('components.templates.position-modal.order-type')}
                value={
                  lastDataObj?.orderType === 'market_order'
                    ? t('components.templates.position-modal.market-order')
                    : t('components.templates.position-modal.pending-order')
                }
                testID={testIDs.components.templates.app?.pulse?.positionModal?.orderType}
              />
              {!!lastDataObj?.value && (
                <Row
                  text={t('components.templates.position-modal.position-value')}
                  hasSeparator
                  value={lastDataObj.value}
                  testID={testIDs.components.templates.app?.pulse?.positionModal?.positionValue}
                />
              )}
              {!!lastDataObj?.margin && (
                <Row
                  text={t('components.templates.position-modal.margin')}
                  hasSeparator
                  value={lastDataObj.margin}
                  testID={testIDs.components.templates.app?.pulse?.positionModal?.margin}
                />
              )}
            </View>
            <View style={styles.successButtonsContainer}>
              <IconWrapper isIcon={false} status='success' style={styles.portfolioWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    setVisible(false);
                    requestAnimationFrame(() =>
                      navigation.navigate(APP_ROUTE_NAMES.Portfolio, {
                        screen: PORTFOLIO_ROUTE_NAMES.Portfolio
                      })
                    );
                  }}
                  activeOpacity={activeOpacity}
                  style={styles.portfolioBtn}
                  testID={testIDs.components.templates.app?.pulse?.positionModal?.goToPortfolio}
                  accessibilityValue={{ text: testIDs.components.templates.app?.pulse?.positionModal?.goToPortfolio }}
                  accessibilityLabel={testIDs.components.templates.app?.pulse?.positionModal?.goToPortfolio}
                  accessible={true}
                >
                  <BaseText style={styles.tryAgainText}>
                    {t('components.templates.position-modal.go-to-portfolio')}
                  </BaseText>
                </TouchableOpacity>
              </IconWrapper>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={activeOpacity}
                style={styles.secondButton}
                testID={testIDs.components.templates.app?.pulse?.positionModal?.continueTrading}
                accessibilityValue={{ text: testIDs.components.templates.app?.pulse?.positionModal?.continueTrading }}
                accessibilityLabel={testIDs.components.templates.app?.pulse?.positionModal?.continueTrading}
                accessible={true}
              >
                <BaseText>{t('components.templates.position-modal.continue-trading')}</BaseText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'error':
        const errorTitle =
          lastDataObj.orderType === 'market_order'
            ? t('components.templates.position-modal.position-not-opened')
            : t('components.templates.position-modal.pending-not-opened');

        return (
          <View
            testID={testIDs.components.templates.app?.pulse?.positionModal?.errorContent}
            accessibilityValue={{ text: testIDs.components.templates.app?.pulse?.positionModal?.errorContent }}
            accessibilityLabel={testIDs.components.templates.app?.pulse?.positionModal?.errorContent}
            accessible={true}
          >
            <View style={styles.head}>
              <IconWrapper style={styles.iconContainer} status='error'>
                <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={theme.palette.base.white} />
              </IconWrapper>
              <BaseText variant={BaseTextVariant.pageTitle}>{errorTitle}</BaseText>
            </View>
            <BaseText style={styles.errorInfoText} variant={BaseTextVariant.smallRegular}>
              {lastDataObj?.infoText || t('components.templates.position-modal.went-wrong')}
            </BaseText>
            <BaseText style={styles.errorText} variant={BaseTextVariant.smallRegular}>
              {lastDataObj?.errorText || t('components.templates.position-modal.try-again-info')}
            </BaseText>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  if (onTryAgain) onTryAgain();
                  else requestAnimationFrame(() => positionRef.current?.present());
                }}
                activeOpacity={activeOpacity}
                style={styles.tryAgainBtn}
              >
                <BaseText style={styles.tryAgainText}>{t('components.templates.position-modal.try-again')}</BaseText>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} activeOpacity={activeOpacity} style={styles.secondButton}>
                <BaseText style={styles.goBackText}>{t('components.templates.position-modal.go-back')}</BaseText>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  }, [lastDataObj, theme.dark, t, onClose, navigation]);

  useImperativeHandle(
    ref,
    () => ({
      open: (obj) => {
        setLastDataObj(obj);
        requestAnimationFrame(() => setVisible(true));
      },
      hide: () => setVisible(false)
    }),
    []
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType='fade'
      testID={testIDs.components.templates.app?.pulse?.positionModal?.modal}
      accessibilityValue={{ text: testIDs.components.templates.app?.pulse?.positionModal?.modal }}
      accessibilityLabel={testIDs.components.templates.app?.pulse?.positionModal?.modal}
      accessible={true}
    >
      <Pressable onPress={onClose} android_disableSound style={styles.layer}>
        <Pressable android_disableSound onPress={onContentPress} style={styles.contentContainer}>
          <TouchableOpacity style={styles.closeContainer} onPress={onClose} activeOpacity={activeOpacity} hitSlop={12}>
            <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} />
          </TouchableOpacity>
          {content}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create({
    layer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center'
    },
    contentContainer: {
      backgroundColor: '#F2F2F7',
      marginHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 20,
      paddingHorizontal: 31,
      borderRadius: 12
    },
    redBg: {
      backgroundColor: '#F6465D'
    },
    closeContainer: {
      alignItems: 'flex-end',
      alignSelf: 'flex-end'
    },
    linear: {
      borderRadius: 14,
      height: 26,
      width: 26,
      overflow: 'hidden'
    },
    iconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 19
    },
    errorInfoText: {
      marginTop: 7,
      marginLeft: 45
    },
    errorText: {
      marginTop: 20,
      marginLeft: 45
    },
    buttonsContainer: {
      marginTop: 71,
      gap: 10
    },
    tryAgainBtn: {
      minHeight: 42,
      borderRadius: 8,
      backgroundColor: '#8050F1',
      alignItems: 'center',
      justifyContent: 'center'
    },
    secondButton: {
      minHeight: 42,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    goBackText: { color: '#58616C' },
    tryAgainText: { color: base.white },
    infoSuccessText: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 7,
      marginLeft: 45
    },
    rotate: {
      transform: [{ rotate: '180deg' }]
    },
    successButtonsContainer: {
      marginTop: 48,
      gap: 10
    },
    portfolioBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 42
    },
    portfolioWrapper: {
      borderRadius: 8,
      overflow: 'hidden'
    },
    rows: {
      paddingHorizontal: 20,
      paddingVertical: 4,
      backgroundColor: base.white,
      borderRadius: 14,
      marginTop: 30
    },
    row: {
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    rowSeparator: { width: '100%', height: 0.5, backgroundColor: '#D9DDE5' },
    rowStyle: { color: '#58616C' }
  });

export default memo(PositionModal);
