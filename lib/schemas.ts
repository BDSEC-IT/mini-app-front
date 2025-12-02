import { z } from 'zod';

// Schema for the first step (adult check only)
export const adultCheckSchema = z.object({
  isAdult: z.boolean({
    required_error: "Please select whether you are an adult",
  }),
});

// Schema for adult user information
export const adultInfoSchema = z.object({
  login: z.string()
    .max(60, "Login must be at most 60 characters")
    .nonempty("Login is required"),
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
  bankCode: z.string().min(1, 'Bank code is required'),
  accountNumber: z.string()
    .min(6, "Account number must be at least 6 digits")
    .nonempty("Account number is required"),
  customerType: z.enum(["0", "1"], {
    required_error: "Customer type is required",
    invalid_type_error: "Customer type must be Иргэн (0) or ААН (1)",
  }).optional(),
  countryCode: z.string().min(1, 'Country code is required'),
});

// Schema for child user information
export const childInfoSchema = z.object({
  login: z.string()
    .max(60, "Login must be at most 60 characters")
    .nonempty("Login is required"),
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
  bankCode: z.string().min(1, 'Bank code is required'),
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
export const adultFullSchema = adultInfoSchema.extend({
  isAdult: z.literal(true),
});

// Combined schema for child user
export const childFullSchema = childInfoSchema.extend({
  isAdult: z.literal(false),
});

// Union type for the complete form data
export const accountSetupSchema = z.discriminatedUnion("isAdult", [
  adultFullSchema,
  childFullSchema,
]);

export type AdultCheckFormData = z.infer<typeof adultCheckSchema>;
export type AdultInfoFormData = z.infer<typeof adultInfoSchema>;
export type ChildInfoFormData = z.infer<typeof childInfoSchema>;
export type AccountSetupFormData = z.infer<typeof accountSetupSchema>; 