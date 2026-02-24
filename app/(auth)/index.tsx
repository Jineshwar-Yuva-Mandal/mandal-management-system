import { BrandLogo } from "@/components/BrandLogo";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import versionData from "../../version.json";
import { supabase } from "../../lib/supabase";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  Layout,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function EntryScreen() {
  const router = useRouter();

  // UI State
  const [viewMode, setViewMode] = useState<"entry" | "login">("entry");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // Background Animation Values
  const floatValue = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatValue.value * 40 },
      { scale: 1 + floatValue.value * 0.1 },
    ],
    opacity: 0.5 + floatValue.value * 0.2,
  }));

  // Client-Side Validation Logic
  const handleLogin = async () => {
    setLoading(true);
    setErrors({});

    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setErrors({ email: authError.message });
      setLoading(false);
      return;
    }

    // 2. Fetch User Role from 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      setErrors({ email: "Could not retrieve user role." });
      setLoading(false);
      return;
    }

    // 3. Routing based on Role
    if (profile.role === 'admin') {
      router.replace("/(admin)");
    } else {
      router.replace("/(member)");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* 1. DYNAMIC BACKGROUND (No Horizontal Scroll) */}
      <View style={styles.bgWrapper}>
        <Animated.View
          style={[styles.abstractCircle, styles.circle1, animatedBgStyle]}
        />
        <Animated.View
          style={[styles.abstractCircle, styles.circle2, animatedBgStyle]}
        />
      </View>

      <View style={styles.safeContent}>
        {/* 2. ADAPTIVE BRANDING */}
        <Animated.View layout={Layout.springify()} style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#21307A", "#3A4EB0"]}
              style={styles.logoGradient}
            >
              <BrandLogo size={90} />
            </LinearGradient>
          </View>
          <Text style={styles.mainTitle}>Samanvay</Text>
          <Text style={styles.subTitle}>
            {viewMode === "entry"
              ? "Seamless Mandal Management"
              : "Secure Member Login"}
          </Text>
        </Animated.View>

        {/* 3. DYNAMIC CONTENT AREA */}
        <View style={styles.actionSection}>
          {viewMode === "entry" ? (
            <Animated.View
              key="entry"
              entering={FadeInDown.springify()}
              exiting={SlideOutLeft}
            >
              <TouchableOpacity
                onPress={() => router.push("/(auth)/join")}
                style={styles.cardContainer}
              >
                <BlurView intensity={25} style={styles.blurCard}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="person-add" size={24} color="#21307A" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>Member Portal</Text>
                    <Text style={styles.cardSublabel}>
                      Join your local Mandal
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/create")}
                style={[styles.cardContainer, { marginTop: 16 }]}
              >
                <BlurView intensity={25} style={styles.blurCard}>
                  <View
                    style={[styles.cardIconBox, { backgroundColor: "#FFD700" }]}
                  >
                    <Ionicons name="business" size={24} color="#21307A" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>Organization</Text>
                    <Text style={styles.cardSublabel}>
                      Register new community
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode("login")}
                style={styles.textBtn}
              >
                <Text style={styles.textBtnLabel}>
                  Already a Member? <Text style={styles.boldText}>Login</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              key="login"
              entering={SlideInRight.springify()}
              style={styles.loginForm}
            >
              {/* Email Input */}
              <View
                style={[styles.inputWrapper, errors.email && styles.inputError]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? "#EF4444" : "#94A3B8"}
                />
                <TextInput
                  placeholder="Email Address"
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrors({ ...errors, email: undefined });
                  }}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input */}
              <View
                style={[
                  styles.inputWrapper,
                  { marginTop: 14 },
                  errors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? "#EF4444" : "#94A3B8"}
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrors({ ...errors, password: undefined });
                  }}
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode("entry")}
                style={styles.textBtn}
              >
                <Text style={styles.textBtnLabel}>
                  Back to <Text style={styles.boldText}>Options</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* 4. FOOTER */}
        <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
          <Text style={styles.footerBrand}>Powered by JYM Digital</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>{versionData.version}</Text>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", overflow: "hidden" },
  bgWrapper: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  abstractCircle: { position: "absolute", borderRadius: 999 },
  circle1: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: "#EEF2FF",
    top: -100,
    right: -50,
  },
  circle2: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: "#FFFBEB",
    bottom: 0,
    left: -50,
  },

  safeContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  brandSection: { alignItems: "center" },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#21307A",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    marginBottom: 20,
  },
  logoGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -1.5,
  },
  subTitle: { fontSize: 15, color: "#94A3B8", marginTop: 6, fontWeight: "600" },

  actionSection: { minHeight: 250, justifyContent: "center" },
  cardContainer: {
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  blurCard: { flexDirection: "row", alignItems: "center", padding: 20 },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardLabel: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  cardSublabel: { fontSize: 13, color: "#94A3B8", marginTop: 2 },

  // Login Form
  loginForm: { width: "100%" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    height: 60,
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
    marginLeft: 10,
  },
  primaryBtn: {
    backgroundColor: "#21307A",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    elevation: 4,
    shadowColor: "#21307A",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  textBtn: { marginTop: 22, alignItems: "center" },
  textBtnLabel: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
  boldText: { color: "#21307A", fontWeight: "900" },

  footer: { alignItems: "center", gap: 10 },
  footerBrand: {
    fontSize: 10,
    color: "#CBD5E1",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  versionBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  versionText: { fontSize: 9, color: "#94A3B8", fontWeight: "bold" },
});
