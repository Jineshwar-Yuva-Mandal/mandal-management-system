import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Mock Auth State (Swap with Supabase useAuth hook later)
  const session = null;
  const isApproved = false;

  useEffect(() => {
    // Wait for the navigation state to be stable
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";
    const inMemberGroup = segments[0] === "(member)";

    // 1. If not logged in and not in Auth folder -> Send to Login
    if (!session && !inAuthGroup) {
      router.replace("/(auth)");
    }

    // 2. If logged in but NOT approved -> Send to Wait Room
    else if (session && !isApproved && segments[1] !== "wait-room") {
      router.replace("/(auth)/wait-room");
    }

    // 3. Prevent logged-in users from going back to Login/Index
    else if (session && isApproved && inAuthGroup) {
      router.replace("/(member)"); // Or (admin) based on role
    }
  }, [session, isApproved, segments, isReady]);

  // Premium loading state
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21307A" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
      <Stack.Screen
        name="(member)"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="(admin)"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="(finance)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFDFD", // Clean SaaS White
  },
});
