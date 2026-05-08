import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { InfoTableRow } from '@/store/slices/ideas-hub/types';

interface IInfoTable {
  title: string | undefined;
  infoTableRow: InfoTableRow[];
}

interface IRow {
  primaryText: string;
  secondaryText: string;
  index: number;
}

const InfoTable: React.FC<IInfoTable> = ({ infoTableRow = [], title = '' }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const Row = useCallback(
    ({ primaryText = '', secondaryText = '', index }: IRow) => {
      return (
        <View style={styles.row} testID={testIDs.components.molecules.infoTable.row(index)}>
          <BaseText
            testID={testIDs.components.molecules.infoTable.primaryText(index)}
            variant={BaseTextVariant.small}
            style={[styles.grayText, styles.textAlignLeft, styles.flex]}
          >
            {primaryText}
          </BaseText>
          <BaseText
            testID={testIDs.components.molecules.infoTable.secondaryText(index)}
            variant={BaseTextVariant[index === 0 ? 'titleXXS' : 'small']}
            style={[styles.textAlignRight, styles.flex]}
          >
            {secondaryText}
          </BaseText>
        </View>
      );
    },
    [theme.dark]
  );

  return (
    <View style={styles.container} testID={testIDs.components.molecules.infoTable.container}>
      {!!title.length && <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>}
      <View style={styles.listContainer}>
        {infoTableRow.map((item, index) => {
          return <Row {...item} index={index} key={`${item.id}-info-table-row`} />;
        })}
      </View>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      gap: 16,
      paddingHorizontal: 20
    },
    listContainer: {
      paddingVertical: 12,
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    textAlignLeft: {
      textAlign: 'left'
    },
    textAlignRight: {
      textAlign: 'right'
    },
    grayText: {
      color: graphite[500]
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    flex: {
      flex: 1
    }
  });
};

export default memo(InfoTable);
