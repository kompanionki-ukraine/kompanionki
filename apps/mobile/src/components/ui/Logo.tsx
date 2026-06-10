import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

// Alias needed to avoid "spaghetti" in imports
const SOURCE = require("../../../assets/logo.jpeg");

type LogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** App logo. Square aspect ratio — pass `size` for both width and height. */
const Logo = ({ size = 96, style }: LogoProps) => (
  <Image
    source={SOURCE}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);

export default Logo;
