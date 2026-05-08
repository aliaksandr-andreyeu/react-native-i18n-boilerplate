import { config } from '@/constants';
import { Permission, PermissionsAndroid, Platform, PlatformConstants } from 'react-native';

const { isIOS } = config;

type PlatformReleaseConstants = { Release: number; Version: number } & PlatformConstants;

const constants = Platform.constants as PlatformReleaseConstants;

const AndroidVersion = constants.Version || 33;
const AndroidRelease = constants.Release || 12;

const permissions = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED'
] as Permission[];

const VersionPermissions: Record<number, Permission[]> = {
  10: [],
  12: [permissions[0]],
  13: [],
  14: []
};

const currentPermissions = VersionPermissions[AndroidRelease] || [];

const checkAccess = async () => {
  try {
    for (let i = 0; i < currentPermissions.length; i++) {
      const permission = currentPermissions[i];
      const hasAccess = await PermissionsAndroid.check(permission);
      if (!hasAccess) return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const requestAccess = async () => {
  try {
    const request = await PermissionsAndroid.requestMultiple(currentPermissions);
    for (let i = 0; i < currentPermissions.length; i++) {
      const result = request[currentPermissions[i]];
      if (result !== 'granted') return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getAccessStatus = async () => {
  try {
    if (isIOS || !Boolean(currentPermissions?.length)) return true;
    const granted = await checkAccess();
    if (granted) return true;
    const request = await requestAccess();
    return request;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getAccessStatus;
