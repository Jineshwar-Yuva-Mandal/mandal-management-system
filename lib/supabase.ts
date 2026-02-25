import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Accessing environment variables in Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

// SSR Check: Ensures code only runs storage logic on the device/browser
const isServer = typeof window === "undefined";

export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    storage: isServer ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});