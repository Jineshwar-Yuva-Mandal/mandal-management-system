// import { Stack, useRouter, useSegments } from "expo-router";
// import { useEffect, useState } from "react";
// import { ActivityIndicator, StyleSheet, View } from "react-native";

// export default function RootLayout() {
//   const [isReady, setIsReady] = useState(false);
//   const segments = useSegments();
//   const router = useRouter();

//   // Mock Auth State (Connect to Supabase later)
//   const session = null;
//   const isApproved = false;

//   useEffect(() => {
//     // This timeout ensures the Layout has finished mounting
//     const timer = setTimeout(() => {
//       setIsReady(true);
//     }, 1);

//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (!isReady) return; // Don't redirect until we are ready

//     const inAuthGroup = segments[0] === "(auth)";

//     if (!session && !inAuthGroup) {
//       router.replace("/(auth)/login");
//     } else if (session && !isApproved) {
//       router.replace("/(auth)/wait-room");
//     }
//   }, [session, isReady, segments]);

//   // While waiting for the layout to mount, show a clean loading screen
//   if (!isReady) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#FFD700" />
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(auth)" />
//       <Stack.Screen name="(member)" />
//       <Stack.Screen name="(admin)" />
//       <Stack.Screen name="(finance)" />
//     </Stack>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
// });
