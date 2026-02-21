import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence,
    FadeInUp
} from "react-native-reanimated";
import { BrandLogo } from "../../components/BrandLogo";

const { width, height } = Dimensions.get("window");

export default function EntryScreen() {
  const router = useRouter();

  // Animation values for the "Breathing" background
  const blobOffset = useSharedValue(0);

  useEffect(() => {
    blobOffset.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 5000 }),
        withTiming(0, { duration: 5000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBlobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: blobOffset.value },
      { translateX: blobOffset.value * 0.5 },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* 1. ANIMATED DYNAMIC BACKGROUND */}
      <Animated.View style={[styles.blob, styles.blobYellow, animatedBlobStyle]} />
      <Animated.View style={[styles.blob, styles.blobBlue, animatedBlobStyle]} />

      <View style={styles.content}>
        {/* 2. HEADER SECTION with Fade Animation */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
          <BrandLogo size={90} />
          <Text style={styles.title}>Samanvay</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BY JINESHWAR YUVA MANDAL</Text>
          </View>
        </Animated.View>

        {/* 3. INTERACTIVE PATH SELECTION */}
        <View style={styles.cardContainer}>
          
          {/* PATH 1: MEMBER ACCESS */}
          <Animated.View entering={FadeInUp.delay(400)}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/join")}
              style={styles.cardWrapper}
            >
              <BlurView intensity={70} tint="light" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(33, 48, 122, 0.08)", "rgba(255, 255, 255, 0.5)"]}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="people-outline" size={28} color="#21307A" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Member Access</Text>
                    <Text style={styles.cardDesc}>
                      Join a Mandal or manage your profile
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#21307A" />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* PATH 2: CREATE NEW MANDAL (Admin Path) */}
          <Animated.View entering={FadeInUp.delay(600)}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/create")}
              style={styles.cardWrapper}
            >
              <BlurView intensity={70} tint="light" style={[styles.glassCard, styles.goldBorder]}>
                <LinearGradient
                  colors={["rgba(255, 215, 0, 0.12)", "rgba(255, 255, 255, 0.5)"]}
                  style={styles.cardGradient}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#FFD700" }]}>
                    <Ionicons name="business-outline" size={28} color="#21307A" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Organization</Text>
                    <Text style={styles.cardDesc}>
                      Register your Mandal on the suite
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#21307A" />
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 4. FOOTER */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.footer}>
            <Text style={styles.footerText}>Unified Mandal Management Suite</Text>
            <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v1.0 Premium</Text>
            </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  blob: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    opacity: 0.12,
  },
  blobYellow: { top: -height * 0.15, right: -width * 0.3, backgroundColor: "#FFD700" },
  blobBlue: { bottom: -height * 0.1, left: -width * 0.4, backgroundColor: "#21307A" },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  header: { alignItems: "center" },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#21307A",
    marginTop: 10,
    letterSpacing: -1.5,
  },
  badge: {
    backgroundColor: "rgba(33, 48, 122, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#21307A",
    letterSpacing: 1,
  },
  cardContainer: { gap: 18 },
  cardWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    // Modern Shadow
    shadowColor: "#21307A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  glassCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  goldBorder: { borderColor: "rgba(255, 215, 0, 0.4)" },
  cardGradient: { padding: 24, flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  cardText: { flex: 1, marginLeft: 18 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#21307A" },
  cardDesc: { fontSize: 13, color: "#64748B", marginTop: 4, lineHeight: 18 },
  footer: { alignItems: "center", gap: 8 },
  footerText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  versionBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  versionText: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "bold",
  }
});