import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BrandLogo } from "../../../components/BrandLogo";
import { handleCreateOrganization } from "../handlers/handleCreateOrganization";
import { pickLogo } from "../handlers/pickLogo";
import { styles } from "../styles/createStyles";
import { createOrgValidate } from "../validations/createOrgValidations";

interface OrganizationFormProps {
  setAlertData: (data: any) => void;
  setAlertVisible: (visible: boolean) => void;
}

const ErrorHint = ({
  name,
  errors,
}: {
  name: string;
  errors: Record<string, string>;
}) =>
  errors[name] ? <Text style={styles.errorText}>{errors[name]}</Text> : null;

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  setAlertData,
  setAlertVisible,
}) => {
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

  const handleNext = () => {
    if (
      createOrgValidate({
        formData,
        setErrors,
        step,
      })
    )
      setStep(2);
  };

  const handleBack = () => (step > 1 ? setStep(1) : router.back());

  return (
    <>
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
              onPress={handleBack}
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
              <TouchableOpacity
                style={styles.logoPicker}
                onPress={pickLogo.bind(null, { formData, setFormData })}
              >
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
                <ErrorHint name="mandalName" errors={errors} />
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
                  <ErrorHint name="city" errors={errors} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, errors.state && styles.inputError]}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(t) => setFormData({ ...formData, state: t })}
                  />
                  <ErrorHint name="state" errors={errors} />
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
                <ErrorHint name="adminName" errors={errors} />
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
                <ErrorHint name="email" errors={errors} />
              </View>
              <View>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(t) => setFormData({ ...formData, phone: t })}
                />
                <ErrorHint name="phone" errors={errors} />
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
                <ErrorHint name="password" errors={errors} />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, loading && styles.disabledBtn]}
            onPress={
              step === 1
                ? handleNext
                : () =>
                    handleCreateOrganization({
                      formData,
                      setLoading,
                      setAlertData,
                      setAlertVisible,
                      validate: () =>
                        createOrgValidate({ formData, setErrors, step }),
                    })
            }
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
    </>
  );
};

export default OrganizationForm;
