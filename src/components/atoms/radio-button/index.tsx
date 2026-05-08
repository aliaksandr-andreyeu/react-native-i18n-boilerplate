import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle, TouchableOpacity, TouchableOpacityProps, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';
import { TextInput } from 'react-native-gesture-handler';
import BaseText, { BaseTextVariant } from '../text';

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

export enum BaseRadioButtonType {
  primary = 'primary',
  secondary = 'secondary'
}

interface BaseRadioButtonProps extends TouchableOpacityProps {
  label?: string;
  subTitle?: string;
  labelSuffix?: React.JSX.Element;
  icon?: React.JSX.Element;
  isSelected?: boolean;
  showInput?: boolean;
  placeholder?: string;
  onPress?: () => void;
  inputValue?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: BaseRadioButtonType;
  checkBoxWrapperStyle?: ViewStyle;
  contentStyle?: ViewStyle | ViewStyle[];
}

const BaseRadioButton = ({
  label,
  subTitle,
  labelSuffix,
  icon,
  isSelected,
  onPress,
  showInput,
  placeholder,
  onBlur,
  onFocus,
  inputValue,
  onChangeText,
  type,
  checkBoxWrapperStyle,
  contentStyle
}: BaseRadioButtonProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [inputText, setInputText] = useState(inputValue || '');

  const checkBoxLabel = useMemo(() => {
    if (!label) {
      return null;
    }
    return (
      <View style={styles.labelBox}>
        <View style={styles.labelContainer}>
          <BaseText style={[styles.label, showInput ? styles.otherOption : {}]}>{label}</BaseText>
          {labelSuffix ? labelSuffix : null}
        </View>
        {subTitle && (
          <BaseText variant={BaseTextVariant.small} style={styles.subTitle}>
            {subTitle}
          </BaseText>
        )}
      </View>
    );
  }, [label, subTitle, showInput, labelSuffix]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const renderRadioIcon = useCallback(() => {
    if (isSelected) {
      return (
        <View style={[styles.checkIconWrap, checkBoxWrapperStyle]}>
          <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xxs} />
        </View>
      );
    }
    return <View style={[styles.unselected, checkBoxWrapperStyle]} />;
  }, [isSelected, checkBoxWrapperStyle]);

  if (type === BaseRadioButtonType.secondary) {
    return (
      <View style={[styles.content, contentStyle]}>
        <TouchableOpacity
          onPress={onPress}
          hitSlop={hitSlop}
          activeOpacity={activeOpacity}
          style={styles.secondaryButton}
        >
          {renderRadioIcon()}
          <View style={styles.iconWrapper}>{icon}</View>
          {checkBoxLabel}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.content, contentStyle]}>
      <TouchableOpacity
        testID='base-radio-button'
        onPress={onPress}
        hitSlop={hitSlop}
        activeOpacity={activeOpacity}
        style={[styles.button, !showInput && { paddingBottom: 12 }]}
      >
        {checkBoxLabel}
        {renderRadioIcon()}
      </TouchableOpacity>
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            autoFocus
            style={styles.input}
            placeholder={placeholder}
            value={inputText}
            onChangeText={handleTextChange}
            onBlur={onBlur}
            onFocus={onFocus}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              handleTextChange('');
            }}
          >
            <SvgIcon name={SvgXmlIconNames.closeCircle} color={'#8fa6ae'} size={IconSize.xs} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface Styles {
  content: ViewStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  button: ViewStyle;
  secondaryButton: ViewStyle;
  labelContainer: ViewStyle;
  labelBox: ViewStyle;
  label: TextStyle;
  checkIconWrap: ViewStyle;
  closeButton: ViewStyle;
  unselected: ViewStyle;
  iconWrapper: ViewStyle;
  otherOption: TextStyle;
  subTitle: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    content: {
      backgroundColor: palette.base.white,
      borderRadius: 8,
      marginBottom: 12,
      ...shadow6Style
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    input: {
      flex: 1,
      paddingLeft: 16,
      height: 50,
      color: palette.graphite['900']
    },
    button: {
      paddingTop: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    iconWrapper: {
      marginRight: 8,
      marginLeft: 16
    },
    labelBox: {
      justifyContent: 'center',
      flex: 1,
      flexShrink: 1
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 1,
      gap: 8
    },
    label: {
      flexShrink: 1
    },
    otherOption: {
      fontSize: 13,
      color: '#8fa6ae'
    },
    subTitle: {
      marginTop: 2,
      color: '#5D7278',
      flexShrink: 1
    },
    checkIconWrap: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: palette.purple['100']
    },
    closeButton: {
      paddingHorizontal: 19,
      height: 40,
      justifyContent: 'center'
    },
    unselected: {
      borderColor: '#8fa6ae',
      borderRadius: 10,
      width: 20,
      height: 20,
      borderWidth: 1
    }
  });
};

export default BaseRadioButton;
