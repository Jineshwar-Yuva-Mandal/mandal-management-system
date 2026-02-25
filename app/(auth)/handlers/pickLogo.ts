import * as ImagePicker from "expo-image-picker";

interface PickLogoParams {
  formData: any;
  setFormData: (data: any) => void;
}

export const pickLogo = async ({ formData, setFormData }: PickLogoParams) => {
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