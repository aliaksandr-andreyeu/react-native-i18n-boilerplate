import React, { useImperativeHandle, useRef, forwardRef, useCallback, useState, useMemo, useEffect, memo } from 'react';
import { Keyboard, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { BottomSheetModal, BottomSheetProps, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseRadioButton,
  BaseSearch,
  BaseText,
  BaseTextVariant,
  SheetBackdrop
} from '@/components';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import { useCommonStyles } from '@/hooks';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type IBaseOptionList = {
  open(): void;
  close(): void;
  isOpen(): boolean;
  expand(): void;
};

interface BaseOptionListProps {
  data?: string[];
  onSelect?(currency: string): void;
  defaultSelected?: string;
  hasSearch?: boolean;
  open?: boolean;
  title: string;
  hasIcons?: boolean;
  renderContent?: React.ReactNode;
  selected?: boolean;
  onContinue?(): void;
  hasSecureText?: boolean;
  showEmpty?: boolean;
  hasDelay?: boolean;
  hasSeperator?: boolean;
}

const {
  screenWidth,
  buttons: { activeOpacity }
} = config;

let timeout: NodeJS.Timeout;

const BaseOptionList = forwardRef(
  (
    {
      data = [],
      onSelect,
      defaultSelected = '',
      hasSearch = true,
      open,
      title,
      hasIcons = true,
      renderContent = null,
      selected = false,
      onContinue,
      hasSecureText = true,
      showEmpty = false,
      hasDelay = true,
      hasSeperator = true,
      ...props
    }: BaseOptionListProps & Partial<BottomSheetProps>,
    ref
  ) => {
    const { t } = useTranslation();

    const { bottom, top } = useSafeAreaInsets();

    const inputRef = useRef<TextInput>(null);

    const theme = useTheme();
    const styles = useStyles(theme);

    const [currency, setCurrency] = useState<string>(defaultSelected);
    const [currentIncludes, setCurrentIncludes] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [inputFocused, setInputFocused] = useState<boolean>(false);

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const isOpen = useRef<boolean>(false);

    const isCustomRender = useMemo(() => renderContent !== null, [renderContent]);

    const currencyData = useMemo(() => {
      if (!search.length && hasSearch) {
        return data;
      }

      const val = search.toLowerCase();
      return data.filter((item) => item.toLowerCase().includes(val));
    }, [search, data, hasSearch]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          bottomSheetRef.current?.present();
        },
        close: () => {
          bottomSheetRef.current?.dismiss();
        },
        isOpen: () => {
          return isOpen.current;
        },
        expand: () => {
          bottomSheetRef.current?.present();
        }
      }),
      []
    );

    useEffect(() => {
      if (!search.length && hasSearch) {
        setCurrentIncludes(true);
      } else {
        setCurrentIncludes(currencyData.includes(currency));
      }
    }, [currencyData, currency, search, hasSearch]);

    const _renderItem = useCallback(
      ({ item, index }: { item: string; index: number }) => {
        const onSelectPayment = () => {
          if (item === currency) return;
          else setCurrency(item);
        };

        const first: ViewStyle = index === 0 ? { borderTopLeftRadius: 8, borderTopRightRadius: 8 } : {};
        const last: ViewStyle =
          index === data.length - 1 ? { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 } : {};

        return (
          <BaseRadioButton
            icon={hasIcons ? <SvgIcon name={SvgXmlIconNames.bankCard} /> : undefined}
            type={BaseRadioButtonType.secondary}
            contentStyle={{ ...styles.radioStyle, ...first, ...last }}
            isSelected={item === currency}
            checkBoxWrapperStyle={IconSize.sm}
            label={item}
            onPress={onSelectPayment}
          />
        );
      },
      [currency, hasIcons, data.length, theme.dark]
    );

    const _keyExtractor = useCallback((item: string) => `${item}-currency`, []);

    const Seperator = useCallback(() => {
      return <View style={styles.seperator} />;
    }, [theme.dark]);

    const onConfirmCurrency = useCallback(() => {
      onContinue && onContinue();
      timeout && clearTimeout(timeout);
      if (isCustomRender) {
        bottomSheetRef.current?.close();
        return (timeout = setTimeout(
          () => {
            onSelect && onSelect('');
          },
          hasDelay ? 300 : 0
        ));
      }
      if (!currency) return;
      bottomSheetRef.current?.close();
      timeout = setTimeout(
        () => {
          onSelect && onSelect(currency);
        },
        hasDelay ? 300 : 0
      );
    }, [currency, isCustomRender, hasDelay]);

    const onCancel = useCallback(() => {
      if (Keyboard.isVisible()) Keyboard.dismiss();
      requestAnimationFrame(() => {
        setSearch('');
        inputRef.current?.blur()
      });
    }, []);

    const onClear = useCallback(() => {
      requestAnimationFrame(() => {
        setSearch('');
        inputRef.current?.focus();
      });
    }, []);

    const EmptyList = useCallback(({ search }: { search: string }) => {
      return (
        <View style={styles.emptyList}>
          <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
          <View style={styles.textContainer}>
            <BaseText
              style={styles.textAlign}
              variant={BaseTextVariant.captionSemiBold}
            >{`No results found for “${search}”`}</BaseText>
            <BaseText style={styles.textAlign}>Try adjusting your search or filter</BaseText>
          </View>
          <TouchableOpacity onPress={onClear} activeOpacity={activeOpacity} hitSlop={5}>
            <BaseText variant={BaseTextVariant.textSemiBold} style={styles.clear}>
              Clear search
            </BaseText>
          </TouchableOpacity>
        </View>
      );
    }, []);

    const onAnimate = useCallback(() => (isOpen.current = true), []);
    const onClose = useCallback(() => (isOpen.current = false), []);

    const searchLength = useMemo(() => !!search?.length, [search]);

    const onFocus = useCallback(() => setInputFocused(true), []);
    const onBlur = useCallback(() => setInputFocused(false), []);
    const onScrollBeginDrag = useCallback(Keyboard.dismiss, []);

    const moreThan12 = useMemo(() => data.length >= 12, [data]);

    const calPadding = useMemo(() => {
      const pad = moreThan12 ? 248 : 124;
      const padSecureText = moreThan12 ? 260 : 140;
      return (hasSecureText ? padSecureText : pad) + (bottom > 20 ? 20 : bottom);
    }, [bottom, moreThan12, hasSecureText]);

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        containerStyle={styles.sheetContainer}
        snapPoints={(hasSearch && searchLength) || inputFocused ? ['100%'] : undefined}
        enableDynamicSizing={!(searchLength || inputFocused)}
        keyboardBlurBehavior='restore'
        keyboardBehavior='interactive'
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.indicator}
        enablePanDownToClose
        waitFor={scrollViewRef}
        onAnimate={onAnimate}
        onDismiss={onClose}
        backdropComponent={SheetBackdrop}
        enableDismissOnClose
        topInset={top}
        {...props}
      >
        <BottomSheetView style={styles.sheetView}>
          <BaseText style={styles.choose} variant={BaseTextVariant.captionSemiBold}>
            {title}
          </BaseText>
          <Animated.View style={styles.head}>
            {hasSearch && (
              <>
                <View style={styles.input}>
                  <BaseSearch
                    ref={inputRef}
                    value={search}
                    hasClear={searchLength}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onClear={onClear}
                    style={BaseTextVariant.text}
                    onChangeText={setSearch}
                    containerStyle={styles.searchBar}
                    placeholder={t('screens.deposit.search')}
                  />
                </View>
                {(searchLength || inputFocused) && (
                  <TouchableOpacity onPress={onCancel} activeOpacity={activeOpacity} hitSlop={10}>
                    <BaseText variant={BaseTextVariant.textSemiBold} style={styles.cancel}>
                      {t('screens.deposit.cancel')}
                    </BaseText>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>
          {isCustomRender ? (
            <View style={{ paddingBottom: (hasSecureText ? 260 : 248) + (bottom > 20 ? 20 : bottom) }}>
              {renderContent}
            </View>
          ) : (
            <FlatList
              data={currencyData}
              onScrollBeginDrag={onScrollBeginDrag}
              ListEmptyComponent={showEmpty ? <EmptyList search={search} /> : null}
              initialNumToRender={currencyData.length}
              contentContainerStyle={[styles.content, { paddingBottom: calPadding }]}
              style={currencyData.length ? styles.list : styles.empty}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={hasSeperator ? Seperator : null}
              renderItem={_renderItem}
              keyExtractor={_keyExtractor}
            />
          )}
        </BottomSheetView>
        <View style={[styles.button, { paddingBottom: hasSecureText ? 0 : 44 }]}>
          <BaseButton
            disabled={isCustomRender ? !selected : !(currency.length > 0 && currentIncludes) || currency === undefined}
            type={BaseButtonType.primary}
            size={BaseButtonSize.large}
            label={t('screens.deposit.continue')}
            onPress={onConfirmCurrency}
            style={styles.btn}
          />
          {hasSecureText && (
            <BaseText
              style={[styles.secure, { marginBottom: bottom < 20 ? 20 : bottom }]}
              variant={BaseTextVariant.small}
            >
              {t('screens.common.fully-secured')}
            </BaseText>
          )}
        </View>
      </BottomSheetModal>
    );
  }
);

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { icon } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    sheetContainer: {
      zIndex: 99
    },
    content: {
      borderRadius: 8
    },
    list: {
      marginHorizontal: 20
    },
    seperator: { height: 0.5, width: '100%', backgroundColor: 'rgba(180, 196, 201, 0.5)' },
    img: { width: 24, height: 24, borderRadius: 12 },
    radioStyle: {
      marginBottom: 0,
      borderRadius: 0
    },
    button: {
      bottom: 0,
      gap: 12,
      width: '100%',
      backgroundColor: 'rgba(247, 248, 250, 0.75)',
      alignItems: 'center',
      paddingHorizontal: 20,
      position: 'absolute',
      paddingTop: 12
    },
    btn: {
      width: '100%'
    },
    searchBar: {
      backgroundColor: 'white',
      borderWidth: 0,
      marginBottom: 20,
      ...shadow6Style
    },
    sheetView: {
      backgroundColor: palette.graphite['050']
    },
    cancel: {
      color: palette.purple[800],
      bottom: 7
    },
    input: {
      flex: 1
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    choose: { marginTop: 12, marginBottom: 32, marginLeft: 20 },
    searchImg: {
      width: 90,
      height: 90
    },
    empty: {
      alignSelf: 'center',
      marginTop: 20,
      paddingHorizontal: 20
    },
    textAlign: {
      textAlign: 'center'
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    handle: {
      backgroundColor: palette.graphite['050'],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    clear: {
      color: palette.purple[800],
      marginTop: 20
    },
    textContainer: {
      gap: 8
    },
    emptyList: {
      alignItems: 'center',
      gap: 16
    },

    secure: {
      alignSelf: 'center',
      textAlign: 'center',
      paddingTop: 8,

      color: '#5D7278'
    }
  });
};

export default memo(BaseOptionList);
