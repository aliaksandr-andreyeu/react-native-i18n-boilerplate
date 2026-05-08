export type Currencies =
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BRL'
  | 'BSD'
  | 'BTN'
  | 'BWP'
  | 'BYN'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHF'
  | 'CLP'
  | 'CNY'
  | 'COP'
  | 'CRC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'FOK'
  | 'GBP'
  | 'GEL'
  | 'GGP'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'IMP'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JEP'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KID'
  | 'KMF'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRU'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIO'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'SSP'
  | 'STN'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TRY'
  | 'TTD'
  | 'TVD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'UYU'
  | 'UZS'
  | 'VES'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XCD'
  | 'XDR'
  | 'XOF'
  | 'XPF'
  | 'YER'
  | 'ZAR'
  | 'ZMW'
  | 'ZWL';

export interface Currency {
  symbol: string;
  text: (val: any, emptyString?: boolean) => string;
  img: string;
}

export const currencyData: Record<Currencies, Currency> = {
  AED: { symbol: 'د.إ', text: (val, emptyString) => `د.إ${emptyString ? ' ' : ''}${val}`, img: '' },
  AFN: { symbol: '؋', text: (val, emptyString) => `؋${emptyString ? ' ' : ''}${val}`, img: '' },
  ALL: { symbol: 'L', text: (val, emptyString) => `L${emptyString ? ' ' : ''}${val}`, img: '' },
  AMD: { symbol: '֏', text: (val, emptyString) => `֏${emptyString ? ' ' : ''}${val}`, img: '' },
  ANG: { symbol: 'ƒ', text: (val, emptyString) => `ƒ${emptyString ? ' ' : ''}${val}`, img: '' },
  AOA: { symbol: 'Kz', text: (val, emptyString) => `Kz${emptyString ? ' ' : ''}${val}`, img: '' },
  ARS: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  AUD: { symbol: 'A$', text: (val, emptyString) => `A$${emptyString ? ' ' : ''}${val}`, img: '' },
  AZN: { symbol: '₼', text: (val, emptyString) => `₼${emptyString ? ' ' : ''}${val}`, img: '' },
  BAM: { symbol: 'KM', text: (val, emptyString) => `KM${emptyString ? ' ' : ''}${val}`, img: '' },
  BBD: { symbol: 'Bds$', text: (val, emptyString) => `Bds$${emptyString ? ' ' : ''}${val}`, img: '' },
  BDT: { symbol: '৳', text: (val, emptyString) => `৳${emptyString ? ' ' : ''}${val}`, img: '' },
  BGN: { symbol: 'лв', text: (val, emptyString) => `лв${emptyString ? ' ' : ''}${val}`, img: '' },
  BHD: { symbol: '.د.ب', text: (val, emptyString) => `.د.ب${emptyString ? ' ' : ''}${val}`, img: '' },
  BIF: { symbol: '₣', text: (val, emptyString) => `₣${emptyString ? ' ' : ''}${val}`, img: '' },
  BRL: { symbol: 'R$', text: (val, emptyString) => `R$${emptyString ? ' ' : ''}${val}`, img: '' },
  CAD: { symbol: 'C$', text: (val, emptyString) => `C$${emptyString ? ' ' : ''}${val}`, img: '' },
  CHF: { symbol: 'CHF', text: (val, emptyString) => `CHF${emptyString ? ' ' : ''}${val}`, img: '' },
  CLP: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  CNY: { symbol: '¥', text: (val, emptyString) => `¥${emptyString ? ' ' : ''}${val}`, img: '' },
  COP: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  CRC: { symbol: '₡', text: (val, emptyString) => `₡${emptyString ? ' ' : ''}${val}`, img: '' },
  CZK: { symbol: 'Kč', text: (val, emptyString) => `Kč${emptyString ? ' ' : ''}${val}`, img: '' },
  DKK: { symbol: 'kr', text: (val, emptyString) => `kr${emptyString ? ' ' : ''}${val}`, img: '' },
  DOP: { symbol: 'RD$', text: (val, emptyString) => `RD$${emptyString ? ' ' : ''}${val}`, img: '' },
  EUR: { symbol: '€', text: (val, emptyString) => `€${emptyString ? ' ' : ''}${val}`, img: '' },
  GBP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  GEL: { symbol: '₾', text: (val, emptyString) => `₾${emptyString ? ' ' : ''}${val}`, img: '' },
  GHS: { symbol: '₵', text: (val, emptyString) => `₵${emptyString ? ' ' : ''}${val}`, img: '' },
  HKD: { symbol: 'HK$', text: (val, emptyString) => `HK$${emptyString ? ' ' : ''}${val}`, img: '' },
  IDR: { symbol: 'Rp', text: (val, emptyString) => `Rp${emptyString ? ' ' : ''}${val}`, img: '' },
  INR: { symbol: '₹', text: (val, emptyString) => `₹${emptyString ? ' ' : ''}${val}`, img: '' },
  JPY: { symbol: '¥', text: (val, emptyString) => `¥${emptyString ? ' ' : ''}${val}`, img: '' },
  KES: { symbol: 'Ksh', text: (val, emptyString) => `Ksh${emptyString ? ' ' : ''}${val}`, img: '' },
  KRW: { symbol: '₩', text: (val, emptyString) => `₩${emptyString ? ' ' : ''}${val}`, img: '' },
  MYR: { symbol: 'RM', text: (val, emptyString) => `RM${emptyString ? ' ' : ''}${val}`, img: '' },
  NGN: { symbol: '₦', text: (val, emptyString) => `₦${emptyString ? ' ' : ''}${val}`, img: '' },
  PHP: { symbol: '₱', text: (val, emptyString) => `₱${emptyString ? ' ' : ''}${val}`, img: '' },
  RUB: { symbol: '₽', text: (val, emptyString) => `₽${emptyString ? ' ' : ''}${val}`, img: '' },
  USD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  ZAR: { symbol: 'R', text: (val, emptyString) => `R${emptyString ? ' ' : ''}${val}`, img: '' },
  CDF: { symbol: 'FC', text: (val, emptyString) => `FC${emptyString ? ' ' : ''}${val}`, img: '' },
  BWP: { symbol: 'P', text: (val, emptyString) => `P${emptyString ? ' ' : ''}${val}`, img: '' },
  DJF: { symbol: 'Fdj', text: (val, emptyString) => `Fdj${emptyString ? ' ' : ''}${val}`, img: '' },
  EGP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  ETB: { symbol: 'Br', text: (val, emptyString) => `Br${emptyString ? ' ' : ''}${val}`, img: '' },
  GMD: { symbol: 'D', text: (val, emptyString) => `D${emptyString ? ' ' : ''}${val}`, img: '' },
  KMF: { symbol: 'CF', text: (val, emptyString) => `CF${emptyString ? ' ' : ''}${val}`, img: '' },
  LSL: { symbol: 'L', text: (val, emptyString) => `L${emptyString ? ' ' : ''}${val}`, img: '' },
  MAD: { symbol: 'د.م.', text: (val, emptyString) => `د.م.${emptyString ? ' ' : ''}${val}`, img: '' },
  MUR: { symbol: '₨', text: (val, emptyString) => `₨${emptyString ? ' ' : ''}${val}`, img: '' },
  MWK: { symbol: 'MK', text: (val, emptyString) => `MK${emptyString ? ' ' : ''}${val}`, img: '' },
  NAD: { symbol: 'N$', text: (val, emptyString) => `N$${emptyString ? ' ' : ''}${val}`, img: '' },
  RWF: { symbol: 'R₣', text: (val, emptyString) => `R₣${emptyString ? ' ' : ''}${val}`, img: '' },
  SCR: { symbol: '₨', text: (val, emptyString) => `₨${emptyString ? ' ' : ''}${val}`, img: '' },
  SDG: { symbol: 'ج.س.', text: (val, emptyString) => `ج.س.${emptyString ? ' ' : ''}${val}`, img: '' },
  SOS: { symbol: 'Sh', text: (val, emptyString) => `Sh${emptyString ? ' ' : ''}${val}`, img: '' },
  SZL: { symbol: 'E', text: (val, emptyString) => `E${emptyString ? ' ' : ''}${val}`, img: '' },
  TND: { symbol: 'د.ت', text: (val, emptyString) => `د.ت${emptyString ? ' ' : ''}${val}`, img: '' },
  TZS: { symbol: 'TSh', text: (val, emptyString) => `TSh${emptyString ? ' ' : ''}${val}`, img: '' },
  UGX: { symbol: 'USh', text: (val, emptyString) => `USh${emptyString ? ' ' : ''}${val}`, img: '' },
  XOF: { symbol: 'CFA', text: (val, emptyString) => `CFA${emptyString ? ' ' : ''}${val}`, img: '' },
  ZMW: { symbol: 'ZK', text: (val, emptyString) => `ZK${emptyString ? ' ' : ''}${val}`, img: '' },
  BMD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  BND: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  BOB: { symbol: 'Bs.', text: (val, emptyString) => `Bs.${emptyString ? ' ' : ''}${val}`, img: '' },
  BSD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  BTN: { symbol: 'Nu.', text: (val, emptyString) => `Nu.${emptyString ? ' ' : ''}${val}`, img: '' },
  BYN: { symbol: 'Br', text: (val, emptyString) => `Br${emptyString ? ' ' : ''}${val}`, img: '' },
  BZD: { symbol: 'BZ$', text: (val, emptyString) => `BZ$${emptyString ? ' ' : ''}${val}`, img: '' },
  CUP: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  CVE: { symbol: 'Esc', text: (val, emptyString) => `Esc${emptyString ? ' ' : ''}${val}`, img: '' },
  DZD: { symbol: 'د.ج', text: (val, emptyString) => `د.ج${emptyString ? ' ' : ''}${val}`, img: '' },
  ERN: { symbol: 'Nfk', text: (val, emptyString) => `Nfk${emptyString ? ' ' : ''}${val}`, img: '' },
  FJD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  FKP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  FOK: { symbol: 'kr', text: (val, emptyString) => `kr${emptyString ? ' ' : ''}${val}`, img: '' },
  GGP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  GIP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  GNF: { symbol: 'FG', text: (val, emptyString) => `FG${emptyString ? ' ' : ''}${val}`, img: '' },
  GTQ: { symbol: 'Q', text: (val, emptyString) => `Q${emptyString ? ' ' : ''}${val}`, img: '' },
  GYD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  HNL: { symbol: 'L', text: (val, emptyString) => `L${emptyString ? ' ' : ''}${val}`, img: '' },
  HRK: { symbol: 'kn', text: (val, emptyString) => `kn${emptyString ? ' ' : ''}${val}`, img: '' },
  HTG: { symbol: 'G', text: (val, emptyString) => `G${emptyString ? ' ' : ''}${val}`, img: '' },
  HUF: { symbol: 'Ft', text: (val, emptyString) => `Ft${emptyString ? ' ' : ''}${val}`, img: '' },
  ILS: { symbol: '₪', text: (val, emptyString) => `₪${emptyString ? ' ' : ''}${val}`, img: '' },
  IMP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  IQD: { symbol: 'ع.د', text: (val, emptyString) => `ع.د${emptyString ? ' ' : ''}${val}`, img: '' },
  IRR: { symbol: '﷼', text: (val, emptyString) => `﷼${emptyString ? ' ' : ''}${val}`, img: '' },
  ISK: { symbol: 'kr', text: (val, emptyString) => `kr${emptyString ? ' ' : ''}${val}`, img: '' },
  JEP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  JMD: { symbol: 'J$', text: (val, emptyString) => `J$${emptyString ? ' ' : ''}${val}`, img: '' },
  JOD: { symbol: 'د.ا', text: (val, emptyString) => `د.ا${emptyString ? ' ' : ''}${val}`, img: '' },
  KGS: { symbol: 'лв', text: (val, emptyString) => `лв${emptyString ? ' ' : ''}${val}`, img: '' },
  KHR: { symbol: '៛', text: (val, emptyString) => `៛${emptyString ? ' ' : ''}${val}`, img: '' },
  KID: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  KWD: { symbol: 'د.ك', text: (val, emptyString) => `د.ك${emptyString ? ' ' : ''}${val}`, img: '' },
  KYD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  KZT: { symbol: '₸', text: (val, emptyString) => `₸${emptyString ? ' ' : ''}${val}`, img: '' },
  LAK: { symbol: '₭', text: (val, emptyString) => `₭${emptyString ? ' ' : ''}${val}`, img: '' },
  LBP: { symbol: 'ل.ل', text: (val, emptyString) => `ل.ل${emptyString ? ' ' : ''}${val}`, img: '' },
  LKR: { symbol: 'Rs', text: (val, emptyString) => `Rs${emptyString ? ' ' : ''}${val}`, img: '' },
  LRD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  LYD: { symbol: 'ل.د', text: (val, emptyString) => `ل.د${emptyString ? ' ' : ''}${val}`, img: '' },
  MDL: { symbol: 'L', text: (val, emptyString) => `L${emptyString ? ' ' : ''}${val}`, img: '' },
  MGA: { symbol: 'Ar', text: (val, emptyString) => `Ar${emptyString ? ' ' : ''}${val}`, img: '' },
  MKD: { symbol: 'ден', text: (val, emptyString) => `ден${emptyString ? ' ' : ''}${val}`, img: '' },
  MMK: { symbol: 'Ks', text: (val, emptyString) => `Ks${emptyString ? ' ' : ''}${val}`, img: '' },
  MNT: { symbol: '₮', text: (val, emptyString) => `₮${emptyString ? ' ' : ''}${val}`, img: '' },
  MOP: { symbol: 'P', text: (val, emptyString) => `P${emptyString ? ' ' : ''}${val}`, img: '' },
  MRU: { symbol: 'UM', text: (val, emptyString) => `UM${emptyString ? ' ' : ''}${val}`, img: '' },
  MVR: { symbol: 'Rf', text: (val, emptyString) => `Rf${emptyString ? ' ' : ''}${val}`, img: '' },
  MXN: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  MZN: { symbol: 'MT', text: (val, emptyString) => `MT${emptyString ? ' ' : ''}${val}`, img: '' },
  NIO: { symbol: 'C$', text: (val, emptyString) => `C$${emptyString ? ' ' : ''}${val}`, img: '' },
  NOK: { symbol: 'kr', text: (val, emptyString) => `kr${emptyString ? ' ' : ''}${val}`, img: '' },
  NPR: { symbol: 'Rs', text: (val, emptyString) => `Rs${emptyString ? ' ' : ''}${val}`, img: '' },
  NZD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  OMR: { symbol: 'ر.ع.', text: (val, emptyString) => `ر.ع.${emptyString ? ' ' : ''}${val}`, img: '' },
  PAB: { symbol: 'B/.', text: (val, emptyString) => `B/.${emptyString ? ' ' : ''}${val}`, img: '' },
  PEN: { symbol: 'S/', text: (val, emptyString) => `S/${emptyString ? ' ' : ''}${val}`, img: '' },
  PGK: { symbol: 'K', text: (val, emptyString) => `K${emptyString ? ' ' : ''}${val}`, img: '' },
  PKR: { symbol: 'Rs', text: (val, emptyString) => `Rs${emptyString ? ' ' : ''}${val}`, img: '' },
  PLN: { symbol: 'zł', text: (val, emptyString) => `zł${emptyString ? ' ' : ''}${val}`, img: '' },
  PYG: { symbol: '₲', text: (val, emptyString) => `₲${emptyString ? ' ' : ''}${val}`, img: '' },
  QAR: { symbol: 'ر.ق', text: (val, emptyString) => `ر.ق${emptyString ? ' ' : ''}${val}`, img: '' },
  RON: { symbol: 'lei', text: (val, emptyString) => `lei${emptyString ? ' ' : ''}${val}`, img: '' },
  RSD: { symbol: 'дин.', text: (val, emptyString) => `дин.${emptyString ? ' ' : ''}${val}`, img: '' },
  SAR: { symbol: 'ر.س', text: (val, emptyString) => `ر.س${emptyString ? ' ' : ''}${val}`, img: '' },
  SBD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  SEK: { symbol: 'kr', text: (val, emptyString) => `kr${emptyString ? ' ' : ''}${val}`, img: '' },
  SGD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  XAF: { symbol: 'CFA', text: (val, emptyString) => `CFA${emptyString ? ' ' : ''}${val}`, img: '' },
  XCD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  XDR: { symbol: 'SDR', text: (val, emptyString) => `SDR${emptyString ? ' ' : ''}${val}`, img: '' },
  XPF: { symbol: '₣', text: (val, emptyString) => `₣${emptyString ? ' ' : ''}${val}`, img: '' },
  YER: { symbol: '﷼', text: (val, emptyString) => `﷼${emptyString ? ' ' : ''}${val}`, img: '' },
  ZWL: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  SHP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  SLL: { symbol: 'Le', text: (val, emptyString) => `Le${emptyString ? ' ' : ''}${val}`, img: '' },
  SRD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  SSP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  STN: { symbol: 'Db', text: (val, emptyString) => `Db${emptyString ? ' ' : ''}${val}`, img: '' },
  SYP: { symbol: '£', text: (val, emptyString) => `£${emptyString ? ' ' : ''}${val}`, img: '' },
  THB: { symbol: '฿', text: (val, emptyString) => `฿${emptyString ? ' ' : ''}${val}`, img: '' },
  TJS: { symbol: 'ЅМ', text: (val, emptyString) => `ЅМ${emptyString ? ' ' : ''}${val}`, img: '' },
  TMT: { symbol: 'm', text: (val, emptyString) => `m${emptyString ? ' ' : ''}${val}`, img: '' },
  TOP: { symbol: 'T$', text: (val, emptyString) => `T$${emptyString ? ' ' : ''}${val}`, img: '' },
  TRY: { symbol: '₺', text: (val, emptyString) => `₺${emptyString ? ' ' : ''}${val}`, img: '' },
  TTD: { symbol: 'TT$', text: (val, emptyString) => `TT$${emptyString ? ' ' : ''}${val}`, img: '' },
  TVD: { symbol: '$', text: (val, emptyString) => `$${emptyString ? ' ' : ''}${val}`, img: '' },
  TWD: { symbol: 'NT$', text: (val, emptyString) => `NT$${emptyString ? ' ' : ''}${val}`, img: '' },
  UAH: { symbol: '₴', text: (val, emptyString) => `₴${emptyString ? ' ' : ''}${val}`, img: '' },
  UYU: { symbol: '$U', text: (val, emptyString) => `$U${emptyString ? ' ' : ''}${val}`, img: '' },
  UZS: { symbol: 'лв', text: (val, emptyString) => `лв${emptyString ? ' ' : ''}${val}`, img: '' },
  VES: { symbol: 'Bs.', text: (val, emptyString) => `Bs.${emptyString ? ' ' : ''}${val}`, img: '' },
  VND: { symbol: '₫', text: (val, emptyString) => `₫${emptyString ? ' ' : ''}${val}`, img: '' },
  VUV: { symbol: 'Vt', text: (val, emptyString) => `Vt${emptyString ? ' ' : ''}${val}`, img: '' },
  WST: { symbol: 'WS$', text: (val, emptyString) => `WS$${emptyString ? ' ' : ''}${val}`, img: '' }
};

const getCurrency = (currency: Currencies) => {
  const targetCurrency = currencyData[currency];
  if (!targetCurrency)
    return { symbol: '', text: (value: any, emptyString?: boolean) => `${emptyString ? ' ' : ''}${value}`, img: '' };
  return targetCurrency;
};

export default getCurrency;
