import React, { useMemo } from 'react';
import { StyleSheet, View, ViewProps, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { BaseHelpButton, BaseHelpButtonSize, BaseText, BaseTextVariant } from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';

const {
  components: {
    buttons: { hitSlop, activeOpacity }
  }
} = config;

interface BaseCaptionProps extends ViewProps {
  label: string;
  help?: string;
  helpIcon?: boolean;
  goTo?: () => void;
  labelStyle?: TextStyle;
  iconSize?: { width: number; height: number };
  testID?: string;
}
const BaseCaption = ({ style, help, label, helpIcon = true, goTo, labelStyle, iconSize, testID }: BaseCaptionProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};
  const { icon } = palette || {};

  const helpBtn = useMemo(() => {
    if (!help) {
      return null;
    }
    return (
      <BaseHelpButton
        testID={testIDs.components.molecules.caption.helpButton}
        color={icon.base.primary}
        size={BaseHelpButtonSize.small}
        text={help}
        style={styles.helpBtn}
      />
    );
  }, [styles, help, icon]);

  const goToBtn = useMemo(() => {
    if (!(goTo && typeof goTo === 'function')) {
      return null;
    }
    return (
      <TouchableOpacity
        testID={testIDs.components.molecules.caption.goToButton}
        style={styles.btn}
        activeOpacity={activeOpacity}
        hitSlop={hitSlop}
        onPress={goTo}
      >
        <SvgIcon name={SvgXmlIconNames.chevronRight} size={iconSize || IconSize.xs} color={icon.base.contrast} />
      </TouchableOpacity>
    );
  }, [styles, goTo, icon]);

  if (!label) {
    return null;
  }

  return (
    <View testID={testID} style={[styles.container, style]}>
      <View style={styles.titleBox}>
        <BaseText
          style={labelStyle}
          testID={testIDs.components.molecules.caption.label}
          variant={BaseTextVariant.title}
        >
          {label}
        </BaseText>
        {helpIcon && helpBtn}
      </View>
      {goToBtn}
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  titleBox: ViewStyle;
  helpBtn: ViewStyle;
  btn: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      width: '100%',
      flexDirection: 'row',
      gap: 16,
      minHeight: 32,
      alignItems: 'center',
      paddingHorizontal: 20,
      justifyContent: 'space-between'
    },
    titleBox: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4
    },
    helpBtn: {
      marginBottom: 4
    },
    btn: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });

export default BaseCaption;
