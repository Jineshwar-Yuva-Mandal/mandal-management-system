import { supabase } from "../../../lib/supabase";

type AlertType = 'success' | 'error';

interface HandleCreateOrganizationParams {
  formData: any;
  setLoading: (loading: boolean) => void;
  setAlertData: (data: { visible: boolean; title: string; message: string; type: AlertType }) => void;
  setAlertVisible: (visible: boolean) => void;
  validate: () => boolean;
}

export const handleCreateOrganization = async ({
    formData,
    setLoading,
    setAlertData,
    setAlertVisible,
    validate,
} : HandleCreateOrganizationParams) => {
    if (!validate()) return;
    setLoading(true);

    try {
      // Calling the Edge Function we just deployed
      const { data, error } = await supabase.functions.invoke(
        "create-organization",
        {
          body: formData,
          headers: {
            "X-Client-Info": "supabase-js-expo",
          },
        },
      );

      if (error) {
        const errorDetails = await error.context?.json();
        const finalMessage = errorDetails?.error || error.message || "Failed to create organization";
        throw new Error(finalMessage);
      }

      setAlertData({
        visible: true,
        title: "Organization Launched!",
        message: "Your Mandal has been successfully registered. You can now log in.",
        type: 'success'
      });
      setAlertVisible(true);
    } catch (err: any) {
      setAlertData({
        visible: true,
        title: "Setup Failed",
        message: err.message,
        type: 'error'
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };