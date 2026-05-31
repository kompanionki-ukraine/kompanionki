import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

const SOURCE = require("../../../assets/logo.jpeg");

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** App logo. Square aspect ratio — pass `size` for both width and height. */
export default function Logo({ size = 96, style }: Props) {
  return (
    <Image
      source={SOURCE}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
