const ideasHub = {
  investmentIdeas:
    '/ca-investment-ideas?populate=*&pagination[page]=0&pagination[pageSize]=50&filters[ca_investment_idea_categories][publishedAt][$null]=false&sort[0]=publishedAt:desc',
  investmentIdeasCategories:
    '/ca-investment-idea-categories?populate=ca_investment_ideas&pagination[page]=0&pagination[pageSize]=100&filters[ca_investment_ideas][publishedAt][$null]=false',
  investmentIdeasByCategoryId: (id: number | null, page: number = 1) =>
    `/ca-investment-ideas?populate=*&pagination[page]=${page}&pagination[pageSize]=19${
      id !== null ? `&filters[ca_investment_idea_categories][id][$eq]=${id}` : ''
    }&sort[0]=createdAt:desc`,
  investmentIdeaById: (id: number) =>
    `/ca-investment-ideas?populate=*&pagination[page]=0&pagination[pageSize]=100&filters[id][$eq]=${id}`,
  watchWidget: (page: number) =>
    `/ca-what-to-watch-articles?populate=*&pagination[page]=${page}&pagination[pageSize]=19&sort[0]=createdAt:desc`,
  watchWidgetById: (id: number) => `/ca-what-to-watch-articles?populate=*&filters[id][$eq]=${id}`,
  winnersAndLosers: (time: string) =>
    `/ca-top-movers-articles?pagination[limit]=-1&populate=*&filters[createdAt][$gte]=${time}`,
  promotions: (lang: string) =>
    `/promotions?populate[promoBanner][populate]=*&populate[visibilityRestrictions][populate]=*&filters[promoVisibility][mobileApp][$eq]=true&filters[visibilityByJurisdiction][stlucia][$eq]=true&locale=${lang}`,
  promotionById: ({ pId, lang }: { pId: number; lang: string }) =>
    `/promotions/${pId}?populate[promoPage][populate]=*&populate[visibilityRestrictions][populate]=*&locale=${lang}`,
  getPromoContest: (id: number) => `/contest/${id}`,
  getContestLeaders: (id: number) => `/contest/${id}/leaders`,
  participateContest: (id: number) => `/contest/${id}/participate`,
  getPromoIcons: (
    id: number,
    layout: string = 'layout.info-block',
    field: string = 'infoBlockElement',
    iconField: string = 'icon'
  ) => `/promotions/${id}?populate[promoPage][on][${layout}][populate][${field}][populate][0]=${iconField}`,
  registerForWebinar: '/joinwebinar/existing-user'
};

export default ideasHub;
