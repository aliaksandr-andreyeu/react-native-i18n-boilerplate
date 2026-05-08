import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { SvgIcon, SvgXmlIconNames } from '@/assets';
import OrderSelector from '../order-selector';
import { useTranslation } from 'react-i18next';
import { getAssetName } from '@/helpers';
import { ORDER_TYPES } from '@/types';
import useStyles from './styles';

interface IOpenPositionHeader {
    asset: string | undefined;
    digits: number;
    isSelectorDisabled: boolean;
    entry: boolean | undefined;
    tick: number | undefined;
    onChangeOrderType(orderType: ORDER_TYPES): void;
    selectedOrderType: ORDER_TYPES
};

const OpenPositionHeader: React.FC<IOpenPositionHeader> = ({
    digits = 0,
    asset,
    entry,
    isSelectorDisabled,
    tick,
    onChangeOrderType,
    selectedOrderType
}) => {


    const { t } = useTranslation()
    const theme = useTheme();
    const styles = useStyles(theme);


    const assetName = getAssetName(asset);

    const title = `${entry ? t('screens.create-position.buy') : t('screens.create-position.sell')} ${assetName}`;
    const desc = tick ? `1 ${assetName} = ${tick.toFixed(digits || 0)}` : null;


    if (asset === undefined || entry === undefined) return null;

    return (
        <View style={styles.sheetCaption}>
            <View style={styles.sheetTitle}>
                <View style={styles.sheetTitleRightContainer}>
                    <BaseText style={styles.title} variant={BaseTextVariant.pageTitle}>
                        {title}
                    </BaseText>
                    <SvgIcon
                        style={!entry && styles.sellTriangle}
                        name={SvgXmlIconNames.triangle}
                        color={entry ? '#1DBF73' : '#F6465D'}
                        size={{ width: 8.17, height: 7 }}
                    />
                </View>
                <BaseText
                    style={styles.sheetDesc}
                    variant={BaseTextVariant.small}
                    testID={testIDs.components.templates.app?.pulse?.openPosition?.oneUnitValue}
                    accessibilityValue={{
                        text: testIDs.components.templates.app?.pulse?.openPosition?.oneUnitValue
                    }}
                >
                    {desc}
                </BaseText>
            </View>
            <OrderSelector isDisabled={isSelectorDisabled} defaultOrder={selectedOrderType} onChange={onChangeOrderType} />
        </View>
    )
};

export default memo(OpenPositionHeader);