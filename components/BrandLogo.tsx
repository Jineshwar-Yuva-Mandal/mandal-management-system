import { Image, StyleSheet, View, ViewStyle } from "react-native";

interface Props {
  size?: number;
  style?: ViewStyle;
}

export const BrandLogo = ({ size = 100, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../assets/images/brand-logo.png")} // Make sure path is correct
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    // Subtle glow effect to make the logo pop
    shadowColor: "#21307A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 50, // Circular container for the logo
  },
});
