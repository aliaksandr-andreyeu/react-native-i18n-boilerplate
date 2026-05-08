import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components';
import { FC } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import { useStyles } from './styles';

export interface IGroupBarData {
  name: string;
  label: string;
}

export interface IGroupBarProps {
  data: IGroupBarData[];
  activeItem?: string;
  changeActiveItem: (itemName: string) => void;
}

const GroupBar: FC<IGroupBarProps> = ({ data, activeItem, changeActiveItem }) => {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={data}
        style={styles.groupBarContainer}
        contentContainerStyle={styles.groupBarInnerContainer}
        keyExtractor={(subItem) => `${subItem.name}`}
        renderItem={(item) => (
          <TouchableOpacity
            style={[styles.groupBarItem, activeItem === item.item.name && styles.activeGroupBarItem]}
            onPress={() => changeActiveItem(item.item.name)}
            activeOpacity={1}
          >
            <BaseText
              style={activeItem === item.item.name ? styles.activeGroupBarItemLabel : styles.groupBarItemLabel}
              variant={BaseTextVariant.small}
            >
              {item.item.label}
            </BaseText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default GroupBar;
