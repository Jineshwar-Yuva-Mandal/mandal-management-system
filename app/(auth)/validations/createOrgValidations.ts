interface createOrgValidateParams {
  formData: any;
  setErrors: (errors: Record<string, string>) => void;
  step: number;
}

export const createOrgValidate = ({
    formData,
    setErrors,
    step,
} : createOrgValidateParams) => {
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