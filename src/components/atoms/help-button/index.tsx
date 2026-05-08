import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View
} from 'react-native';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import BaseText, { BaseTextVariant } from '../text';
import Tooltip from 'react-native-walkthrough-tooltip';
import BaseButton, { BaseButtonSize, BaseButtonType } from '../button';
import { useTranslation } from 'react-i18next';

type Placement = 'center' | 'bottom' | 'top' | 'left' | 'right' | undefined;

export enum BaseHelpButtonSize {
  tiny = 10,
  small = 20
}

const { screenHeight, isAndroid } = config;
interface BaseHelpButtonProps extends TouchableOpacityProps {
  color?: string;
  size?: BaseHelpButtonSize;
  text?: string;
  title?: string;
  icon?: SvgXmlIconNames;
  contentIconColor?: string | undefined;
  contentIconSize?: { width: number; height: number };
  btnHitslop?: number;
  isAutoVisible?: boolean;
  showHelpButton?: boolean;
  onBackButtonPress?(): void;
  onNextButtonPress?(): void;
  showStepButtons?: boolean;
  showNext?: boolean;
  showBack?: boolean;
  arrowPlacement?: Placement;
  onCloseTip?(): void;
  customContent?: null | React.ReactElement<any>;
}

const insets = { bottom: 34, top: 34, left: 12, right: 20 };

const BaseHelpButton = ({
  text,
  icon,
  btnHitslop,
  contentIconColor,
  contentIconSize,
  title,
  style,
  color,
  size = BaseHelpButtonSize.small,
  isAutoVisible = false,
  showHelpButton = true,
  onBackButtonPress,
  onNextButtonPress,
  showStepButtons = false,
  showBack = false,
  showNext = false,
  arrowPlacement,
  onCloseTip,
  testID = 'BaseHelpButton',
  customContent = null
}: BaseHelpButtonProps) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const [isVisible, setVisible] = useState(false);
  const [y, setY] = useState<number>(0);
  const [layout, setLayout] = useState<number>(0);

  useLayoutEffect(() => {
    setVisible(isAutoVisible);
  }, [isAutoVisible]);

  const {
    palette: { graphite }
  } = theme;

  const iconSize = useMemo(() => {
    if (size === BaseHelpButtonSize.small) {
      return IconSize.xs;
    }
    return IconSize.xxs;
  }, [size]);

  const showToolTip = useCallback((e: GestureResponderEvent) => {
    setY(e.nativeEvent.pageY);
    setVisible(true);
  }, []);

  const closeToolTip = useCallback(() => {
    onCloseTip && onCloseTip();
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isAndroid) {
      if (isVisible) {
        StatusBar.setBackgroundColor('rgba(0,0,0,0.5)');
      } else {
        StatusBar.setBackgroundColor(theme.colors.background);
      }
    }
  }, [isVisible]);

  const iconColor = color || graphite['900'];

  const handlePlacement = (y: number, layout: number): Placement => {
    const diff = 34 + 32 + 8 + 68;
    const safe = screenHeight - diff;
    const container = y + layout;
    if (container >= safe) return 'top';
    return 'bottom';
  };

  const placement = useMemo(() => {
    return handlePlacement(y, layout);
  }, [y, layout]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!layout) setLayout(e.nativeEvent.layout.height);
    },
    [layout]
  );

  return (
    <Tooltip
      isVisible={isVisible}
      closeOnContentInteraction={false}
      placement={arrowPlacement || placement}
      displayInsets={insets}
      onClose={closeToolTip}
      useInteractionManager
      contentStyle={styles.contentStyle}
      content={customContent || <View style={styles.content} onLayout={onLayout}>
        {!!title?.length && (
          <View style={styles.contentTop}>
            <View style={styles.topTop}>
              {!!icon && <SvgIcon name={icon} color={contentIconColor} size={contentIconSize} />}
              <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>
            </View>
            <TouchableOpacity hitSlop={8} onPress={closeToolTip}>
              <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={theme.palette.graphite['900']} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.row}>
          <BaseText variant={BaseTextVariant.text} style={styles.subTitle}>
            {text}
          </BaseText>
          {!!title?.length || (
            <TouchableOpacity testID='BaseHelpButton_Close' hitSlop={8} onPress={closeToolTip}>
              <SvgIcon
                style={styles.close}
                name={SvgXmlIconNames.close}
                size={IconSize.xxs}
                color={theme.palette.graphite['900']}
              />
            </TouchableOpacity>
          )}
        </View>
        {showStepButtons && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 12, marginTop: 10 }}
          >
            {showBack && (
              <BaseButton
                type={BaseButtonType.primary}
                onPress={onBackButtonPress}
                size={BaseButtonSize.extraSmall}
                label={t('screens.wallet.back')}
              />
            )}
            {showNext && (
              <BaseButton
                type={BaseButtonType.primary}
                size={BaseButtonSize.extraSmall}
                onPress={onNextButtonPress}
                label={t('screens.wallet.next')}
              />
            )}
          </View>
        )}
      </View>
      }
    >
      {showHelpButton && (
        <TouchableOpacity testID={testID} hitSlop={btnHitslop} style={[styles.container, style]} onPress={showToolTip}>
          <SvgIcon name={SvgXmlIconNames.questionCircle} size={iconSize} color={iconColor} />
        </TouchableOpacity>
      )}
    </Tooltip>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    container: {
      width: BaseHelpButtonSize.small,
      height: BaseHelpButtonSize.small,
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      gap: 8
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
      flex: 1
    },
    text: {
      color: palette.graphite['900']
    },
    subTitle: {
      color: palette.graphite['900'],
      paddingRight: 8,
      flexShrink: 1
    },
    contentStyle: {
      padding: 16,
      backgroundColor: palette.base.white,
      borderRadius: 12,
      gap: 8
    },
    contentTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      gap: 8
    },
    topTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1
    },
    close: {
      flex: 1
    }
  });

export default memo(BaseHelpButton);
