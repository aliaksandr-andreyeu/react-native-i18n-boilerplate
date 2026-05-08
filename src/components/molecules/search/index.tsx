import React, { useState, memo, forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, TextStyle, ViewStyle, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCommonStyles } from '@/hooks';
import { config, UserTheme } from '@/constants';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';

const {
  isRTL,
  fonts: { generalSans },
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

export interface BaseSearchProps extends TextInputProps {
  containerStyle?: ViewStyle;
  hasClear?: boolean;
  onClear?: () => void;
}

const BaseSearch = forwardRef<TextInput, BaseSearchProps>(
  ({ style, multiline, onClear, secureTextEntry, hasClear, containerStyle, ...rest }, ref) => {
    const [search, setSearch] = useState('');

    const theme = useTheme();
    const styles = useStyles(theme);

    const {
      palette: { graphite }
    } = theme || {};

    const clearSearch = () => {
      onClear && onClear();
      setSearch('');
    };

    return (
      <View style={[styles.container, { ...(search && styles.containerClose) }, containerStyle]}>
        <View style={styles.magnify}>
          <SvgIcon name={SvgXmlIconNames.magnify} size={IconSize.sm} color={graphite['600']} />
        </View>
        <TextInput
          ref={ref}
          onChangeText={(text) => setSearch(text)}
          style={[styles.input, style]}
          value={search}
          cursorColor={theme.palette.graphite['900']}
          placeholderTextColor={'#7D98A1'}
          {...rest}
        />
        {hasClear ? (
          <TouchableOpacity
            style={styles.secureBtn}
            activeOpacity={activeOpacity}
            hitSlop={hitSlop}
            onPress={clearSearch}
          >
            <SvgIcon name={SvgXmlIconNames.closeCircle} size={IconSize.xs} color={'#7D98A1'} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
);

interface Styles {
  container: ViewStyle;
  containerClose: ViewStyle;
  input: TextStyle;
  magnify: ViewStyle;
  secureBtn: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      borderRadius: 8,
      backgroundColor: palette.base.white,
      flexDirection: 'row',
      height: 38,
      ...shadow6Style
    },
    containerMultiline: {
      height: 'auto'
    },
    secureTextEntry: {
      paddingRight: 8
    },
    magnify: {
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8
    },
    secureBtn: {
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8
    },
    multiline: {
      textAlignVertical: 'top',
      height: 'auto',
      minHeight: 160,
      paddingVertical: 8
    },
    input: {
      borderRadius: 8,
      flexGrow: 1,
      flexShrink: 1,
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 14,
      fontFamily: generalSans.medium,
      color: palette.graphite['900'],
      textAlignVertical: 'center',
      textAlign: isRTL ? 'right' : 'left',
      height: 36
    },
    containerClose: {}
  });
};

export default memo(BaseSearch);
