import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BrandLogo } from "../../components/BrandLogo";
import { supabase } from "../../lib/supabase";

export default function CreateMandal() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    mandalName: "",
    area: "",
    city: "",
    state: "",
    adminName: "",
    email: "",
    password: "",
    phone: "",
    logo: null as string | null,
  });

  const validate = () => {
    let sErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.mandalName.trim())
        sErrors.mandalName = "Mandal name required";
      if (!formData.city.trim()) sErrors.city = "City required";
      if (!formData.state.trim()) sErrors.state = "State required";
    } else {
      if (!formData.adminName.trim()) sErrors.adminName = "Name required";
      if (!formData.email.includes("@")) sErrors.email = "Invalid email";
      if (formData.password.length < 6) sErrors.password = "Min 6 characters";
      if (formData.phone.length < 10) sErrors.phone = "Invalid phone";
    }
    setErrors(sErrors);
    return Object.keys(sErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setFormData({ ...formData, logo: result.assets[0].uri });
    }
  };

  const handleNext = () => {
    if (validate()) setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.adminName } },
      });

      if (authError) throw authError;
      const user = authData.user;
      if (!user) throw new Error("Signup failed.");

      // 2. Create Mandal & Update Profile in one go?
      // Actually, let's just make sure we capture the Mandal ID
      const { data: mandal, error: mError } = await supabase
        .from("mandals")
        .insert({
          name: formData.mandalName,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          admin_id: user.id,
        })
        .select()
        .single();

      if (mError) throw mError;

      // 3. Link them
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin', 
          mandal_id: mandal.id,
          full_name: formData.adminName,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile Update Error:", profileError);
        throw new Error("Mandal created, but profile update failed.");
      }

      router.replace("/(admin)"); // Or your dashboard path
    } catch (err: any) {
      Alert.alert("Setup Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const ErrorHint = ({ name }: { name: string }) =>
    errors[name] ? <Text style={styles.errorText}>{errors[name]}</Text> : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Visual background blob */}
      <View
        style={[
          styles.blob,
          {
            bottom: -100,
            left: -100,
            backgroundColor: "#21307A",
            opacity: 0.05,
          },
        ]}
      />

      <View style={styles.content}>
        {/* NEW UNIFIED TOP NAV */}
        <View style={styles.topNav}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => (step > 1 ? setStep(1) : router.back())}
              style={styles.backButtonCircle}
            >
              <Ionicons name="arrow-back" size={20} color="#21307A" />
            </TouchableOpacity>

            <View style={styles.headerBrand}>
              <BrandLogo size={28} style={styles.headerLogo} />
              <View>
                <Text style={styles.brandTag}>SAMANVAY</Text>
                <Text style={styles.brandSub}>Setup Org</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {[1, 2].map((i) => (
                <View
                  key={i}
                  style={[styles.dot, step >= i && styles.activeDot]}
                />
              ))}
            </View>
            <Text style={styles.stepCounter}>Step {step}/2</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>
          {step === 1 ? "Organization Details" : "Admin Profile"}
        </Text>

        <BlurView intensity={80} tint="light" style={styles.setupCard}>
          {step === 1 ? (
            <View style={styles.form}>
              <TouchableOpacity style={styles.logoPicker} onPress={pickImage}>
                {formData.logo ? (
                  <Image
                    source={{ uri: formData.logo }}
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={28}
                      color="#94A3B8"
                    />
                    <Text style={styles.logoText}>Add Logo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View>
                <TextInput
                  style={[styles.input, errors.mandalName && styles.inputError]}
                  placeholder="Mandal Name"
                  value={formData.mandalName}
                  onChangeText={(t) =>
                    setFormData({ ...formData, mandalName: t })
                  }
                />
                <ErrorHint name="mandalName" />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Area/Landmark"
                value={formData.area}
                onChangeText={(t) => setFormData({ ...formData, area: t })}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(t) => setFormData({ ...formData, city: t })}
                  />
                  <ErrorHint name="city" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, errors.state && styles.inputError]}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(t) => setFormData({ ...formData, state: t })}
                  />
                  <ErrorHint name="state" />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <View>
                <TextInput
                  style={[styles.input, errors.adminName && styles.inputError]}
                  placeholder="Your Full Name"
                  value={formData.adminName}
                  onChangeText={(t) =>
                    setFormData({ ...formData, adminName: t })
                  }
                />
                <ErrorHint name="adminName" />
              </View>
              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Admin Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(t) => setFormData({ ...formData, email: t })}
                />
                <ErrorHint name="email" />
              </View>
              <View>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(t) => setFormData({ ...formData, phone: t })}
                />
                <ErrorHint name="phone" />
              </View>
              <View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Set Password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(t) =>
                    setFormData({ ...formData, password: t })
                  }
                />
                <ErrorHint name="password" />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, loading && styles.disabledBtn]}
            onPress={step === 1 ? handleNext : handleFinalSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.actionBtnText}>
                  {step === 1 ? "Next Step" : "Launch Organization"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCFDFF" },
  content: { flex: 1, padding: 25, paddingTop: 40 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
    marginTop: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    backgroundColor: "white",
    borderRadius: 15,
  },
  brandTag: {
    fontWeight: "900",
    color: "#21307A",
    fontSize: 13,
    letterSpacing: 1,
    lineHeight: 14,
  },
  brandSub: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressDots: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 2,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#CBD5E1" },
  activeDot: { backgroundColor: "#21307A", width: 14 },
  stepCounter: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
  },
  blob: { position: "absolute", width: 400, height: 400, borderRadius: 200 },
  mainTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#21307A",
    marginBottom: 25,
    letterSpacing: -0.5,
  },
  setupCard: {
    padding: 20,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  form: { gap: 12 },
  input: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    color: "#1E293B",
  },
  inputError: { borderColor: "#FDA4AF", backgroundColor: "#FFF1F2" },
  errorText: {
    color: "#E11D48",
    fontSize: 11,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: "600",
  },
  row: { flexDirection: "row", gap: 10 },
  logoPicker: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F8FAFC",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    marginBottom: 10,
  },
  logoPlaceholder: { alignItems: "center" },
  logoPreview: { width: 86, height: 86, borderRadius: 43 },
  logoText: { fontSize: 10, color: "#94A3B8", marginTop: 4, fontWeight: "600" },
  actionBtn: {
    backgroundColor: "#21307A",
    padding: 18,
    borderRadius: 16,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  disabledBtn: { opacity: 0.7 },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
