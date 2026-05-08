import React, { FC, Fragment, useLayoutEffect, useCallback, useState, useMemo, useRef } from 'react';
import { View, ScrollView, BackHandler, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { ParamListBase, useTheme } from '@react-navigation/native';
import { images, SvgXmlIconNames } from '@/assets';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  ProgressHeader,
  SheetBackdrop,
  BaseImage,
  BaseLoader
} from '@/components';
import { useTranslation } from 'react-i18next';
import { useToast, ToastType } from '@/providers';
import { rgba } from '@/helpers';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_TAB_ROUTE_NAMES } from '@/containers/app/portfolio/portfolio/screen';
import { PORTFOLIO_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ParsedWalletData } from '@/store/slices/wallet/types';
import { actions } from '@/store';
import useStyles from './styles';
import { useAppDispatch } from '@/hooks';
import { getAccountName } from '@/constants/static';

const {
  wallet: { useChangeAccountType, useGetTradingAccountsMutation, setAccountType }
} = actions;


type ChangeAccountTypeScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.ChangeAccountType
>;

interface ChangeAccountTypeScreenData extends ChangeAccountTypeScreenProps {
  config: (ParsedWalletData & { isDefault: boolean })[];
  currentAccountId: number;
  currentTypeId: number;
  hasPositions: boolean;
}

const ChangeAccountTypeScreen: FC<ChangeAccountTypeScreenData> = ({
  navigation,
  config,
  currentAccountId,
  currentTypeId,
  hasPositions = false
}) => {
  const [activeTypeId, setActiveTypeId] = useState<number>(currentTypeId);

  const { openToast } = useToast();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const [getTradingAccounts] = useGetTradingAccountsMutation({});
  const [changeAccountType, changeAccountTypeResponse] = useChangeAccountType();
  const { isLoading } = changeAccountTypeResponse || {};


  const dispatch = useAppDispatch();

  const onOpenSheet = useCallback(() => (sheetIsOpen.current = true), [sheetIsOpen]);
  const onDismissSheet = useCallback(() => (sheetIsOpen.current = false), [sheetIsOpen]);

  const openSheet = useCallback(() => bottomSheetRef.current?.present(), [bottomSheetRef]);
  const closeSheet = useCallback(() => bottomSheetRef.current?.dismiss(), [bottomSheetRef]);

  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};
  const { text, background } = palette || {};

  const { t } = useTranslation();

  const activeConfig = useMemo(
    () => config.find((item) => item?.systemTypeId === String(activeTypeId)),
    [config, activeTypeId]
  );

  const {
    typeDisplayName: currentTypeDisplayName,
    isDefault,
    accountFeaturesDescription,
    colour,
    shortDescription,
    appDescriptionBlockBackground
  } = activeConfig || {};

  const getTradingAccountsHandler = async () => {
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const changeAccountTypeHandler = async () => {
    try {
      await changeAccountType({
        accountId: currentAccountId,
        targetTypeId: activeTypeId
      }).unwrap();
      dispatch(setAccountType(activeTypeId));
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) {
        closeSheet();
      } else navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, [navigation]);

  const changeAccountTypeResponseHandler = () => {
    const { isError, isSuccess } = changeAccountTypeResponse || {};

    if (isSuccess) {
      getTradingAccountsHandler();
    }

    if (isSuccess || isError) {
      openToast({
        title: isSuccess ? t('screens.change-account-type.switch-account-done') : t('errors.common'),
        type: isSuccess ? ToastType.success : ToastType.error,
        onOpen: () => closeSheet(),
        onClose: () => {
          if (isSuccess) {
            navigation.goBack();
          }
        }
      });
    }
  };

  useLayoutEffect(() => {
    changeAccountTypeResponseHandler();
  }, [changeAccountTypeResponse]);

  const AccountTypeTab = useCallback(
    (item: ParsedWalletData & { isDefault: boolean }) => {
      const { typeDisplayName, systemTypeId } = item || {};

      const isCurrent = Boolean(String(activeTypeId) === systemTypeId);
      const color = isCurrent ? text?.base?.inverted : text?.base?.primary;
      const backgroundColor = isCurrent ? background?.tag?.simple?.primary : background?.tag?.simple?.secondary;

      const onPress = () => {
        if (isCurrent) {
          return;
        }
        setActiveTypeId(Number(systemTypeId));
      };

      return (
        <BaseButton
          key={systemTypeId}
          type={BaseButtonType.primary}
          style={[styles.button, { ...(backgroundColor && { backgroundColor }) }]}
          labelStyle={{ ...(color && { color }) }}
          onPress={onPress}
          size={BaseButtonSize.extraSmall}
          label={typeDisplayName}
        />
      );
    },
    [activeTypeId, setActiveTypeId, background, text, styles]
  );

  const accountTypeTabBar = useMemo(() => {
    return (
      <View style={styles.tabsContainer}>
        <ScrollView
          style={styles.tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {config.map((item, index) => {
            const date = new Date();
            const ts = date.valueOf();

            return <AccountTypeTab key={`${ts}-${index}`} {...item} />;
          })}
        </ScrollView>
      </View>
    );
  }, [config, AccountTypeTab, styles]);

  const switchButton = useMemo(() => {
    if (isDefault) {
      return (
        <View style={styles.defaultAccountBox}>
          <BaseText variant={BaseTextVariant.small} style={[styles.defaultAccountText, styles.textCenter]}>
            {t('screens.change-account-type.current-account-type')}
          </BaseText>
        </View>
      );
    }

    const onSwitch = () => {
      InteractionManager.runAfterInteractions(() => openSheet());
    };
    return (
      <View style={styles.switchBox}>
        <BaseButton
          type={BaseButtonType.primary}
          onPress={onSwitch}
          size={BaseButtonSize.large}
          label={t('screens.change-account-type.switch-account', { title: getAccountName(currentTypeDisplayName, 'button') })}
        />
      </View>
    );
  }, [currentTypeDisplayName, isDefault, styles, openSheet, t]);

  const AccountHeader = useCallback(
    () => (
      <View style={styles.box}>
        <View style={styles.accountHeader}>
          {appDescriptionBlockBackground ? (
            <BaseImage
              resizeMode={'cover'}
              style={styles.accountHeaderImage}
              source={{ uri: appDescriptionBlockBackground }}
            />
          ) : null}
          <BaseText style={styles.accountHeaderText} variant={BaseTextVariant.title}>
            {getAccountName(currentTypeDisplayName, 'flex')}
          </BaseText>
          <BaseText style={styles.accountHeaderText} variant={BaseTextVariant.extraSmall}>
            {shortDescription}
          </BaseText>
        </View>
      </View>
    ),
    [styles, shortDescription, currentTypeDisplayName, appDescriptionBlockBackground]
  );

  const TopFeatures = useCallback(() => {
    const { title: accountFeatureTitle, infoBlockElement = [], bulletPointStyle } = accountFeaturesDescription || {};

    if (infoBlockElement?.length === 0) {
      return null;
    }

    const imgColor = colour ? colour : background.card.secondary;
    const imgBg = { backgroundColor: rgba(imgColor, 20) };

    return (
      <View style={styles.box}>
        <BaseText variant={BaseTextVariant.captionSemiBold}>{accountFeatureTitle}</BaseText>
        <View style={styles.infoBox}>
          {infoBlockElement.map((item, index) => {
            const { icon, primaryText } = item || {};
            const date = new Date();
            const ts = date.valueOf();
            const count = index + 1;

            return (
              <View key={`${ts}-${index}`} style={styles.row}>
                <View style={[styles.topFeaturesImageBox, imgBg]}>
                  {bulletPointStyle === 'icons' ? (
                    <BaseImage style={styles.topFeaturesImage} resizeMode={'contain'} source={{ uri: icon }} />
                  ) : (
                    <BaseText>{count}</BaseText>
                  )}
                </View>
                <BaseText variant={BaseTextVariant.textSemiBold}>{primaryText}</BaseText>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [styles, accountFeaturesDescription, colour, background]);

  const onSwitchAccount = async () => {
    await changeAccountTypeHandler();
  };

  const goToPositions = useCallback(() => {
    closeSheet();

    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Positions,
        params: {
          screen: PORTFOLIO_TAB_ROUTE_NAMES.Positions
        }
      }
    });
  }, [navigation, closeSheet]);

  const switchSheet = useMemo(() => {
    return (
      <View style={styles.switchContainer}>
        <View style={[styles.switchImageContainer, hasPositions ? styles.switchImageExt : {}]}>
          <BaseImage source={images.confirmation} resizeMode='contain' style={styles.confirmationImage} />
          <View style={styles.switchTextContainer}>
            <BaseText style={styles.textCenter} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.change-account-type.is-switch-account', { title: getAccountName(currentTypeDisplayName, 'flex') })}
            </BaseText>
            <BaseText style={styles.textCenter} variant={BaseTextVariant.text}>
              {hasPositions
                ? t('screens.change-account-type.close-all-open-positions')
                : t('screens.change-account-type.current-account-type-will-be-changed')}
            </BaseText>
          </View>
        </View>
        <View style={styles.switchBox}>
          {hasPositions ? (
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.change-account-type.goto-portfolio')}
              onPress={goToPositions}
            />
          ) : (
            <Fragment>
              <BaseButton
                type={BaseButtonType.primary}
                size={BaseButtonSize.large}
                label={t('screens.change-account-type.yes-switch-account')}
                onPress={onSwitchAccount}
              />
              <BaseButton
                type={BaseButtonType.accent}
                size={BaseButtonSize.large}
                onPress={closeSheet}
                label={t('screens.change-account-type.no-go-back')}
              />
            </Fragment>
          )}
        </View>
      </View>
    );
  }, [styles, closeSheet, goToPositions, onSwitchAccount, currentTypeDisplayName, t, hasPositions]);

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        hideProgressBar
        leftIconType={SvgXmlIconNames.arrowLeft}
        title={t('screens.change-account-type.title')}
        stepsCount={0}
        currentStep={0}
      />
      {accountTypeTabBar}
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <AccountHeader />
        <TopFeatures />
        {/* 

        Kate ask to hide 

        <BaseDivider />
        <View style={styles.box}>
          <View style={styles.infoBox}>
            <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} style={styles.row} onPress={() => {}}>
              <SvgIcon name={SvgXmlIconNames.file} size={IconSize.xsm} />
              <BaseText variant={BaseTextVariant.small}>
                {t('screens.change-account-type.account-conditions', { title: currentTypeDisplayName })}
              </BaseText>
            </TouchableOpacity>
          </View>
        </View>
        */}
      </ScrollView>
      {switchButton}
      <BottomSheetModal
        ref={bottomSheetRef}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBg}
        onDismiss={onDismissSheet}
        onChange={onOpenSheet}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetView>{switchSheet}</BottomSheetView>
      </BottomSheetModal>
      <BaseLoader active={isLoading} />
    </SafeAreaView>
  );
};

export default ChangeAccountTypeScreen;
