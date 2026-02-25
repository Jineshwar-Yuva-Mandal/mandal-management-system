import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { CustomAlert } from "../../components/CustomAlert";
import OrganizationForm from "./components/OrganizationForm";
import { styles } from "./styles/createStyles";

export default function CreateMandal() {
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    // Use window height to compare
    const windowHeight = typeof window !== 'undefined' && window.innerHeight
      ? window.innerHeight
      : 0;
    setScrollEnabled(contentHeight > windowHeight);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={scrollEnabled}
      onContentSizeChange={handleContentSizeChange}
    >
      <OrganizationForm
        setAlertData={setAlertData}
        setAlertVisible={setAlertVisible}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => {
          setAlertVisible(false);
          if (alertData.type === "success") {
            router.replace("/(auth)");
          }
        }}
      />
    </ScrollView>
  );
}
