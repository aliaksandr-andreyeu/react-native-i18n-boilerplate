import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  GestureResponderEvent,
  Animated,
  Easing,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components';
import { rgba } from '@/helpers';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { actions } from '@/store';
import { useAppDispatch } from '@/hooks';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';

const {
  application: { openModal }
} = actions;

interface BaseModalProps {
  config: DefaultModalConfig | null;
}

const BaseModal: React.FC<BaseModalProps> = ({ config }) => {
  const [isActive, setState] = React.useState(false);
  const progress = React.useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const styles = useStyles(theme);

  const dispatch = useAppDispatch();

  const onRequestClose = React.useCallback(() => {
    setState(false);
  }, []);

  React.useEffect(() => {
    setState(!!config);
  }, [config]);

  React.useEffect(() => {
    if (config?.closeTime && isActive) {
      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 1,
        duration: config.closeTime * 1000,
        easing: Easing.linear,
        useNativeDriver: false
      }).start(() => {
        onRequestClose();
      });
    }
  }, [config, isActive]);

  React.useEffect(() => {
    if (!isActive) {
      dispatch(openModal(null));
      config?.onClosed?.();
    }
  }, [isActive]);

  const stopPropagation = (event: GestureResponderEvent) => {
    event.stopPropagation();
  };

  const onPress = React.useCallback(() => {
    onRequestClose();
    config?.button?.onPress?.();
  }, [config?.button?.onPress]);

  const onSecondaryButtonPressed = React.useCallback(() => {
    onRequestClose();
    config?.secondaryButton?.onPress?.();
  }, [config?.secondaryButton?.onPress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal animationType='fade' transparent={true} visible={isActive} onRequestClose={onRequestClose}>
      <Pressable onPress={onRequestClose} style={styles.confirmBackDrop}>
        <View
          testID={config?.testID}
          accessibilityValue={{
            text: config?.testID
          }}
          accessibilityLabel={config?.testID}
          accessible={true}
          style={config?.closeTime ? styles.wrapper : styles.confirmBox}
          onTouchStart={stopPropagation}
          onStartShouldSetResponder={() => true}
          onTouchEnd={stopPropagation}
        >
          <TouchableOpacity hitSlop={12} onPress={onRequestClose} style={styles.closeContainer}>
            <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={theme.palette.icon.base.contrast} />
          </TouchableOpacity>
          {config?.closeTime && (
            <View style={styles.progressWrap}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
          )}
          {config?.icon && (
            <BaseImage
              style={[
                styles.confirmImage,
                {
                  width: config.iconSize?.width || styles.confirmImage.width,
                  height: config.iconSize?.height || styles.confirmImage.height
                }
              ]}
              resizeMode='contain'
              source={config.icon}
            />
          )}
          <View style={styles.confirmContent}>
            <View>
              <BaseText style={styles.confirmTitle} variant={BaseTextVariant.captionSemiBold}>
                {config?.title}
              </BaseText>
              {config?.subTitle && <BaseText style={styles.confirmSubtitle}>{config.subTitle}</BaseText>}
            </View>
            <View>
              {config?.button && (
                <BaseButton
                  type={config.button.type || BaseButtonType.primary}
                  size={BaseButtonSize.large}
                  label={config.button.text}
                  onPress={onPress}
                />
              )}
              {config?.secondaryButton && (
                <BaseButton
                  type={config.secondaryButton.type || BaseButtonType.accent}
                  size={BaseButtonSize.large}
                  label={config.secondaryButton.text}
                  onPress={onSecondaryButtonPressed}
                  style={styles.secondaryButton}
                />
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { icon } = palette || {};

  return StyleSheet.create({
    confirmBackDrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: rgba(palette.base.black, 60),
      padding: 20
    },
    wrapper: {
      width: '100%',
      backgroundColor: palette.base.white,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 23,
      paddingBottom: 40,
      gap: 12
    },
    confirmBox: {
      width: '100%',
      backgroundColor: palette.base.white,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 40,
      gap: 12
    },
    confirmImage: {
      alignSelf: 'center',
      width: 65,
      height: 65
    },
    confirmContent: {
      gap: 24
    },
    confirmTitle: {
      textAlign: 'center'
    },
    confirmSubtitle: {
      textAlign: 'center',
      color: '#5D7278',
      marginTop: 12
    },
    secondaryButton: {
      marginTop: 12
    },
    progressWrap: {
      marginBottom: 12,
      width: 40,
      height: 5,
      backgroundColor: '#ecf0f1',
      borderRadius: 4,
      alignSelf: 'center'
    },
    progressBar: {
      height: '100%',
      backgroundColor: icon?.base?.tertiary,
      borderRadius: 4
    },
    closeContainer: {
      position: 'absolute',
      right: 24,
      top: 20,
      zIndex: 99
    }
  });
};

export default BaseModal;
