const testIDs = {
  tabBar: {
    pulse: 'tab_pulse',
    ideasHub: 'tab_ideashub',
    portfolio: 'tab_portfolio',
    markets: 'tab_markets',
    wallet: 'tab_wallet'
  },
  intro: {
    signIn: 'intro_signin'
  },
  pulse: {
    header: {
      profile: 'pulse_header_profile',
      signIn: 'pulse_header_signin',
      signUp: 'pulse_header_signup'
    }
  },
  ideasHub: {
    scrollView: 'ideashub_scroll_view',
    verifyBanner: 'ideashub_verify_banner',
    separator: {
      container: 'ideashub_separator_container',
      topContainer: 'ideashub_separator_top_container'
    },
    header: {
      profile: 'ideashub_header_profile',
      signIn: 'ideashub_header_signin',
      signUp: 'ideashub_header_signup'
    },
    promotions: 'ideashub_promotions',
    watchWidget: 'ideashub_watch_widget',
    signalsWidget: 'ideashub_signals_widget',
    ideasBanner: 'ideashub_ideas_banner',
    winnersAndLosersWidget: 'ideashub_winners_and_losers_widget',
    refreshControl: 'ideashub_refresh_control'
  },
  promotionDetails: {
    heroBanner: (id: string | number) => `promotion_details_hero_banner_${id}`,
    actionButton: (action: any) => `promotion_details_action_button_${action}`,
    infoBlock: (id: string | number) => `promotion_details_info_block_${id}`,
    scrollView: 'promotion_details_scrollView',
    infoText: 'promotion_details_infoText',
    actionContainer: 'promotion_details_action_container'
  },
  widgetArticle: {
    scrollView: 'widgetArticle_scrollView',
    imageBackground: 'widgetArticle_imageBackground',
    backButton: 'widgetArticle_backButton',
    category: 'widgetArticle_category',
    articelTitle: 'widgetArticle_articleTitle',
    shortDescription: 'widgetArticle_shortDescription'
  },
  portfolio: {
    history: {
      dealCard: (ticket: string | number) => `portfolio_history_dealCard_${ticket}`,
      sectionList: 'portfolio_history_sectionList',
      seectionHeaderText: (text: string) => `portfolio_history_sectionHeaderText_${text}`,
      indicator: 'portfolio_history_indicator'
    },
    overview: {
      formattedPositionValue: 'portfolio_overview_formattedPositionValue',
      viewItem: {
        button: (id: string | number) => `portfolio_overview_viewItem_button_${id}`,
        dataLabelContainer: 'portfolio_overview_viewItem_dataLabelWrapper',
        dataLabel: 'portfolio_overview_viewItem_dataLabel',
        checkIconContainer: 'portfolio_overview_viewItem_checkIconWrapper',
        checkIcon: 'portfolio_overview_viewItem_checkIcon'
      },
      cardListHeader: {
        container: 'portfolio_overview_cardListHeader_container',
        name: 'portfolio_overview_cardListHeader_name',
        currentValue: 'portfolio_overview_cardListHeader_currentValue',
        pnl: 'portfolio_overview_cardListHeader_pnl'
      },
      cardItem: {
        button: (id: string | number) => `portfolio_overview_cardItem_button_${id}`,
        cardAssetContainer: 'portfolio_overview_cardItem_cardAssetContainer',
        cardImage: 'portfolio_overview_cardItem_cardImage',
        cardLabel: 'portfolio_overview_cardItem_cardLabel',
        percentageValue: 'portfolio_overview_cardItem_percentageValue',
        positionValue: 'portfolio_overview_cardItem_positionValue',
        pnlValue: 'portfolio_overview_cardItem_pnlValue'
      },
      viewSelector: {
        button: (id: string | number) => `portfolio_overview_viewSelector_button_${id}`,
        label: 'portfolio_overview_viewSelector_label',
        icon: 'portfolio_overview_viewSelector_icon'
      },
      charPagination: {
        container: 'portfolio_overview_charPagination_container',
        button: (id: string | number) => `portfolio_overview_charPagination_button_${id}`
      },
      scrollView: 'portfolio_overview_scrollView',
      title: 'portfolio_overview_title',
      flingGesture: 'portfolio_overview_flingGesture',
      chartWrapper: 'portfolio_overview_chartWrapper',
      chartInfoWrapper: 'portfolio_overview_chartInfoWrapper',
      nothingHereYet: 'portfolio_overview_nothing_here_yet',
      flatList: 'portfolio_overview_flatList',
      buttonContainer: 'portfolio_overview_button_container',
      goToSignal: 'portfolio_overview_goToSignals',
      goToMarket: 'portfolio_overview_goToMarket',
      filterListContainer: 'portfolio_overview_filterListContainer',
      filterListTitle: 'portfolio_overview_filterListTitle'
    },
    positions: {
      flatList: 'portfolio_positions_flatList',
      subTitle: 'portfolio_positions_subTitle',
      positionCard: (ticket: string | number) => `portfolio_positions_positionCard_${ticket}`
    },
    orders: {
      flatList: 'portfolio_orders_flatList'
    },
    positionDetails: {
      buttonEdit: 'Edit',
      buttonBuy: 'Buy',
      buttonSell: 'Sell',
      buttonDelete: 'Delete'
    },
    navigatorTabContainer: 'portfolio_navigatorTab_container',
    navigatorTab: 'portfolio_navigatorTab',
    completeVerification: 'portfolio_complete_verification',
    header: {
      profile: 'portfolio_header_profile',
      signIn: 'portfolio_header_signin',
      signUp: 'portfolio_header_signup'
    },
    tabs: {
      overview: 'portfolio_tabs_overview',
      positions: 'portfolio_tabs_positions',
      history: 'portfolio_tabs_history',
      orders: 'portfolio_tabs_orders'
    },
    tabWrapper: 'portfolio_tabWrapper',
    selectedDate: 'portfolio_selectedDate',
    clearDate: 'portfolio_clear_date',
    selectDateModal: 'portfolio_select_date_modal',
    positionInfo: {
      buySellWhenPrice: 'portfolio_positionInfo_buySellWhenPrice',
      stopLossPrice: 'portfolio_positionInfo_stopLossPrice',
      takeProfitPrice: 'portfolio_positionInfo_takeProfitPrice'
    }
  },
  signin: {
    facebookSignin: 'signin_facebook_signin',
    googleSignin: 'signin_google_signin',
    email: 'signin_email',
    password: 'signin_password',
    rememberMe: 'signin_remember_me',
    submit: 'signin_submit'
  },
  forgotPassword: {
    emailInput: 'forgotPassword_email_input',
    continueButton: 'forgotPassword_continue_button',
    backButton: 'forgotPassword_back_button'
  },
  resetPassword: {
    title: 'resetPassword_title',
    desc: 'resetPassword_desc',
    pinInput: 'resetPassword_pinInput',
    passwordInput: 'resetPassword_passwordInput',
    confirmPasswordInput: 'resetPassword_confirmPasswordInput',
    submitButton: 'resetPassword_submitButton',
    resendButton: 'resetPassword_resendButton',
    backButton: 'resetPassword_backButton'
  },
  signup: {
    facebookSignup: 'signup_facebook_signup',
    googleSignup: 'signup_google_signup'
  },
  markets: {
    header: {
      profile: 'markets_header_profile',
      signIn: 'markets_header_signin',
      signUp: 'markets_header_signup'
    },
    screen: {
      searchInput: 'markets_screen_search_input',
      assetsList: 'markets_screen_asset_list',
      assetCard: (name: string) => `markets_screen_asset_card_${name}`,
      verifyBanner: 'markets_screen_verify_banner',
      verifyFooterBanner: 'markets_screen_verify_footer_banner',
      emptyBlockWrapper: 'markets_screen_empty_block_wrapper',
      emptyBlockImage: 'markets_screen_empty_block_image',
      emptyBlockText: 'markets_screen_empty_block_text',
      loader: 'markets_screen_loader',
      cancelButton: 'markets_screen_cancel_button'
    }
  },
  wallet: {
    header: {
      profile: 'wallet_header_profile',
      signUp: 'wallet_header_signup',
      signIn: 'wallet_header_signin'
    },
    screen: {
      tradingBanner: {
        makeDeposit: 'wallet_screen_trading_banner_make_deposit',
        transferFunds: 'wallet_screen_trading_banner_transfer_funds',
        exploreTrading: 'wallet_screen_trading_banner_explore_trading'
      },
      walletCard: {
        whole: 'wallet_screen_wallet_card_whole',
        container: 'wallet_screen_wallet_card_container',
        cashback: 'wallet_screen_wallet_card_cashback',
        userIB: 'wallet_screen_wallet_card_user_ib'
      },
      mainWallet: {
        whole: 'wallet_screen_main-wallet_whole',
        container: 'wallet_screen_main-wallet_container'
      },
      helpButton: {
        transfer: 'wallet_screen_help_button_transfer',
        mainWallet: 'wallet_screen_help_button_main_wallet',
        welcomeAccount: 'wallet_screen_help_button_welcome_account',
        mainTrading: 'wallet_screen_help_button_main_trading'
      },
      modal: {
        bottomSheetRef: 'wallet_screen_bottom_sheet_ref',
        bottomSheetFlagRef: 'wallet_screen_bottom_sheet_flag_ref',
        bottomSheetZeroBalanceRef: 'wallet_screen_bottom_sheet_zero_balance_ref',
        bottomSheetUnauthorizedRef: 'wallet_screen_bottom_sheet_unauthorized_ref'
      },
      tradingGuideButton: 'wallet_screen_trading_guide_button',
      scrollContent: 'wallet_screen_scroll_contenty',
      totalBalance: 'wallet_screen_total_balance',
      welcomeBanner: 'wallet_screen_welcome_banner',
      ideasWidget: 'wallet_screen_ideas_widget'
    }
  },
  rewardsWallet: {
    header: {
      transactionsHistory: 'rewards_wallet_header_transactions_history',
      goBack: 'rewards_wallet_header_go_back'
    }
  },
  depositForUnverified: {
    header: {
      profile: 'deposit_for_unverified_header_profile',
      signUp: 'deposit_for_unverified_header_signup',
      signIn: 'deposit_for_unverified_header_signin'
    }
  },
  profile: {
    personalDetails: 'profile_personal_details',
    paymentDetails: 'profile_payment_details',
    legalDocuments: 'profile_legal_documents',
    changeEmail: 'profile_change_email',
    changePassword: 'profile_change_password',
    manage2FactorAuthentication: 'profile_manage_2_factor_authentication',
    manageLinkedAccounts: 'manage_linked_accounts',
    emailNotifications: 'profile_email_notifications',
    pushNotifications: 'profile_push_notifications',
    notificationsLanguage: 'profile_notifications_language',
    appLanguage: 'profile_app_language',
    singOut: 'profile_sign_out',
    changePhone: 'changePhone',
    emailNotificationsSettings: {
      systemSwitch: (value: boolean) => `profile_emailNotificationsSettings_systemSwitch@${Boolean(value)}`,
      promotionsSwitch: (value: boolean) => `profile_emailNotificationsSettings_promotionsSwitch@${Boolean(value)}`,
      marketUpdatesSwitch: (value: boolean) =>
        `profile_emailNotificationsSettings_marketUpdatesSwitch@${Boolean(value)}`,
      remindersSwitch: (value: boolean) => `profile_emailNotificationsSettings_remindersSwitch@${Boolean(value)}`,
      tradingUpdatesSwitch: (value: boolean) =>
        `profile_emailNotificationsSettings_tradingUpdatesSwitch@${Boolean(value)}`
    }
  },
  assetDetails: {
    trades: {
      createPosition: {
        successPopUp: 'assetDetails_trades_createPosition_success'
      }
    }
  },
  createPositionDetails: {
    createPosition: {
      successPopUp: 'createPositionDetails_createPosition_success'
    }
  },
  positionDetails: {
    createPosition: {
      successPopUp: 'positionDetails_createPosition_success'
    }
  },
  positions: {
    createPosition: {
      successPopUp: 'positions_createPosition_success'
    }
  },
  components: {
    atoms: {
      positionItem: {
        container: (ticket: string | number) => `position-item-${ticket}`,
        touchable: (ticket: string | number) => `position-touchable-${ticket}`,
        profit: (ticket: string | number) => `position-profit-${ticket}`,
        closeButton: (ticket: string | number) => `components_atoms_positionItem_closeButton_${ticket}`,
        infoContainer: (type: string | number) => `components_atoms_positionItem_infoContainer_${type}`,
        list: `components_atoms_positionItem_list`
      },
      positionCard: {
        positionsContainer: 'components_atoms_positionCard_positionsContainer',
        positionButton: 'components_atoms_positionCard_positionsButton',
        head: {
          container: 'components_atoms_positionCard_head_container',
          image: 'components_atoms_positionCard_head_image',
          symbol: 'components_atoms_positionCard_head_symbol',
          fullName: 'components_atoms_positionCard_head_fullName'
        },
        profitContainer: 'components_atoms_positionCard_profitContainer',
        profit: 'components_atoms_positionCard_profit',
        bottomContainer: 'components_atoms_positionCard_bottomContainer',
        infoContainer: {
          container: (type: string) => `components_atoms_positionCard_infoContainer_type_${type}_container`,
          info: (type: string) => `components_atoms_positionCard_infoContainer_type_${type}_info`
        }
      },
      loader: {
        modal: 'base-loader-modal',
        indicator: 'base-loader-activity-indicator',
        container: 'base-loader-container'
      },
      donutChart: {
        first: {
          container: 'components_atoms_donutChart_first_container',
          svg: 'components_atoms_donutChart_first_svg',
          g: 'components_atoms_donutChart_first_g',
          circle: 'donut-placeholder'
        },
        second: {
          container: 'components_atoms_donutChart_second_container',
          svg: 'components_atoms_donutChart_second_svg',
          g: (idx: string | number) => `components_atoms_donutChart_second_g_${idx}`,
          circle: (idx: string | number) => `donut-segment-${idx}`
        }
      },
      widget: {
        button: 'widget-touchable',
        image: 'widget-image'
      },
      baseMarketTabs: {
        container: 'components_atoms_baseMarketTabs_container',
        tab: (id: string | number) => `components_atoms_baseMarketTabs_tab_${id}`,
        contentLoader: 'components_atoms_baseMarketTabs_contentLoader'
      },
      tabbar: {
        scrollView: 'components_atoms_tabbar_scrollView'
      },
      calendarButton: {
        button: 'calendar-button'
      }
    },
    molecules: {
      accessBlurOverlay: {
        container: 'components_molecules_accessBlurOverlay_container',
        firstButton: 'components_molecules_accessBlurOverlay_first-button',
        secondButton: 'components_molecules_accessBlurOverlay_second-button'
      },
      accountDelete: {
        deleteMyAccount: 'components.molecules.account-delete.delete-my-account',
        cancelDeletion: 'components.molecules.account-delete.cancel-deletion',
        deleteRequestProcess: 'components.molecules.account-delete.delete-request-process',
        yesDelete: 'components.molecules.account-delete.yes-delete',
        goBack: 'components.molecules.account-delete.go-back'
      },
      animatedDot: {
        container: 'components.molecules.animatedDot.container'
      },
      articleDisclaimer: {
        container: 'components.molecules.articleDisclaimer.article-disclaimer-container'
      },
      assetCandlestickChart: {},
      assetDetailsTabs: {
        overview: {
          buttonBuy: 'Buy',
          buttonSell: 'Sell'
        }
      },
      assetLineChart: {},
      baseBlackBanner: {
        bannerTitle: 'components.molecules.baseBlackBanner.bannerTitle',
        bannerButton: 'components.molecules.baseBlackBanner.bannerButton',
        bannerImage: 'components.molecules.baseBlackBanner.bannerImage'
      },
      calendarWeekNames: {
        sun: 'components.molecules.calendarWeekNames.sun',
        mon: 'components.molecules.calendarWeekNames.mon',
        tue: 'components.molecules.calendarWeekNames.tue',
        wed: 'components.molecules.calendarWeekNames.wed',
        thu: 'components.molecules.calendarWeekNames.thu',
        fri: 'components.molecules.calendarWeekNames.fri',
        sat: 'components.molecules.calendarWeekNames.sat'
      },
      caption: {
        label: 'components.molecules.caption.label',
        helpButton: 'components.molecules.caption.helpButton',
        goToButton: 'components.molecules.caption.goToButton'
      },
      copy: {
        button: (text: string) => `components_molecules_copy_button_${text}`
      },
      countdownTimer: {
        timeBlock: {
          days: 'timeblock-days',
          hours: 'timeblock-hours',
          minutes: 'timeblock-minutes',
          seconds: 'timeblock-seconds'
        },
        digit: (label: string, index: number) => `countdown-digit-${label}-${index}`
      },
      dateSelector: {
        closeButton: 'components_molecules_dateSelector_closeButton',
        confirmButton: 'components_molecules_dateSelector_confirmButton',
        calendarContainer: 'components_molecules_dateSelector_calendarContainer',
        header: {
          container: 'components_molecules_dateSelector_container',
          month: 'components_molecules_dateSelector_month',
          year: 'components_molecules_dateSelector_year'
        },
        arrow: {
          left: 'components_molecules_dateSelector_arrow_left',
          right: 'components_molecules_dateSelector_arrow_right'
        },
        calendar: {
          dayButton: (day: string) => `component_molecules_dateSelector_calendar_day_button_${day}`,
          day: (day: string) => `component_molecules_dateSelector_calendar_day_${day}`,
          dayWrap: 'component_molecules_dateSelector_calendar_dayWrap',
          dayInside: 'component_molecules_dateSelector_calendar_dayInside'
        }
      },
      dealCard: {
        assetName: 'dealActivity-asset-name',
        activityTime: 'dealActivity-time',
        activityValue: 'dealActivity-value'
      },
      faq: {
        answer: 'faq-answer',
        button: (id: string | number) => `components_molecules_faq_button_${id}`
      },
      formField: {},
      guideButton: {
        container: 'guide_button-container'
      },
      ideaCard: {},
      infoBlock: {
        image: (index: number) => `info-block-image-${index}`
      },
      infoTable: {
        container: 'info-table-container',
        row: (index: number) => `info-table-row-${index}`,
        primaryText: (index: number) => `info-table-primary-${index}`,
        secondaryText: (index: number) => `info-table-secondary-${index}`
      },
      leaderBoard: {
        seeAll: 'components_molecules_leaderBoard_seeAll',
        place: (id: string | number) => `components_molecules_leaderBoard_place_${id}`
      },
      modal: {},
      optionList: {},
      otpInput: {},
      paymentDetail: {},
      portfolioEmptyContainer: {
        container: 'components_molecules_portfolioEmptyContainer_container',
        image: 'components_molecules_portfolioEmptyContainer_image',
        bottomContainer: 'components_molecules_portfolioEmptyContainer_bottomContainer',
        textContainer: 'components_molecules_portfolioEmptyContainer_textContainer',
        title: 'components_molecules_portfolioEmptyContainer_title',
        subTitle: 'components_molecules_portfolioEmptyContainer_subTitle',
        button: 'components_molecules_portfolioEmptyContainer_button'
      },
      promoDocs: {
        button: (id: string | number) => `components_molecules_promoDocs_button_${id}`
      },
      promoFaq: {},
      promoNumberSheet: {},
      promoTestimonials: {
        list: 'components_molecules_promoTestimonials_flatList',
        testimonial: (id: string | number) => `components_molecules_promoTestimonials_testimonial_${id}`
      },
      promoTimer: {},
      promotions: {
        container: 'components.molecules.promotions_container',
        flatList: 'components.molecules.promotions_flatList',
        scrollDots: 'components.molecules.promotions_scrollDots',
        loader: 'components.molecules.promotions_loader',
        seperator: 'components.molecules.promotions_seperator',
        seperatorUp: 'components.molecules.promotions_seperatorUp',
        seperatorDown: 'components.molecules.promotions_seperatorDown',
        loaderScroll: 'components.molecules.promotions_loaderScroll',
        card: (id: number) => `components.molecules.promotions_card_${id}`,
        dot: (index: number) => `components.molecules.promotions_dot_${index}`
      },
      progressHeader: {},
      riskWarning: {},
      search: {},
      segmentsGroup: {
        list: 'components_molecules_segmentsGroup_list',
        item: (item: string | number) => `components_molecules_segmentsGroup_segment_${item}`
      },
      sheetBackdrop: {},
      signalCard: {
        column: 'components_signal_card_column',
        columnTitle: 'components_signal_card_columnTitle',
        columnValue: 'components_signal_card_columnValue',

        progressBarWrapper: 'components_signal_card_progressBarWrapper',
        progressBarHeader: 'components_signal_card_progressBarHeader',
        confidenceLabel: 'components_signal_card_confidenceLabel',
        confidenceValue: 'components_signal_card_confidenceValue',
        progressBar: 'components_signal_card_progressBar',
        progressFilled: 'components_signal_card_progressFilled',

        actionButton: 'components_signal_card_actionButton',
        actionButtonLabel: 'components_signal_card_actionButtonLabel',

        rowWrapper: 'components_signal_card_rowWrapper',
        rowTitle: 'components_signal_card_rowTitle',
        rowValue: 'components_signal_card_rowValue',

        liveWrapper: 'components_signal_card_liveWrapper',
        liveIcon: 'components_signal_card_liveIcon',
        liveLabel: 'components_signal_card_liveLabel',

        logo: 'components_signal_card_logo',

        top: 'components_signal_card_top',
        topRow: 'components_signal_card_topRow',
        topLeft: 'components_signal_card_topLeft',

        symbol: 'components_signal_card_symbol',

        roiLabel: 'components_signal_card_roiLabel',
        roiValue: 'components_signal_card_roiValue',
        roi: 'components_signal_card_roi',

        rowsWrapper: 'components_signal_card_rowsWrapper',

        from: 'components_signal_card_from',
        to: 'components_signal_card_to',
        expires: 'components_signal_card_expires',

        priceContainer: 'components_signal_card_priceContainer',
        priceShow: 'components_signal_card_priceShow',
        priceShowValue: 'components_signal_card_priceShowValue'
      },
      simpleCountdown: {},
      singleDateSelector: {
        date: 'components_molecules_singleDateSelector_date',
        hours: 'components_molecules_singleDateSelector_hours',
        reset: 'components_molecules_singleDateSelector_reset',
        datePicker: 'components_molecules_singleDateSelector_datePicker',
        submit: 'components_molecules_singleDateSelector_submit'
      },
      tagGroup: {},
      toast: {},
      tradingBanner: {
        container: 'components_molecules_tradingBanner_container',
        containerTop: 'components_molecules_tradingBanner_container_top',
        title: 'components_molecules_tradingBanner_title',
        subTitle: 'components_molecules_tradingBanner_subTitle',
        image: 'components_molecules_tradingBanner_image',
        button: 'components_molecules_tradingBanner_button',
        buttonText: 'components_molecules_tradingBanner_buttonText'
      },
      transactionCard: {},
      transactionForm: {},
      transferCard: {},
      unrecievedEmail: {},
      upcomingEventTopics: {
        upcomingEvent: (event: string | number) => `promotion_details_upcoming_details_${event}`
      },
      verificationBanner: {
        container: 'components.molecules.verificationBanner.container',
        image: 'components.molecules.verificationBanner.image',
        title: 'components.molecules.verificationBanner.title',
        button: 'components.molecules.verificationBanner.button'
      },
      watchWidget: {
        container: 'watch_widget_container',
        loaderWrapper: 'watch_widget_loader_wrapper',
        loader: 'watch_widget_loader',
        scrollView: 'watch_widget_scrollview',
        card: (id: string | number) => `watch_widget_card_${id}`,
        banner: 'watch_widget_banner'
      },
      welcomeBanner: {
        container: 'components_molecules_welcome_banner'
      },
      winnerLosersCard: {},
      ideasBanner: {
        button: 'components_molecules_ideasBanner_button'
      }
    },
    organisms: {
      assetChart: {
        activityIndicator: 'components_organisms_assetChart_activityIndicator'
      },
      winnersAndLosersWidget: {
        container: 'components_organisms_winnersAndLosersWidget_container',
        caption: 'components_organisms_winnersAndLosersWidget_caption',
        list: 'components_organisms_winnersAndLosersWidget_list',
        item: (id: string | number) => `components_organisms_winnersAndLosersWidget_item_${id}`,
        separator: {
          root: 'components_organisms_winnersAndLosersWidget_separator_root',
          up: 'components_organisms_winnersAndLosersWidget_separator_up',
          down: 'components_organisms_winnersAndLosersWidget_separator_down'
        }
      },
      signalsWidget: {
        container: 'signalsWidget_container',
        caption: 'signalsWidget_caption',
        loader: 'signalsWidget_loader',

        blurred: {
          root: 'signalsWidget-blurred-root',
          lockImage: 'signalsWidget-blurred-lockImage',
          title: 'signalsWidget-blurred-title',
          subtitle: 'signalsWidget-blurred-subtitle',
          signUpBtn: 'signalsWidget-blurred-signUpBtn',
          signInBtn: 'signalsWidget-blurred-signInBtn',
          verificationBtn: 'signalsWidget-blurred-verificationBtn'
        },

        error: {
          root: 'signalsWidget-error-root',
          title: 'signalsWidget-error-title',
          desc: 'signalsWidget-error-desc',
          retryBtn: 'signalsWidget-error-retryBtn',
          retryText: 'signalsWidget-error-retryText'
        },

        empty: {
          root: 'signalsWidget-empty-root',
          img: 'signalsWidget-empty-img',
          title: 'signalsWidget-empty-title',
          desc: 'signalsWidget-empty-desc'
        },

        list: {
          scrollView: 'signalsWidget-list-scrollView',
          blurItem: (index: number) => `signalsWidget-list-blurItem-${index}`,
          card: (id: string | number) => `signalsWidget-list-card-${id}`
        },

        guide: {
          modal: 'signalsWidget-guide-modal',
          closeBtn: 'signalsWidget-guide-closeBtn',
          image: 'signalsWidget-guide-image',
          doNotShowBtn: 'signalsWidget-guide-doNotShowBtn',
          button: 'signalsWidget-guide-button'
        },

        premium: {
          button: 'signalsWidget-premium-button'
        }
      },
      createPosition: {
        sheet: 'components_organisms_createPosition_sheet',
        content: 'components_organisms_createPosition_content',

        guidance: {
          root: 'components_organisms_createPosition_guidance_root',
          image: 'components_organisms_createPosition_guidance_image',
          title: 'components_organisms_createPosition_guidance_title',
          subtitle: 'components_organisms_createPosition_guidance_subtitle',
          button: 'components_organisms_createPosition_guidance_button'
        },

        caption: {
          root: 'components_organisms_createPosition_caption_root',
          title: 'components_organisms_createPosition_caption_title',
          desc: 'components_organisms_createPosition_caption_desc',
          orderTypeButton: 'components_organisms_createPosition_caption_orderTypeButton',
          orderTypeLabel: 'components_organisms_createPosition_caption_orderTypeLabel'
        },

        signalInfo: 'components_organisms_createPosition_signalInfo',
        marketToast: 'components_organisms_createPosition_marketToast',

        amount: {
          headerRow: 'components_organisms_createPosition_amount_headerRow',
          label: 'components_organisms_createPosition_amount_label',
          range: 'components_organisms_createPosition_amount_range',
          grid: 'components_organisms_createPosition_amount_grid',
          button: (amount: number) => `components_organisms_createPosition_amount_button_${amount}`,
          input: 'components_organisms_createPosition_amount_input'
        },

        pending: {
          actionWhenPriceLabel: 'components_organisms_createPosition_pending_actionWhenPriceLabel',
          priceInput: 'components_organisms_createPosition_pending_priceInput',
          dateRow: 'components_organisms_createPosition_pending_dateRow',
          dateButton: 'components_organisms_createPosition_pending_dateButton',
          dateClearBtn: 'components_organisms_createPosition_pending_dateClearBtn',
          datePicker: 'components_organisms_createPosition_pending_datePicker'
        },

        summary: {
          root: 'components_organisms_createPosition_summary_root',
          positionValueLabel: 'components_organisms_createPosition_summary_positionValueLabel',
          positionValue: 'components_organisms_createPosition_summary_positionValue',
          requiredMarginLabel: 'components_organisms_createPosition_summary_requiredMarginLabel',
          requiredMarginValue: 'components_organisms_createPosition_summary_requiredMarginValue'
        },

        footer: {
          buttonsRow: 'components_organisms_createPosition_footer_buttonsRow',
          settingsBtn: 'components_organisms_createPosition_footer_settingsBtn',
          submitBtn: 'components_organisms_createPosition_footer_submitBtn'
        }
      }
    },
    templates: {
      app: {
        createPosition: {
          successPopUp: 'components_templates_app_createPosition_success'
        },
        deleteBottomSheetContent: {
          title: 'components_templates_app_deleteBottomSheetContent_title',
          buttonsContainer: 'components_templates_app_deleteBottomSheetContent_buttonsContainer',
          deleteButton: 'components_templates_app_deleteBottomSheetContent_deleteButton',
          cancelButton: 'components_templates_app_deleteBottomSheetContent_cancelButton'
        },
        closePositionContent: {
          container: 'components_templates_app_closePositionContent_container',
          symbol: 'components_templates_app_closePositionContent_symbol',
          input: 'components_templates_app_closePositionContent_input',
          validationError: 'components_templates_app_closePositionContent_validationError',
          closeValue: 'components_templates_app_closePositionContent_closeValue',
          segmentsContainer: 'components_templates_app_closePositionContent_segmentsContainer',
          realisedPnLContaner: 'components_templates_app_closePositionContent_realisedPnLContaner',
          confirmButton: 'components_templates_app_closePositionContent_confirmButton'
        },
        orderTypeSelector: {
          button: (key: string) => `components_templates_app_orderTypeSelector_button_${key}`
        },
        accountsList: {
          container: 'components_templates_app_accountsList_container',
          title: 'components_templates_app_accountsList_title',
          loader: 'components_templates_app_accountsList_loader',
          accountItem: (login: string) => `components_templates_app_accountsList_item_${login}`
        },
        pulse: {
          openPosition: {
            amountInput: 'components_templates_app_pulse_openPosition_amountInput',
            buySellWhenPriceInput: 'components_templates_app_pulse_openPosition_buySellWhenPriceInput',
            takeProfitInput: 'components_templates_app_pulse_openPosition_takeProfitInput',
            stopLossInput: 'components_templates_app_pulse_openPosition_stopLossInput',
            takeProfitSwitch: 'components_templates_app_pulse_openPosition_takeProfitSwitch',
            stopLossSwitch: 'components_templates_app_pulse_openPosition_stopLossSwitch',
            amountRange: 'components_templates_app_pulse_openPosition_amountRange',
            oneUnitValue: 'components_templates_app_pulse_openPosition_oneUnitValue'
          },
          positionModal: {
            modal: 'components_templates_app_pulse_positionModal_modal',
            successContent: 'components_templates_app_pulse_positionModal_successContent',
            errorContent: 'components_templates_app_pulse_positionModal_errorContent',
            orderType: 'components_templates_app_pulse_positionModal_orderType',
            positionValue: 'components_templates_app_pulse_positionValue_orderType',
            margin: 'components_templates_app_pulse_margin_orderType',
            goToPortfolio: 'components_templates_app_pulse_positionModal_goToPortfolio',
            continueTrading: 'components_templates_app_pulse_positionModal_continueTrading'
          }
        }
      }
    }
  }
};

export default testIDs;
