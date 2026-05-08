import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase, StackActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  ScrollView
} from 'react-native';
import RNWebView, { WebView as Web, WebViewNavigation } from 'react-native-webview';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import { PaymentInfoStatus } from '@/store/slices/wallet/types';
import { WebViewMessageEvent, WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import { useAppDispatch, useAppSelector, useCallAccountWallets, useDepositTracking, useIntercom } from '@/hooks';
import { actions } from '@/store';
import { useTranslation } from 'react-i18next';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Clipboard from '@react-native-clipboard/clipboard';
import HTMLParser from 'react-native-html-parser';
import { ToastType, useToast } from '@/providers';
import { appsFlyerLogEvent, AppsFlyerEventTypes } from '@/helpers';

type WebViewScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.WebView>;

const {
  headerBar: { height },
  buttons: { activeOpacity },
  isIOS
} = config;

const {
  application: { openModal }
} = actions;

const error_cases = [
  'https://client.amega.capital/payment/error',
  'https://my.amega.capital/payment/error',
  'https://my.amega.capital/login',
  'https://my.amega.capital/logout',

  'https://my.amega.capital/payment/error',
  'https://my.amega.capital/login',
  'https://my.amega.capital/logout',

  'https://client.amega.capital/login',
  'https://client.amega.capital/logout'
];
const success = [
  'https://client.amega.capital/payment/success',
  'https://my.amega.capital/payment/success',
  '/payment/success'
];

const processing = [
  'https://client.amega.capital/payment/processing',
  'https://my.amega.capital/payment/processing',
  '/payment/processing'
];

const injectScripts = `
  (function() {

   const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=2.0, user-scalable=yes');
    document.getElementsByTagName('head')[0].appendChild(meta);
    true;

    let observer;
    let actionIsDone = false;
    
    function renderHTML() {

      if(!actionIsDone){
        const NaceButton = document.querySelector('.paydevpaybtn');
        if (NaceButton){
          NaceButton.click();
          actionIsDone = true;
        }
      }

      function handleClick(event) {
        window.ReactNativeWebView.postMessage('confirmed');
        if(observer)observer.disconnect();
      }
  
      const classNames = ['btnpay']
      classNames.forEach(name => {
        const divs = document.getElementsByClassName(name);
        const divsAsArray = Array.from(divs)
        if(!divsAsArray.length)retrun;
        divsAsArray.forEach(item=>item.addEventListener('click',handleClick));
      });
    }

    observer = new MutationObserver((mutations) => {
      renderHTML();
    });

    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });

    renderHTML();

  })();
`;

const parseHtmlDataDalaPay = (html: string) => {
  const doc = new HTMLParser.DOMParser().parseFromString(html, 'text/html');
  const rows = doc.getElementsByTagName('tr');

  let parsedData: Record<string, string> = {};

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length === 2) {
      const key = cells[0].textContent
        .replace(/(\S+)\s+(\S+)/, (_: string, a: string, b: string) => `${a} ${b.toLowerCase()}`)
        .trim();
      const value = cells[1].textContent.replace(/click to copy/gi, '').trim();
      parsedData[key] = value;
    }
  }

  return parsedData;
};

const parseHtmlDataLetKnow = (html: string) => {
  const parsedData: Record<string, string> = {};

  const qrLabelMatch = html.match(/<div[^>]*class="[^"]*letknow-gray[^"]*"[^>]*>\s*([^<]+?)\s*<\/div>/);
  const qrLabel = qrLabelMatch?.[1].replace(/\s+/g, ' ').replace(/:\s*$/, '').trim();

  const regex = /<div[^>]*>\s*([^:<]+):\s*(.*?)\s*<\/div>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const key = match[1].trim();
    if (qrLabel && key === qrLabel) continue;
    const value = match[2].replace(/<[^>]+>/g, '').trim();
    parsedData[key] = value;
  }

  const addressMatch = html.match(/data-clipboard-text="([^"]+)"/);
  if (addressMatch) {
    parsedData['Address'] = addressMatch[1];
  }

  const qrMatch = html.match(/<img[^>]+src="data:image\/png;base64,([^"]+)"/);
  if (qrLabel && qrMatch) {
    parsedData[qrLabel] = qrMatch[1];
  }

  const notesMatch = html.match(/<div class="col-sm-12 letknow-notes">\s*((?:<div>.*?<\/div>\s*)+)<\/div>/);
  if (notesMatch) {
    const notesHtml = notesMatch[1];
    const notes = [...notesHtml.matchAll(/<div>(.*?)<\/div>/g)].map((m) => m[1].trim());
    parsedData['Notes'] = notes.join('\n');
  }

  return parsedData;
};

const excludedKeysLetknowPay = ['Notes', 'Provisional Exchange Rate'];
const customIUPSPIds = [263, 265];

const WebView: React.FC<WebViewScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();

  const updateTracking = useDepositTracking();
  const callWallets = useCallAccountWallets();
  const { intercomPresent } = useIntercom();
  const { openToast, closeToast } = useToast();

  const { bottom } = useSafeAreaInsets();

  const webviewRef = useRef<Web>(null);

  const styles = useStyles(theme);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const redirectUrl = route.params.redirectUrl;
  const content = route.params?.content;
  const isDeposit = route.params.isDeposit;
  const provider = route.params.provider;
  const transactionId = route.params.transactionId;

  const accounts = useAppSelector((store) => store.wallet[isDeposit ? 'depositAccounts' : 'withdrawAccounts']);

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};
  const { id: userId, firstDepositDate } = userInfo || {};

  const balance =
    accounts.find((item) => item.type.clientPermissions[isDeposit ? 'canDeposit' : 'canWithdraw'])?.balance ?? 0;

  const isContent = useMemo(() => content !== undefined, [content]);

  const goToInfo = (status: PaymentInfoStatus) => {
    if (navigation.isFocused()) {
      callWallets();
      navigation.navigate(ROOT_ROUTE_NAMES.App);
      if (status === 'error') {
        showPopUp({
          title: t('screens.deposit.deposit-unsuccessful'),
          subTitle: t('screens.deposit.deposit-unsuccessful-subtitle'),
          closeTime: 5,
          icon: images.depositError,
          iconSize: {
            width: 96,
            height: 90
          },
          button: {
            text: t('screens.deposit.try-again'),
            onPress: tryAgain
          },
          secondaryButton: {
            text: t('screens.deposit.contact-support'),
            onPress: openSupportChat
          }
        });
      } else if (status === 'pending') {
        showPopUp({
          title: t('screens.deposit.deposit-pending'),
          subTitle: t('screens.deposit.deposit-pending-subtitle'),
          closeTime: 5,
          icon: images.depositPending,
          iconSize: {
            width: 115,
            height: 90
          },
          secondaryButton: {
            text: t('screens.deposit.contact-support'),
            onPress: openSupportChat
          }
        });
      } else if (status === 'success') {
        showPopUp({
          title: t('screens.deposit.deposit-successful'),
          subTitle: t('screens.deposit.deposit-successful-subtitle'),
          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      }
    }
  };

  const tryAgain = () => navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: isDeposit });

  const openSupportChat = () => {
    intercomPresent();
  };

  const goToWallet = () => {
    callWallets();
    closeToast();
    navigation.dispatch(StackActions.pop(3));
  };

  const appsFlyerLogDeposit = async () => {
    if (!isDeposit || !userId) {
      return;
    }

    const { currency = '', amount = 0, provider } = route.params || {};
    const { method = 'N/A' } = provider || {};

    const isFirstDeposit = Boolean(firstDepositDate === null);

    try {
      await appsFlyerLogEvent(AppsFlyerEventTypes.Deposit, {
        af_user_id: userId,
        af_order_id: transactionId ? String(transactionId) : 'N/A',
        af_currency: currency,
        af_revenue: String(amount),
        af_payment_method: method || 'N/A',
        af_is_first_deposit: isFirstDeposit
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isDeposit && userId) {
      updateTracking({ step: 3, completed: true });
      appsFlyerLogDeposit();
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      goToWallet();
      return true;
    });

    return backHandler.remove;
  }, [isDeposit, userId, firstDepositDate]);

  const RenderLoading = useCallback(() => {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.loader}>
        <ActivityIndicator color={theme.palette.graphite['900']} size={'large'} />
        <BaseText variant={BaseTextVariant.caption}>{t('screens.webview.redirecting')}...</BaseText>
      </Animated.View>
    );
  }, [theme.dark, t]);

  const findCase = (status: PaymentInfoStatus, url: string) => {
    const loop = (cases: string[]) => {
      for (let i = 0; i < cases.length; i++) {
        const currentCase = cases[i];
        if (url.startsWith(currentCase)) return true;
      }
      return false;
    };

    switch (status) {
      case 'error':
        return loop(error_cases);

      case 'pending':
        return loop(processing);

      case 'success':
        return loop(success);

      default:
        return false;
    }
  };

  const handleUrl = useCallback(
    (e: WebViewNavigation) => {
      const url = e.url;
      const updateComplete = () => {
        if (isDeposit) {
          updateTracking({ step: 3, completed: true });
          appsFlyerLogDeposit();
        }
      };

      const updateError = () => isDeposit && updateTracking({ step: 3, completed: false });

      if (findCase('error', url)) {
        updateError();
        goToInfo('error');
      } else if (findCase('pending', url)) {
        updateComplete();
        goToInfo('pending');
      } else if (findCase('success', url)) {
        updateComplete();
        goToInfo('success');
      }
    },
    [isDeposit]
  );

  const showPopUp = useCallback(
    ({ title = '', subTitle, button, secondaryButton, closeTime, icon, iconSize }: Partial<DefaultModalConfig>) => {
      dispatch(
        openModal({
          title,
          subTitle,
          icon,
          iconSize,
          button,
          secondaryButton,
          closeTime
        })
      );
    },
    []
  );

  const source = useMemo(
    (): WebViewSource => (isContent ? { html: content || '' } : { uri: redirectUrl }),
    [redirectUrl, isContent, content]
  );

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    if (e.nativeEvent.data === 'confirmed') {
      goToInfo('pending');
    }
  }, []);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);

    openToast({
      center: true,
      desc: t('screens.webview.copied'),
      descIcon: <SvgIcon size={IconSize.sm} name={SvgXmlIconNames.fileCopy} color={theme.palette.icon.base.strong} />,
      type: ToastType.regular
    });
  };

  const hasIframe = useCallback((html?: string) => {
    if (!html) return false;
    return /<iframe[^>]+src=(['"]?)([^'"\s>]+)\1/i.test(html);
  }, []);

  const bottomPadding = useMemo(() => ({ paddingBottom: bottom > 34 ? bottom : 34 }), [bottom]);

  if (isContent && content && !hasIframe(content)) {
    const title = route.params.provider.title;
    const isDalapay = title.includes('DalaPay');
    const providerId = route.params.provider.id;
    const isLetKnowOrBinancePayTitle = title.includes('LetKnow') || title.includes('BinancePay');
    const isCustomUIPSP = customIUPSPIds.includes(providerId);
    const isLetKnowOrBinancePay = isLetKnowOrBinancePayTitle || isCustomUIPSP;
    if (isDalapay || isLetKnowOrBinancePay) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView>
            <ProgressHeader
              image={provider.image}
              title={provider.title}
              hideProgressBar
              leftIconType={SvgXmlIconNames.arrowLeft}
              stepsCount={0}
              currentStep={0}
              onBackPressed={goToWallet}
            />
            <View style={[styles.contentContainer, bottomPadding]}>
              <View>
                <View style={styles.contentHeader}>
                  <BaseText variant={BaseTextVariant.title}>{t('screens.webview.make-a-deposit')}</BaseText>
                  <BaseText variant={BaseTextVariant.small} style={styles.grayText}>
                    {t('screens.webview.balance', { balance })}
                  </BaseText>
                </View>
                <View style={styles.contentCardContainer}>
                  <BaseText variant={BaseTextVariant.small} style={styles.grayText}>
                    {t('screens.webview.bank-details')}
                  </BaseText>
                  <View style={[styles.contentBody, styles.shadow]}>
                    {isDalapay
                      ? Object.entries(parseHtmlDataDalaPay(content)).map(([key, value]) => (
                          <View key={key} style={styles.contentValueRow}>
                            <BaseText variant={BaseTextVariant.small} style={styles.grayTextTeritary}>
                              {key}
                            </BaseText>
                            <View style={styles.contentValueContainer}>
                              <BaseText variant={BaseTextVariant.small} style={styles.contentValue}>
                                {value}
                              </BaseText>
                              <Pressable hitSlop={8} onPress={() => copyToClipboard(value)}>
                                <SvgIcon
                                  name={SvgXmlIconNames.copy}
                                  size={IconSize.xs}
                                  color={theme.palette.icon.base.strong}
                                />
                              </Pressable>
                            </View>
                          </View>
                        ))
                      : Object.entries(parseHtmlDataLetKnow(content)).map(([key, value]) => {
                          const keyIsNotes = key === 'Notes';

                          const onCopy = () => copyToClipboard(value);

                          return (
                            <View key={key} style={styles.contentValueRow}>
                              {keyIsNotes || (
                                <BaseText variant={BaseTextVariant.small} style={styles.grayTextTeritary}>
                                  {key}
                                </BaseText>
                              )}
                              <View style={styles.contentValueContainer}>
                                {key?.includes?.('scan it using') ? (
                                  !!value?.length ? (
                                    <BaseImage
                                      source={{ uri: `data:image/png;base64,${value}` }}
                                      style={styles.qr}
                                      resizeMode='contain'
                                    />
                                  ) : null
                                ) : (
                                  <>
                                    <BaseText
                                      variant={BaseTextVariant.small}
                                      style={[styles.contentValue, keyIsNotes && styles.noteContentValue]}
                                    >
                                      {value}
                                    </BaseText>
                                    {excludedKeysLetknowPay.includes(key) || (
                                      <Pressable hitSlop={8} onPress={onCopy}>
                                        <SvgIcon
                                          name={SvgXmlIconNames.copy}
                                          size={IconSize.xs}
                                          color={theme.palette.icon.base.strong}
                                        />
                                      </Pressable>
                                    )}
                                  </>
                                )}
                              </View>
                            </View>
                          );
                        })}
                  </View>
                </View>
              </View>
              <BaseButton
                onPress={goToWallet}
                size={BaseButtonSize.large}
                type={BaseButtonType.primary}
                label={t('screens.webview.close')}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={activeOpacity} hitSlop={5} onPress={goToWallet}>
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.container}>
        <RNWebView
          accessibilityLabel='ph-no-capture'
          ref={webviewRef}
          startInLoadingState={true}
          originWhitelist={isContent ? ['*'] : undefined}
          renderLoading={RenderLoading}
          injectedJavaScript={injectScripts}
          scalesPageToFit={false}
          onNavigationStateChange={handleUrl}
          source={source}
          onMessage={onMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background.card.primary
    },
    loader: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 9,
      backgroundColor: palette.graphite['050'],
      gap: 10
    },
    header: {
      width: '100%',
      height: height,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'flex-start',
      backgroundColor: palette.graphite['050']
    },
    grayText: {
      color: palette.text.title.secondary
    },
    contentContainer: {
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      flex: 1
    },
    grayTextTeritary: {
      color: palette.text.base.tertiary,
      flex: 1
    },

    contentValue: {
      textAlign: 'right',
      flex: 1
    },
    noteContentValue: { textAlign: 'left' },
    contentValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1
    },
    contentHeader: {
      gap: 8,
      paddingVertical: 12
    },
    contentCardContainer: {
      gap: 12,
      paddingVertical: 12
    },
    contentBody: {
      paddingVertical: 12,
      gap: 4,
      paddingHorizontal: 16,
      backgroundColor: palette.background.card.primary,
      borderRadius: 12
    },
    contentValueRow: {
      paddingVertical: 12,
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    shadow: {
      shadowColor: '#8A9092',
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6
    },
    qr: { width: 150, height: 150, marginLeft: 'auto' }
  });

export default WebView;
