"use client";

import { BASE_URL, getAccountRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import FormField from "@/components/ui/FormField";
import { useTranslation } from "react-i18next";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function AccountFixFormMCSD({token}:{token:string}){
    const { t } = useTranslation('common');  // Specify the translation namespace
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [banks, setBanks] = useState<{ BankCode: string, BankName: string }[]>([]);
    const [countries, setCountries] = useState<{ countryCode: string, countryName: string }[]>([]);

    // Define form schema
    const formSchema = z.object({
        FirstName: z.string().min(1, t("profile.firstNameRequired", "First name is required")),
        LastName: z.string().min(1, t("profile.lastNameRequired", "Last name is required")),
        BirthDate: z.string().min(1, t("profile.birthDateRequired", "Birth date is required")),
        Country: z.string().min(1, t("profile.countryRequired", "Country is required")),
        Gender: z.string().min(1, t("profile.genderRequired", "Gender is required")),
        HomePhone: z.string().optional(),
        MobilePhone: z.string().min(1, t("profile.phoneRequired", "Mobile phone is required")),
        Occupation: z.string().min(1, t("profile.occupationRequired", "Occupation is required")),
        HomeAddress: z.string().min(1, t("profile.addressRequired", "Home address is required")),
        CustomerType: z.string(),
        BankCode: z.string().min(1, t("profile.bankRequired", "Bank is required")),
        BankName: z.string(),
        BankAccountNumber: z.string()
            .min(1, t("profile.accountNumberRequired", "Bank account number is required"))
            .regex(/^\d+$/, t("profile.accountNumberOnlyDigits", "Bank account number must contain only digits"))
            .refine(
                (val) => val.length >= 5,
                t("profile.accountNumberMinLength", "Bank account number must be at least 5 digits")
            )
    });

    type FormData = z.infer<typeof formSchema>;

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            FirstName: "",
            LastName: "",
            BirthDate: "",
            Country: "496", // Default to Mongolia
            Gender: "Male", // Default to Male
            HomePhone: "",
            MobilePhone: "",
            Occupation: "",
            HomeAddress: "",
            CustomerType: "0",
            BankCode: "15",
            BankName: "",
            BankAccountNumber: ""
        }
    });

    // Load all necessary data
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                // Load reference data first
                const [countriesRes, banksRes] = await Promise.all([
                    fetch(`${BASE_URL}/helper/countries`),
                    fetch(`${BASE_URL}/helper/banks`)
                ]);

                const countriesData = await countriesRes.json();
                const banksData = await banksRes.json();

                setCountries(countriesData.data || []);
                setBanks(banksData.data || []);

                // Then load account data
                const accountResponse = await getAccountRequest(token);
                if (accountResponse.success && accountResponse.data) {
                    const data = accountResponse.data;
                    
                    // Find default bank name
                    const selectedBank = (banksData.data || []).find((b: any) => b.BankCode === (data.BankCode || "15"));
                    
                    // Reset form with all data
                    methods.reset({
                        FirstName: data.FirstName || "",
                        LastName: data.LastName || "",
                        BirthDate: data.BirthDate || "",
                        Country: data.Country || "496",
                        Gender: data.Gender || "Male",
                        HomePhone: data.HomePhone || "",
                        MobilePhone: data.MobilePhone || "",
                        Occupation: data.Occupation || "",
                        HomeAddress: data.HomeAddress || "",
                        CustomerType: String(data.CustomerType || "0"),
                        BankCode: data.BankCode || "15",
                        BankName: selectedBank?.BankName || "",
                        BankAccountNumber: data.BankAccountNumber || ""
                    }, {
                        keepDefaultValues: false
                    });
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setError(t("profile.fetchError", "Failed to load necessary data"));
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, [token, t]);

    // Watch for bank code changes to update bank name
    useEffect(() => {
        const subscription = methods.watch((value, { name }) => {
            if (name === 'BankCode' && value.BankCode) {
                const selectedBank = banks.find(b => b.BankCode === value.BankCode);
                if (selectedBank) {
                    methods.setValue('BankName', selectedBank.BankName, {
                        shouldValidate: true
                    });
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [methods, banks]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Set bank name from selected bank code
            const selectedBank = banks.find(b => b.BankCode === data.BankCode);
            if (selectedBank) {
                data.BankName = selectedBank.BankName;
            }

            // Clean bank account number - ensure it's only digits
            data.BankAccountNumber = data.BankAccountNumber.replace(/\D/g, '');
            // @ts-ignore
            data.CustomerType = Number(data.CustomerType)
            console.log("data",data)
            
            const response = await fetch(`${BASE_URL}/user/update-account-request`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log("responseData",responseData)
            
            if (response.ok) {
                alert(t("profile.updateSuccess", "Account information updated successfully"));
                window.location.reload();
            } else {
                setError(responseData.message || t("profile.updateError", "Failed to update account information"));
            }
        } catch (error) {
            console.error("Error updating account:", error);
            setError(t("profile.updateError", "Failed to update account information"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-bdsec mx-auto" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {t("profile.loading", "Loading...")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                     
                    <div className="mb-4 flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="LastName"
                            label={t("profile.lastName", "Last Name")}
                            placeholder={t("profile.enterLastName", "Enter last name")}
                            required
                        />
                        <FormField
                            name="FirstName"
                            label={t("profile.firstName", "First Name")}
                            placeholder={t("profile.enterFirstName", "Enter first name")}
                            required
                        />

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("profile.gender", "Gender")} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-4">
                                <div className="flex items-center">
                                    <input
                                        id="gender-male"
                                        type="radio"
                                        value="Male"
                                        {...methods.register('Gender')}
                                        defaultChecked={methods.getValues('Gender') === 'Male'}
                                        className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
                                    />
                                    <label htmlFor="gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {t("profile.male", "Male")}
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="gender-female"
                                        type="radio"
                                        value="Female"
                                        {...methods.register('Gender')}
                                        defaultChecked={methods.getValues('Gender') === 'Female'}
                                        className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
                                    />
                                    <label htmlFor="gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {t("profile.female", "Female")}
                                    </label>
                                </div>
                            </div>
                            {methods.formState.errors.Gender && (
                                <p className="mt-1 text-sm text-red-500">{methods.formState.errors.Gender.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("profile.birthDate", "Birth Date")} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    {...methods.register('BirthDate')}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                            {methods.formState.errors.BirthDate && (
                                <p className="mt-1 text-sm text-red-500">{methods.formState.errors.BirthDate.message}</p>
                            )}
                        </div>

                        <FormField
                            name="MobilePhone"
                            label={t("profile.phoneNumber", "Phone Number")}
                            placeholder="88889999"
                            required
                        />

                        <FormField
                            name="HomePhone"
                            label={t("profile.homePhone", "Home Phone")}
                            placeholder="75753636"
                        />

                        <FormField
                            name="Occupation"
                            label={t("profile.occupation", "Occupation")}
                            placeholder={t("profile.enterOccupation", "Enter occupation")}
                            required
                        />

                        <FormField
                            name="HomeAddress"
                            label={t("profile.homeAddress", "Home Address")}
                            placeholder={t("profile.enterHomeAddress", "Enter home address")}
                            required
                        />

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("profile.country", "Country")} <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...methods.register('Country')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">{t("profile.selectCountry", "Select country")}</option>
                                {countries.map(country => (
                                    <option key={country.countryCode} value={country.countryCode}>
                                        {country.countryName}
                                    </option>
                                ))}
                            </select>
                            {methods.formState.errors.Country && (
                                <p className="mt-1 text-sm text-red-500">{methods.formState.errors.Country.message}</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                                {t("profile.bankInfo", "Bank Information")}
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">
                                {t("profile.bankInfoNote", "Bank information will be used for future transactions from your securities account.")}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("profile.selectBank", "Select Bank")} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...methods.register('BankCode')}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">{t("profile.selectBank", "Select bank")}</option>
                                    {banks.map(bank => (
                                        <option key={bank.BankCode} value={bank.BankCode}>
                                            {bank.BankName}
                                        </option>
                                    ))}
                                </select>
                                {methods.formState.errors.BankCode && (
                                    <p className="mt-1 text-sm text-red-500">{methods.formState.errors.BankCode.message}</p>
                                )}
                            </div>

                            <FormField
                                name="BankAccountNumber"
                                label={t("profile.accountNumber", "Account Number")}
                                placeholder="1234567890"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="mr-2">{t("profile.updating", "Updating...")}</span>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    </>
                                ) : (
                                    <>
                                        {t("profile.update", "Update")} <Check className="inline-block ml-1 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}