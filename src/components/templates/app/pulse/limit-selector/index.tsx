import React, { memo, useCallback, useRef } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseSwitch, BaseText, BaseTextVariant } from '@/components/atoms';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native-gesture-handler';

interface IBaseLimitSelector {
  limitTitle: string;
  onChangeText(v: string | undefined): void;
  onSwitch(v: boolean): void;
  value: string;
  enabled: boolean;
  testID?: string;
  switchTestID?: string;
}

const BaseLimitSelector: React.FC<IBaseLimitSelector> = ({
  limitTitle,
  onChangeText,
  value,
  enabled,
  onSwitch,
  switchTestID,
  testID
}) => {
  const inputRef = useRef<TextInput>(null);

  const theme = useTheme();
  const styles = useStyles(theme);

  const onChangeValue = useCallback(
    (v: string) => {
      const n = v.replaceAll(',', '.');
      onChangeText(n);
    },
    [onChangeText]
  );

  const onSwitchChange = useCallback(
    (v: boolean) => {
      onSwitch(v);
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          if (v) inputRef.current?.focus();
          else inputRef.current?.blur();
        });
      });
    },
    [value, onChangeText]
  );

  return (
    <View style={styles.container}>
      <BaseText style={styles.limit} variant={BaseTextVariant.extraSmall}>
        {limitTitle}
      </BaseText>
      <BaseSwitch
        style={styles.switchStyle}
        value={enabled}
        onChange={onSwitchChange}
        testID={switchTestID}
        accessibilityValue={{ text: switchTestID }}
      />
      <View pointerEvents={enabled ? 'auto' : 'none'} style={styles.flex}>
        <BottomSheetTextInput
          ref={inputRef}
          editable={enabled}
          style={[styles.input, enabled ? styles.enabled : styles.disabled]}
          value={enabled ? value : '-'}
          keyboardType='numeric'
          onChangeText={onChangeValue}
          testID={testID}
          accessibilityValue={{ text: testID }}
        />
      </View>
    </View>
  );
};

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    switchStyle: {
      marginRight: 31
    },
    input: {
      flex: 1,
      borderWidth: 0.3,
      borderColor: '#58616C',
      paddingTop: 7,
      paddingBottom: 7,
      paddingHorizontal: 20,
      borderRadius: 8,
      ...BaseTextVariant.smallSpace,
      maxHeight: 32
    },
    inputContainer: { flex: 1 },
    enabled: {
      color: '#8050F1',
      backgroundColor: base.white
    },
    disabled: {
      color: '#8890A1',
      backgroundColor: '#D9DDE580'
    },
    limit: {
      color: '#58616C',
      minWidth: 103
    }
  });

export default memo(BaseLimitSelector);
