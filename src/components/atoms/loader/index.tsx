import React from 'react';
import { Modal, ActivityIndicator, View, ViewProps, ViewStyle, StyleSheet } from 'react-native';
import { config, testIDs, UserTheme } from '@/constants';
import { rgba } from '@/helpers';
import { useTheme } from '@react-navigation/native';

const { isIOS } = config;

interface BaseLoaderProps extends ViewProps {
  color?: string;
  active?: boolean;
  isSmall?: boolean;
  animType?: 'fade' | 'none' | 'slide' | undefined;
}

const BaseLoader = ({ style, color, active = false, isSmall = false, animType = 'fade' }: BaseLoaderProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const onRequestClose = () => false;

  const size = isIOS ? 'small' : isSmall ? 'small' : 'large';

  return (
    <Modal
      animationType={animType}
      transparent={true}
      visible={active}
      onRequestClose={onRequestClose}
      testID={testIDs.components.atoms.loader.modal}
    >
      <View testID={testIDs.components.atoms.loader.container} style={[styles.container, style]} >
        <ActivityIndicator
          color={color || graphite['900']}
          size={size}
          animating={true}
          testID={testIDs.components.atoms.loader.indicator}
        />
      </View>
    </Modal>
  );
};

interface Styles {
  container: ViewStyle;
}

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: rgba(base.white, 40)
    }
  });

export default BaseLoader;
