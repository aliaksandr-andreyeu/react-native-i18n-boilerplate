import { SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useTheme } from '@react-navigation/native';
import { FC, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface IChartLegend {
  data: { value: number; color: string; type?: string }[];
}

const ChartLegend: FC<IChartLegend> = ({ data }) => {
  const { container, item, textWrapper, title, iconWrapper } = useStyles();

  const icons = useMemo<SvgXmlIconNames[]>(() => {
    return data.map((el) => {
      switch (el.type) {
        case 'Standard': {
          return SvgXmlIconNames.rewardsWalletGiftIcon;
        }
        case 'Cashback': {
          return SvgXmlIconNames.rewardsWalletCashbackIcon;
        }
        case 'Referral': {
          return SvgXmlIconNames.rewardsWalletPeopleIcon;
        }
        default: {
          return SvgXmlIconNames.rewardsWalletGiftIcon;
        }
      }
    });
  }, [data]);

  return (
    <View style={container}>
      {data.map((itemData, index) => (
        <View key={itemData.type} style={item}>
          <View style={[iconWrapper, { backgroundColor: itemData.color }]}>
            <SvgIcon
              size={{
                width: 16,
                height: 16
              }}
              name={icons[index]}
            />
          </View>
          <View style={textWrapper}>
            <BaseText style={title} variant={BaseTextVariant.small}>
              {itemData.type}
            </BaseText>
            <BaseText variant={BaseTextVariant.amountExtraSmall}>${itemData.value}</BaseText>
          </View>
        </View>
      ))}
    </View>
  );
};

interface IChartLegendStyles {
  container: ViewStyle;
  item: ViewStyle;
  textWrapper: ViewStyle;
  title: TextStyle;
  iconWrapper: ViewStyle;
}

export default ChartLegend;

const useStyles = () => {
  const { palette } = useTheme();

  return StyleSheet.create<IChartLegendStyles>({
    container: {
      flexDirection: 'column',
      rowGap: 14
    },
    item: {
      columnGap: 11,
      alignItems: 'center',
      flexDirection: 'row'
    },
    textWrapper: {
      flexDirection: 'column'
    },
    title: {
      color: palette.graphite['900']
    },
    iconWrapper: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
};
