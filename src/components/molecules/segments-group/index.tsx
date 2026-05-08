import { SegmentItem } from '@/components/atoms';
import { testIDs, UserTheme } from '@/constants';
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface IBaseSegments {
  onSegmentSelect(index: number): void;
  volumeMin: number | undefined;
  volumeStep: number | undefined;
  positionSize: number | undefined;
  contractSize: number | undefined;
  assetUnitOfMeasureDigits: number;
  inputValue: number;
  segments: number[];
}

const _keyExtractor = (_: number, index: number) => `${index}-segment`;

const BaseSegmentsGroup: React.FC<IBaseSegments> = ({
  onSegmentSelect,
  positionSize,
  volumeMin,
  volumeStep,
  contractSize,
  inputValue,
  assetUnitOfMeasureDigits,
  segments
}) => {
  const [selected, setSelected] = useState<number>(5);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    if (positionSize) {
      const percent = +(inputValue / positionSize).toFixed(assetUnitOfMeasureDigits);
      const result = percent * 100;
      const index = segments.findIndex((item) => item === result);
      if (+((result * positionSize) / 100).toFixed(assetUnitOfMeasureDigits) === inputValue) {
        setSelected(index);
      } else {
        setSelected(-1);
      }
    }
  }, [inputValue, selected, positionSize]);

  const _renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const onPress = (segmentIndex: number) => {
        if (selected === segmentIndex) return;
        setSelected(index);
        onSegmentSelect(index);
      };

      const isDisabled = () => {
        if (!(positionSize && volumeMin && volumeStep && contractSize)) return true;
        if (item === 100) return false;
        const minStep = volumeStep * contractSize;
        const minVol = volumeMin * contractSize;
        const result = (positionSize * item) / 100;
        const remain = positionSize - result;

        if (result >= minVol && result >= minStep && remain >= minVol && remain >= minStep) return false;
        return true;
      };
      return (
        <SegmentItem
          testID={testIDs.components.molecules.segmentsGroup.item(item)}
          disabled={isDisabled()}
          item={`${item}%`}
          index={index}
          selected={selected === index}
          onPress={onPress}
        />
      );
    },
    [selected, positionSize, volumeMin, volumeStep]
  );

  return (
    <View style={styles.container}>
      <FlatList
        testID={testIDs.components.molecules.segmentsGroup.list}
        data={segments}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.content}
        horizontal
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
      />
    </View>
  );
};

const useStyles = ({ }: UserTheme) =>
  StyleSheet.create({
    container: {
      marginTop: 20,
      alignItems: 'flex-end',
      paddingRight: 16
    },
    content: { justifyContent: 'space-between', flex: 1, paddingLeft: 16, alignItems: 'center' }
  });

export default BaseSegmentsGroup;
