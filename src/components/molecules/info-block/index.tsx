import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { InfoBlockElement, InfoBlockIcon } from '@/store/slices/ideas-hub/types';
import { useCommonStyles } from '@/hooks';
import { BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';

interface IBaseInfoBlock {
  type: 'simple' | 'with-border';
  borderColor?: string;
  bgColor: string;
  blockElements: InfoBlockElement[];
  bulletPointStyle: 'numbers' | 'icons';
  title: string;
  promoIcons: InfoBlockIcon[];
  testID?: string;

}

interface Guide {
  number: number;
  icon?: InfoBlockIcon;
  primaryText: string;
  secondaryText: string;
  bgColor: string;
}

const BaseInfoBlock: React.FC<IBaseInfoBlock> = ({
  bgColor,
  blockElements,
  bulletPointStyle,
  type,
  borderColor,
  title = '',
  promoIcons,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const borderStyle = useMemo((): ViewStyle => {
    const isWithBorder = type === 'with-border';
    return {
      borderRadius: isWithBorder ? 16 : 12,
      borderTopLeftRadius: isWithBorder ? 0 : 12,
      borderLeftWidth: isWithBorder ? 4 : 0,
      borderLeftColor: borderColor
    };
  }, [type, borderColor]);

  const Guide = useCallback(
    ({ number, icon, primaryText, secondaryText, bgColor }: Guide) => {
      const hasPrimaryText = !!primaryText.length;
      const isIcon = bulletPointStyle === 'icons' && !!icon?.url?.length;
      const uri = icon?.url || '';

      return (
        <View
          style={[
            styles.guideContainer,
            {
              paddingVertical: hasPrimaryText ? 12 : 8,
              alignItems: hasPrimaryText ? 'flex-start' : 'center'
            }
          ]}
        >
          <View style={[styles.guideLeft, { backgroundColor: bgColor }]}>
            {isIcon ? (
              <BaseImage
                testID={testIDs.components.molecules.infoBlock.image(number)}
                resizeMode='contain'
                source={{ uri }}
                style={styles.icon}
              />
            ) : (
              <BaseText style={styles.number} variant={BaseTextVariant.widgetTitle}>
                {number}
              </BaseText>
            )}
          </View>
          <View style={[styles.guideRight, { top: hasPrimaryText ? 5 : 0 }]}>
            {hasPrimaryText && <BaseText variant={BaseTextVariant.titleXXS}>{primaryText}</BaseText>}
            <BaseText>{secondaryText}</BaseText>
          </View>
        </View>
      );
    },
    [bulletPointStyle, theme.dark]
  );

  return (
    <View testID={testID} style={styles.general}>
      {!!title?.length && <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>}
      <View style={[styles.container, borderStyle]}>
        {!!blockElements?.length &&
          blockElements.map((item, index) => {
            const promoIcon = promoIcons?.find((pIcon) => pIcon.infoBlockElementId === item.id);

            return (
              <Guide
                key={`${item.id}-guide`}
                number={index + 1}
                bgColor={bgColor}
                primaryText={item.primaryText || ''}
                secondaryText={item.secondaryText || ''}
                icon={promoIcon || undefined}
              />
            );
          })}
      </View>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    general: {
      gap: 16,
      marginHorizontal: 20
    },
    container: {
      backgroundColor: base.white,
      paddingVertical: 12,
      ...shadow6Style
    },
    guideContainer: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      gap: 8
    },
    guideLeft: {
      width: 30,
      height: 30,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    icon: {
      width: 16,
      height: 16
    },
    number: {
      color: graphite['900']
    },
    guideRight: {
      flex: 1,
      gap: 4
    }
  });
};

export default memo(BaseInfoBlock);
