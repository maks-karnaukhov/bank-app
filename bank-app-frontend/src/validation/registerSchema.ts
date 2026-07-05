import * as Yup from "yup";

export const registerSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),

  phone: Yup.string()
  .matches(/^\+\d{10,15}$/, "Invalid phone number")
  .required("Phone is required"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "At least 1 uppercase letter")
    .matches(/[a-z]/, "At least 1 lowercase letter")
    .matches(/[^A-Za-z0-9]/, "At least 1 special character")
    .required("Password is required"),
});