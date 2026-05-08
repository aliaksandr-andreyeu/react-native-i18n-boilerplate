const fs = require('fs');
const path = require('path');

const filenames = {
  coreToken: path.join(__dirname, '../src/constants/theme/design/Core/Core.json'),
  lightThemeToken: path.join(__dirname, '../src/constants/theme/design/Themes/Light.json'),
  darkThemeToken: path.join(__dirname, '../src/constants/theme/design/Themes/Dark.json'),
  colors: path.join(__dirname, '../src/constants/theme/tokens/colors.json'),
  lightTheme: path.join(__dirname, '../src/constants/theme/tokens/lightTheme.json'),
  darkTheme: path.join(__dirname, '../src/constants/theme/tokens/darkTheme.json')
};

const getToken = (fileName) => {
  try {
    const raw = fs.readFileSync(fileName);
    const json = JSON.parse(raw);
    return json;
  } catch (error) {
    console.error;
    return;
  }
};

const setToken = (fileName, json) => {
  try {
    const token = JSON.stringify(json, null, 4);
    fs.writeFileSync(fileName, token);
  } catch (error) {
    console.error;
  }
};

const coreToken = getToken(filenames.coreToken);
const lightThemeToken = getToken(filenames.lightThemeToken);
const darkThemeToken = getToken(filenames.darkThemeToken);

const findValueByPath = (obj, path) => {
  const paths = path.split('.');
  let current = obj;
  let i = 0;
  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
};

const transformTheme = (theme, base) => {
  const obj = {};
  if (!base && !coreToken) {
    return obj;
  }

  Object.keys(theme).forEach((key) => {
    const item = theme[key];
    const newKey = String(key).toLowerCase();
    const { value, type } = item || {};
    if (value && type) {
      obj[newKey] = value;
      if (!base && type === 'color' && typeof value === 'string') {
        const color = String(value).replace(/{|}/g, '');
        const colorItem = findValueByPath(coreToken, color);
        const { value: colorValue } = colorItem || {};
        if (colorValue) {
          obj[newKey] = colorValue;
        }
      }
    } else {
      obj[newKey] = transformTheme(item, base);
    }
  });
  return obj;
};

const colorsJSON = transformTheme(coreToken, true);
const lightThemeJSON = transformTheme(lightThemeToken);
const darkThemeJSON = transformTheme(darkThemeToken);

setToken(filenames.colors, colorsJSON);
setToken(filenames.lightTheme, lightThemeJSON);
setToken(filenames.darkTheme, darkThemeJSON);
