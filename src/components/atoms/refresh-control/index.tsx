import React, { forwardRef } from 'react';
import { useTheme } from '@react-navigation/native';
import { RefreshControl, RefreshControlProps } from 'react-native';

const BaseRefreshControl = forwardRef<RefreshControl, RefreshControlProps>(({ colors, tintColor, ...rest }, ref) => {
  const theme = useTheme();
  const {
    palette: { purple }
  } = theme;
  const spinnerColor = purple['500'] || 'black';

  const refreshColors = colors || [spinnerColor];
  const refreshTintColor = tintColor || spinnerColor;

  return <RefreshControl ref={ref} colors={refreshColors} tintColor={refreshTintColor} {...rest} />;
});

export default BaseRefreshControl;
