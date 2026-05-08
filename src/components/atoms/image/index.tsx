import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import FastImage, { FastImageProps, ImageStyle as FastImageStyle } from 'react-native-fast-image';

interface BaseImage extends Omit<FastImageProps, 'style' | 'source'> {
  style?: StyleProp<ImageStyle | FastImageStyle>;
  source?: any;
}

const BaseImage = ({ style, source, ...rest }: BaseImage) => {
  return <FastImage style={style as FastImageStyle} source={source} {...rest} />;
};

export default BaseImage;
