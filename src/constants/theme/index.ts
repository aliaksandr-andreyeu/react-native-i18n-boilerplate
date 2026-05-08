import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { coreToken, darkThemeToken, lightThemeToken } from './tokens';

const { color: coreColors } = coreToken;
const { color: darkThemeColors } = darkThemeToken;
const { color: lightThemeColors } = lightThemeToken;

const palette = {
  ...coreColors
};
const chart = [
  palette.red['500'],
  palette.green['500'],
  palette.yellow['500'],
  palette.purple['500'],
  palette.blue['500'],
  palette.graphite['500'],
  palette.red['700'],
  palette.green['700'],
  palette.yellow['700'],
  palette.purple['700'],
  palette.blue['700'],
  palette.graphite['700'],
  palette.red['300'],
  palette.green['300'],
  palette.yellow['300'],
  palette.purple['300'],
  palette.blue['300'],
  palette.graphite['300'],
  palette.red['900'],
  palette.green['900'],
  palette.yellow['900'],
  palette.purple['900'],
  palette.blue['900'],
  palette.graphite['900']
];

export interface UserTheme extends Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  palette: typeof coreColors & typeof darkThemeColors & typeof lightThemeColors;
  chart: typeof chart;
}

const lightTheme: UserTheme = {
  ...DefaultTheme,
  colors: {
    primary: palette.graphite['900'],
    background: palette.graphite['050'],
    card: '#f1f5ff',
    text: palette.graphite['900'],
    border: palette.graphite['900'],
    notification: palette.graphite['900'],
    secondary: palette.purple['500'],
    accent: palette.green['400']
  },
  palette: {
    ...palette,
    ...lightThemeColors
  },
  chart
};

const darkTheme: UserTheme = {
  ...DarkTheme,
  colors: {
    primary: palette.graphite['900'],
    background: palette.graphite['050'],
    card: '#f1f5ff',
    text: palette.graphite['900'],
    border: palette.graphite['900'],
    notification: palette.graphite['900'],
    secondary: palette.purple['500'],
    accent: palette.green['400']
  },
  palette: {
    ...palette,
    ...lightThemeColors
    // ...darkThemeColors //@@@ DARK Theme not implemented yet
  },
  chart
};

const theme = {
  lightTheme,
  darkTheme
};

export default theme;
