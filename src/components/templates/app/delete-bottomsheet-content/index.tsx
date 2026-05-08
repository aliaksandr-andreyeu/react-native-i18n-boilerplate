import React, { FC } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, TextStyle } from 'react-native';
import { StyleSheet, ViewStyle } from 'react-native';
import { testIDs, UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components';

interface BottomSheetProps {
  title: string;
  onDeletePressed: () => void;
  onCancelPressed: () => void;
}

export const DeleteBottomSheetContent: FC<BottomSheetProps> = ({ title, onDeletePressed, onCancelPressed }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  return (
    <BottomSheetView style={styles.deleteSheetContainer}>
      <BaseText testID={testIDs.components.templates.app.deleteBottomSheetContent.title} style={styles.deleteSheetTitle} variant={BaseTextVariant.captionSemiBold}>
        {title}
      </BaseText>
      <View testID={testIDs.components.templates.app.deleteBottomSheetContent.buttonsContainer} style={styles.deleteSheetButtons}>
        <BaseButton
          testID={testIDs.components.templates.app.deleteBottomSheetContent.deleteButton}
          type={BaseButtonType.primary}
          onPress={onDeletePressed}
          size={BaseButtonSize.large}
          label={t('screens.position-info.delete')}
        />
        <BaseButton
          testID={testIDs.components.templates.app.deleteBottomSheetContent.cancelButton}
          type={BaseButtonType.primary}
          style={styles.cancelBtn}
          labelStyle={styles.cancelLabelBtn}
          onPress={onCancelPressed}
          size={BaseButtonSize.large}
          label={t('screens.position-info.cancel')}
        />
      </View>
    </BottomSheetView>
  );
};

interface Styles {
  deleteSheetContainer: ViewStyle;
  deleteSheetTitle: TextStyle;
  cancelLabelBtn: TextStyle;
  deleteSheetButtons: ViewStyle;
  cancelBtn: ViewStyle;
}

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create<Styles>({
    deleteSheetContainer: {
      gap: 24,
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 40
    },
    deleteSheetTitle: {
      textAlign: 'center'
    },
    deleteSheetButtons: {
      gap: 12
    },
    cancelBtn: {
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    },
    cancelLabelBtn: {
      color: graphite['900']
    }
  });

export default DeleteBottomSheetContent;
