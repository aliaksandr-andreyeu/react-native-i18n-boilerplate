import React, { memo, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant, SheetBackdrop } from '@/components';
import { PulseSections } from '../../pulse-ai/screen';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface IPopUp {
  iconSize: { width: number; height: number };
  icon: SvgXmlIconNames;
  color: string;
  title: string;
  bottomInfo: string;
  descTitle: string;
  desc: string;
  type: PulseSections;
}

const PopUp: React.FC<IPopUp> = ({ bottomInfo, color, desc, descTitle, icon, iconSize, title, type }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);
  const onOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const contents = useMemo(
    (): Record<PulseSections, React.ReactElement> => ({
      [PulseSections.PERFORMERS]: (
        <>
          <View style={[styles.rule, styles.buyContainer]}>
            <SvgIcon style={styles.top} name={SvgXmlIconNames.triangle} size={IconSize.xxs} color={'#1DBF73'} />
            <BaseText
              style={[styles.lineHeight, styles.blackColor]}
              variant={BaseTextVariant.extraSmall}
              textBreakStrategy='balanced'
            >
              <BaseText style={[styles.lineHeight, styles.greenText]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.buy')}
                <BaseText variant={BaseTextVariant.extraSmall}>{' /  '}</BaseText>
              </BaseText>
              <SvgIcon
                style={[styles.top, styles.rotate]}
                name={SvgXmlIconNames.triangle}
                size={IconSize.xxs}
                color={'#F6465D'}
              />
              {'  '}
              <BaseText style={[styles.lineHeight, styles.redColor]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.sell')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.sell-desc')}
            </BaseText>
          </View>
          <View style={styles.rule}>
            <View style={[styles.greenBall, styles.top]} />
            <BaseText variant={BaseTextVariant.extraSmall} style={[styles.lineHeight, styles.blackColor]}>
              <BaseText style={[styles.greenText, styles.lineHeight]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.profit-target')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.profit-target-desc')}
            </BaseText>
          </View>
          <View style={styles.rule}>
            <SvgIcon
              style={styles.top}
              name={SvgXmlIconNames.smallClock}
              size={IconSize.xxs}
              color={theme.palette.text.title.hint}
            />
            <BaseText style={[styles.lineHeight, styles.blackColor]} variant={BaseTextVariant.extraSmall}>
              <BaseText style={[styles.lineHeight, styles.blackColor]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.expires-in')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.expires-in-desc')}
            </BaseText>
          </View>
        </>
      ),
      [PulseSections.SIGNALS]: (
        <>
          <View style={[styles.rule, styles.buyContainer]}>
            <SvgIcon style={styles.top} name={SvgXmlIconNames.triangle} size={IconSize.xxs} color={'#1DBF73'} />
            <BaseText
              style={[styles.lineHeight, styles.blackColor]}
              variant={BaseTextVariant.extraSmall}
              textBreakStrategy='balanced'
            >
              <BaseText style={[styles.lineHeight, styles.greenText]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.buy')}
                <BaseText variant={BaseTextVariant.extraSmall}>{' /  '}</BaseText>
              </BaseText>
              <SvgIcon
                style={[styles.top, styles.rotate]}
                name={SvgXmlIconNames.triangle}
                size={IconSize.xxs}
                color={'#F6465D'}
              />
              {'  '}
              <BaseText style={[styles.lineHeight, styles.redColor]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.sell')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.sell-desc-signals')}
            </BaseText>
          </View>
          <View style={styles.rule}>
            <View style={[styles.greyBall, styles.top]} />
            <BaseText variant={BaseTextVariant.extraSmall} style={[styles.lineHeight, styles.blackColor]}>
              <BaseText style={[styles.greyColor, styles.lineHeight]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.rewards-risk')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.rewards-risk-desc')}
            </BaseText>
          </View>
        </>
      ),
      [PulseSections.TRADES]: (
        <>
          <View style={[styles.rule, styles.gap0]}>
            <View style={styles.buyContainer}>
              <SvgIcon style={styles.top} name={SvgXmlIconNames.arrowInCircle} size={IconSize.xxs} color={'#1DBF73'} />
              <BaseText style={[styles.lineHeight, styles.greenText]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.buy')}
                <BaseText variant={BaseTextVariant.extraSmall}>{' /  '}</BaseText>
              </BaseText>
            </View>
            <View style={styles.sellContainer}>
              <SvgIcon
                style={[styles.top, styles.rotate]}
                name={SvgXmlIconNames.arrowInCircle}
                size={IconSize.xxs}
                color={'#F6465D'}
              />
              <BaseText
                textBreakStrategy='balanced'
                style={[styles.lineHeight, styles.blackColor]}
                variant={BaseTextVariant.extraSmall}
              >
                <BaseText style={[styles.lineHeight, styles.redColor]} variant={BaseTextVariant.extraSmallSemiBold}>
                  {t('screens.pulse.popup.sell')}
                </BaseText>
                {' - '}
                {t('screens.pulse.popup.buy-sell-desc')}
              </BaseText>
            </View>
          </View>
          <View style={styles.rule}>
            <View style={[styles.greyBall, styles.top]} />
            <BaseText style={[styles.lineHeight, styles.blackColor]} variant={BaseTextVariant.extraSmall}>
              <BaseText style={[styles.lineHeight, styles.greyColor]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.time-ago')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.time-ago-desc')}
            </BaseText>
          </View>
          <View style={styles.rule}>
            <SvgIcon
              style={styles.top}
              name={SvgXmlIconNames.recentTrades}
              size={{ width: 12, height: 11 }}
              color='#1DBF73'
            />
            <BaseText style={[styles.lineHeight, styles.blackColor]} variant={BaseTextVariant.extraSmall}>
              <BaseText style={[styles.lineHeight, styles.greenText]} variant={BaseTextVariant.extraSmallSemiBold}>
                {t('screens.pulse.popup.copy')}
              </BaseText>
              {' - '}
              {t('screens.pulse.popup.copy-desc')}
            </BaseText>
          </View>
        </>
      )
    }),
    [t, theme.dark]
  );

  const modalContent = useMemo(() => {
    return (
      <View>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
              <SvgIcon name={icon} color={theme.palette.base.white} size={iconSize} />
            </View>
            <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>
          </View>
          <TouchableOpacity style={styles.iconStyle} onPress={onClose} hitSlop={10} activeOpacity={activeOpacity}>
            <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={theme.palette.text.base.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.sectionInfo}>
          <View style={styles.gap4}>
            <BaseText style={styles.blackColor} variant={BaseTextVariant.extraSmallSemiBold}>
              {descTitle}
            </BaseText>
            <BaseText style={styles.blackColor} variant={BaseTextVariant.extraSmall}>
              {desc}
            </BaseText>
          </View>
          <View style={styles.sectionRules}>{contents[type]}</View>
          <View style={styles.bottomInfo}>
            <BaseText variant={BaseTextVariant.prefixSans} style={styles.warningText}>
              {bottomInfo}
            </BaseText>
            <BaseText variant={BaseTextVariant.prefixSans} style={styles.blackColor}>
              {t('screens.pulse.popup.bottom-info')}
            </BaseText>
          </View>
        </View>
      </View>
    );
  }, [bottomInfo, color, desc, descTitle, icon, iconSize, title, type, contents]);

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={SheetBackdrop}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetView}>{modalContent}</BottomSheetView>
      </BottomSheetModal>
      <TouchableOpacity hitSlop={hitSlop} activeOpacity={activeOpacity} onPress={onOpen}>
        <SvgIcon name={SvgXmlIconNames.questionCircle} size={IconSize.xs} color={theme.palette.icon.base.primary} />
      </TouchableOpacity>
    </>
  );
};

const useStyles = ({ palette: { base, graphite, icon } }: UserTheme) =>
  StyleSheet.create({
    container: {},
    layer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
      paddingTop: 8,
      paddingBottom: 40,
      paddingHorizontal: 20,
      backgroundColor: graphite['050']
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between'
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      gap: 15,
      alignItems: 'center'
    },
    iconContainer: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#9CA3AF'
    },
    sectionInfo: {
      marginTop: 8
    },
    sectionRules: {
      marginTop: 15,
      paddingVertical: 20,
      gap: 8,
      paddingLeft: 45,
      paddingRight: 24,
      borderTopWidth: 0.5,
      borderBottomWidth: 0.5,
      borderTopColor: '#D9DDE5',
      borderBottomColor: '#D9DDE5'
    },
    rule: {
      flexDirection: 'row',
      gap: 9,
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    top: { top: 4.5 },
    greenBall: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#1DBF73' },
    greyBall: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#8890A1' },
    lineHeight: { lineHeight: 18 },
    greenText: { color: '#1DBF73' },
    blackColor: { color: base.black },
    greyColor: { color: '#8890A1' },
    redColor: { color: '#F6465D' },
    gap4: { gap: 4, paddingLeft: 45, paddingRight: 24 },
    bottomInfo: {
      marginTop: 20,
      paddingLeft: 45,
      paddingRight: 24,
      gap: 20
    },
    iconStyle: { marginRight: 5 },
    rotate: { transform: [{ rotate: '180deg' }] },
    buyContainer: { flexDirection: 'row', gap: 9 },
    sellContainer: { flexDirection: 'row', gap: 4 },
    gap0: { gap: 0 },
    twoIconContainer: {
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center'
    },
    warningText: {
      color: '#00000099',
      opacity: 0.75
    }
  });

export default memo(PopUp);
