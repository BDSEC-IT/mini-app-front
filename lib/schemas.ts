import { z } from 'zod';

// Schema for the first step (adult check only)
export const adultCheckSchema = z.object({
  isAdult: z.boolean({
    required_error: "Please select whether you are an adult",
  }),
});

// Schema for adult user information
export const adultInfoSchema = z.object({
  registerNumber: z.string()
    .min(6, "Register number must be at least 6 characters")
    .nonempty("Register number is required"),
  lastName: z.string()
    .nonempty("Last name is required"),
  firstName: z.string()
    .nonempty("First name is required"),
  phoneNumber: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .nonempty("Phone number is required"),
  homePhone: z.string()
    .optional(),
  gender: z.enum(["Male", "Female", "Unknown"], {
    required_error: "Gender is required"
  }),
  birthDate: z.string()
    .nonempty("Birth date is required"),
  occupation: z.string()
    .nonempty("Occupation is required"),
  homeAddress: z.string()
    .nonempty("Home address is required"),
});

// Schema for child user information
export const childInfoSchema = z.object({
  childRegisterNumber: z.string()
    .min(6, "Register number must be at least 6 characters")
    .nonempty("Register number is required"),
  parentRegisterNumber: z.string()
    .min(6, "Parent register number must be at least 6 characters")
    .nonempty("Parent register number is required"),
  lastName: z.string()
    .nonempty("Last name is required"),
  firstName: z.string()
    .nonempty("First name is required"),
  phoneNumber: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .nonempty("Phone number is required"),
  homePhone: z.string()
    .optional(),
  gender: z.enum(["Male", "Female", "Unknown"], {
    required_error: "Gender is required"
  }),
  birthDate: z.string()
    .nonempty("Birth date is required"),
  homeAddress: z.string()
    .nonempty("Home address is required"),
});

// Schema for bank information
export const bankInfoSchema = z.object({
  bankCode: z.string()
    .nonempty("Bank selection is required"),
  bankName: z.string()
    .optional(),
  accountNumber: z.string()
    .min(6, "Account number must be at least 6 digits")
    .nonempty("Account number is required"),
});

// Mongolian banks list
export const mongolianBanks = [
  { code: "050000", name: "Хаан Банк" },
  { code: "040000", name: "Голомт Банк" },
  { code: "010000", name: "Монгол Банк" },
  { code: "340000", name: "Хас Банк" },
  { code: "250000", name: "Төрийн Банк" },
  { code: "150000", name: "Худалдаа Хөгжлийн Банк" },
  { code: "290000", name: "Капитрон Банк" },
  { code: "320000", name: "Ариг Банк" },
  { code: "190000", name: "Чингис Хаан Банк" },
];

// Combined schema for adult user
export const adultFullSchema = z.object({
  isAdult: z.literal(true),
  ...adultInfoSchema.shape,
  ...bankInfoSchema.shape,
});

// Combined schema for child user
export const childFullSchema = z.object({
  isAdult: z.literal(false),
  ...childInfoSchema.shape,
  ...bankInfoSchema.shape,
});

// Union type for the complete form data
export const accountSetupSchema = z.discriminatedUnion("isAdult", [
  adultFullSchema,
  childFullSchema,
]);

export type AdultCheckFormData = z.infer<typeof adultCheckSchema>;
export type AdultInfoFormData = z.infer<typeof adultInfoSchema>;
export type ChildInfoFormData = z.infer<typeof childInfoSchema>;
export type BankInfoFormData = z.infer<typeof bankInfoSchema>;
export type AccountSetupFormData = z.infer<typeof accountSetupSchema>; 