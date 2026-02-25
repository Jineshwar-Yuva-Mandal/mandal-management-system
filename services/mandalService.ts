import { supabase } from "../lib/supabase";

export interface CreateMandalPayload {
  mandalName: string;
  area: string;
  city: string;
  state: string;
  adminName: string;
  email: string;
  password: string;
  phone: string;
}

export const mandalService = {
  async launchOrganization(payload: CreateMandalPayload) {
    // We use 'invoke' to call the Edge Function named 'create-mandal'
    const { data, error } = await supabase.functions.invoke('create-mandal', {
      body: payload,
    });

    if (error) {
      // Handle Edge Function specific errors
      const errorDetail = await error.context?.json();
      throw new Error(errorDetail?.message || "Failed to launch organization");
    }

    return data;
  }
};