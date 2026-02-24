import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";

interface Props {
  size?: number;
  style?: ViewStyle;
}

export const BrandLogo = ({ size = 100, style }: Props) => {
  // We define a fixed size for the white background
  const containerSize = size * 1.5;

  return (
    <View style={[styles.shadowWrapper, style]}>
      <View 
        style={[
          styles.circle, 
          { 
            width: containerSize, 
            height: containerSize, 
            borderRadius: containerSize / 2 // This creates the perfect circle
          }
        ]}
      >
        <Image
          source={require("../assets/images/brand-logo.png")}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // We move the shadow to a wrapper because overflow: 'hidden' 
  // on the circle often cuts off the shadow on iOS.
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // This crops the image/background into the circle shape
  },
});