'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  adultCheckSchema, 
  adultInfoSchema, 
  childInfoSchema, 
  AdultCheckFormData, 
  AdultInfoFormData, 
  ChildInfoFormData,
  AccountSetupFormData,
  mongolianBanks
} from '@/lib/schemas'
import FormField from '@/components/ui/FormField'
import { ArrowLeft, ArrowRight, Check, AlertCircle, CreditCard, Edit, CheckCircle } from 'lucide-react'
import Cookies from 'js-cookie'
import { getAccountStatusRequest, sendAccountStatusRequest, createOrRenewInvoice, getUserAccountInformation, getRegistrationNumber, sendRegistrationNumber } from '@/lib/api'

// Step 1: Adult check only
const Step1 = ({ onNext, existingData }: { onNext: (data: AdultCheckFormData) => void, existingData?: Partial<AdultCheckFormData> }) => {
  const { t } = useTranslation()
  const methods = useForm<AdultCheckFormData>({
    resolver: zodResolver(adultCheckSchema),
    defaultValues: { isAdult: existingData?.isAdult }
  })
  
  // Reset form with existing data when it becomes available
  useEffect(() => {
    if (existingData?.isAdult !== undefined) {
      methods.reset({
        isAdult: existingData.isAdult
      });
    }
  }, [existingData, methods])
  
  const onSubmit = (data: AdultCheckFormData) => {
    onNext({ ...data, isAdult: data.isAdult === true })
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.isAdult')}</label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input id="adult-yes" type="radio" value="true" onChange={() => methods.setValue('isAdult', true)} checked={methods.watch('isAdult') === true} className="h-4 w-4 text-bdsec focus:ring-bdsec" />
              <label htmlFor="adult-yes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.yes')}</label>
            </div>
            <div className="flex items-center">
              <input id="adult-no" type="radio" value="false" onChange={() => methods.setValue('isAdult', false)} checked={methods.watch('isAdult') === false} className="h-4 w-4 text-bdsec focus:ring-bdsec" />
              <label htmlFor="adult-no" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.no')}</label>
            </div>
          </div>
          {methods.formState.errors.isAdult && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.isAdult.message}</p>}
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors">
            {t('profile.next')} <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

// Step 2: Adult information
const Step2Adult = ({ onNext, onBack, registerNumber, existingData }: { onNext: (data: AdultInfoFormData) => void, onBack: () => void, registerNumber?: string, existingData?: Partial<AdultInfoFormData> }) => {
  const { t } = useTranslation()
  const methods = useForm<AdultInfoFormData>({
    resolver: zodResolver(adultInfoSchema),
    defaultValues: { 
      registerNumber: existingData?.registerNumber || registerNumber || '', 
      lastName: existingData?.lastName || '', 
      firstName: existingData?.firstName || '', 
      phoneNumber: existingData?.phoneNumber || '', 
      homePhone: existingData?.homePhone || '', 
      gender: existingData?.gender || undefined, 
      birthDate: existingData?.birthDate || '', 
      occupation: existingData?.occupation || '', 
      homeAddress: existingData?.homeAddress || '', 
      bankCode: existingData?.bankCode || '', 
      accountNumber: existingData?.accountNumber || '' 
    }
  })
  
  // Reset form with existing data when it becomes available
  useEffect(() => {
    if (existingData) {
      methods.reset({
        registerNumber: existingData.registerNumber || registerNumber || '',
        lastName: existingData.lastName || '',
        firstName: existingData.firstName || '',
        phoneNumber: existingData.phoneNumber || '',
        homePhone: existingData.homePhone || '',
        gender: existingData.gender || undefined,
        birthDate: existingData.birthDate || '',
        occupation: existingData.occupation || '',
        homeAddress: existingData.homeAddress || '',
        bankCode: existingData.bankCode || '',
        accountNumber: existingData.accountNumber || ''
      });
    }
  }, [existingData, registerNumber, methods])
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onNext)} className="space-y-6">
        <FormField name="registerNumber" label={t('profile.registerNumber')} placeholder="AA00112233" required disabled={!!registerNumber} />
        <FormField name="lastName" label={t('profile.lastName')} placeholder={t('profile.enterLastName')} required />
        <FormField name="firstName" label={t('profile.firstName')} placeholder={t('profile.enterFirstName')} required />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.gender')} <span className="text-red-500">*</span></label>
          <div className="flex space-x-4">
            <div className="flex items-center"><input id="gender-male" type="radio" value="Male" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.male')}</label></div>
            <div className="flex items-center"><input id="gender-female" type="radio" value="Female" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.female')}</label></div>
            <div className="flex items-center"><input id="gender-unknown" type="radio" value="Unknown" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="gender-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.unknown')}</label></div>
          </div>
          {methods.formState.errors.gender && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.gender.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.birthDate')} <span className="text-red-500">*</span></label>
          <input type="date" {...methods.register('birthDate')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`} />
          {methods.formState.errors.birthDate && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.birthDate.message}</p>}
        </div>
        <FormField name="phoneNumber" label={t('profile.phoneNumber')} placeholder="88889999" required />
        <FormField name="homePhone" label={t('profile.homePhone')} placeholder="75753636" />
        <FormField name="occupation" label={t('profile.occupation')} placeholder={t('profile.enterOccupation')} required />
        <FormField name="homeAddress" label={t('profile.homeAddress')} placeholder={t('profile.enterHomeAddress')} required />
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('profile.bankInfo')}</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">Банкны мэдээлэл нь ирээдүйд МҮЦДС дансаасаа мөнгө татах, оруулахад ашиглагдана.</div>
          <div className="mb-4">
            <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.selectBank')} <span className="text-red-500">*</span></label>
            <select id="bankCode" {...methods.register('bankCode')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.bankCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}>
              <option value="">{t('profile.selectBank')}</option>
              {mongolianBanks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
            </select>
            {methods.formState.errors.bankCode && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.bankCode.message}</p>}
          </div>
          <FormField name="accountNumber" label={t('profile.accountNumber')} placeholder="1234567890" required />
        </div>
        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors"><ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.back')}</button>
          <button type="submit" className="px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors">{t('profile.submit')} <Check className="inline-block ml-1 h-4 w-4" /></button>
        </div>
      </form>
    </FormProvider>
  )
}

// Step 2: Child information
const Step2Child = ({ onNext, onBack, registerNumber, existingData }: { onNext: (data: ChildInfoFormData) => void, onBack: () => void, registerNumber?: string, existingData?: Partial<ChildInfoFormData> }) => {
  const { t } = useTranslation()
  const methods = useForm<ChildInfoFormData>({
    resolver: zodResolver(childInfoSchema),
    defaultValues: { 
      childRegisterNumber: existingData?.childRegisterNumber || registerNumber || '', 
      parentRegisterNumber: existingData?.parentRegisterNumber || '', 
      lastName: existingData?.lastName || '', 
      firstName: existingData?.firstName || '', 
      phoneNumber: existingData?.phoneNumber || '', 
      homePhone: existingData?.homePhone || '', 
      gender: existingData?.gender || undefined, 
      birthDate: existingData?.birthDate || '', 
      homeAddress: existingData?.homeAddress || '', 
      bankCode: existingData?.bankCode || '', 
      accountNumber: existingData?.accountNumber || '' 
    }
  })
  
  // Reset form with existing data when it becomes available
  useEffect(() => {
    if (existingData) {
      methods.reset({
        childRegisterNumber: existingData.childRegisterNumber || registerNumber || '',
        parentRegisterNumber: existingData.parentRegisterNumber || '',
        lastName: existingData.lastName || '',
        firstName: existingData.firstName || '',
        phoneNumber: existingData.phoneNumber || '',
        homePhone: existingData.homePhone || '',
        gender: existingData.gender || undefined,
        birthDate: existingData.birthDate || '',
        homeAddress: existingData.homeAddress || '',
        bankCode: existingData.bankCode || '',
        accountNumber: existingData.accountNumber || ''
      });
    }
  }, [existingData, registerNumber, methods])
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onNext)} className="space-y-6">
        <FormField name="childRegisterNumber" label={t('profile.childRegisterNumber')} placeholder="AA00112233" required disabled={!!registerNumber} />
        <FormField name="parentRegisterNumber" label={t('profile.parentRegisterNumber')} placeholder="AA00112233" required />
        <FormField name="lastName" label={t('profile.lastName')} placeholder={t('profile.enterLastName')} required />
        <FormField name="firstName" label={t('profile.firstName')} placeholder={t('profile.enterFirstName')} required />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.gender')} <span className="text-red-500">*</span></label>
          <div className="flex space-x-4">
             <div className="flex items-center"><input id="child-gender-male" type="radio" value="Male" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="child-gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.male')}</label></div>
             <div className="flex items-center"><input id="child-gender-female" type="radio" value="Female" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="child-gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.female')}</label></div>
             <div className="flex items-center"><input id="child-gender-unknown" type="radio" value="Unknown" {...methods.register('gender')} className="h-4 w-4 text-bdsec focus:ring-bdsec" /><label htmlFor="child-gender-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.unknown')}</label></div>
          </div>
          {methods.formState.errors.gender && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.gender.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.birthDate')} <span className="text-red-500">*</span></label>
          <input type="date" {...methods.register('birthDate')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`} />
          {methods.formState.errors.birthDate && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.birthDate.message}</p>}
        </div>
        <FormField name="phoneNumber" label={t('profile.phoneNumber')} placeholder="88889999" required />
        <FormField name="homePhone" label={t('profile.homePhone')} placeholder="75753636" />
        <FormField name="homeAddress" label={t('profile.homeAddress')} placeholder={t('profile.enterHomeAddress')} required />
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('profile.bankInfo')}</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">Банкны мэдээлэл нь ирээдүйд МҮЦДС дансаасаа мөнгө татах, оруулахад ашиглагдана.</div>
          <div className="mb-4">
            <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.selectBank')} <span className="text-red-500">*</span></label>
            <select id="bankCode" {...methods.register('bankCode')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.bankCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}>
              <option value="">{t('profile.selectBank')}</option>
              {mongolianBanks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
            </select>
            {methods.formState.errors.bankCode && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.bankCode.message}</p>}
          </div>
          <FormField name="accountNumber" label={t('profile.accountNumber')} placeholder="1234567890" required />
        </div>
        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors"><ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.back')}</button>
          <button type="submit" className="px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors">{t('profile.submit')} <Check className="inline-block ml-1 h-4 w-4" /></button>
        </div>
      </form>
    </FormProvider>
  )
}

const SummaryView = ({ summaryData, onEdit, onPay }: { summaryData: any, onEdit: () => void, onPay: () => Promise<void> }) => {
    const { t } = useTranslation()
    const [isProcessing, setIsProcessing] = useState(false);

    // Debug logging
    console.log('SummaryView received summaryData:', summaryData);
    console.log('SummaryView data type:', typeof summaryData);
    console.log('SummaryView data keys:', summaryData ? Object.keys(summaryData) : 'null');

    const handlePayment = async () => {
        setIsProcessing(true);
        await onPay();
        setIsProcessing(false);
        // Trigger sidebar refresh
        window.dispatchEvent(new Event('accountSetupDataChanged'));
    }
    
    const bankCode = summaryData?.BankCode || summaryData?.bankCode;
    const bankName = mongolianBanks.find(b => b.code === bankCode)?.name || (summaryData?.BankName || summaryData?.bankName || bankCode);

    const isPaid = summaryData?.invoiceStatus === 'PAID';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Таны мэдээлэл</h2>
                <button onClick={onEdit} className="text-sm text-bdsec hover:underline flex items-center gap-1">
                    <Edit size={14}/> Засварлах
                </button>
            </div>

            <div className="space-y-4 text-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-2">Ерөнхий мэдээлэл</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <p><span className="font-medium text-gray-500">Овог:</span> {summaryData?.LastName || summaryData?.lastName}</p>
                        <p><span className="font-medium text-gray-500">Нэр:</span> {summaryData?.FirstName || summaryData?.firstName}</p>
                        <p><span className="font-medium text-gray-500">Регистр:</span> {summaryData?.RegistryNumber || summaryData?.registerNumber || summaryData?.childRegisterNumber}</p>
                        {summaryData?.parentRegisterNumber && <p><span className="font-medium text-gray-500">Эцэг/эх регистр:</span> {summaryData.parentRegisterNumber}</p>}
                        <p><span className="font-medium text-gray-500">Төрсөн огноо:</span> {summaryData?.BirthDate || summaryData?.birthDate}</p>
                        <p><span className="font-medium text-gray-500">Хүйс:</span> {summaryData?.Gender || summaryData?.gender}</p>
                        <p><span className="font-medium text-gray-500">Утас:</span> {summaryData?.MobilePhone || summaryData?.phoneNumber}</p>
                        <p><span className="font-medium text-gray-500">Гар утас:</span> {summaryData?.HomePhone || summaryData?.homePhone}</p>
                        <p className="col-span-2"><span className="font-medium text-gray-500">Гэрийн хаяг:</span> {summaryData?.HomeAddress || summaryData?.homeAddress}</p>
                        <p className="col-span-2"><span className="font-medium text-gray-500">Ажил:</span> {summaryData?.Occupation || summaryData?.occupation}</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-2">Банкны мэдээлэл</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <p><span className="font-medium text-gray-500">Банк:</span> {bankName}</p>
                        <p><span className="font-medium text-gray-500">Дансны дугаар:</span> {summaryData?.BankAccountNumber || summaryData?.accountNumber || summaryData?.bankAccountNumber}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {isPaid ? (
                     <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                         <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                            Төлбөр төлөгдсөн
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Таны данс нээх хүсэлтийг хянаж байна.
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <CreditCard className="h-5 w-5" /> 
                        {isProcessing ? t('profile.processing') : t('profile.payAccountOpeningFee', { amount: 8000 })}
                    </button>
                )}
            </div>
        </div>
    )
}


export default function GeneralInfoPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(1)
  const [viewMode, setViewMode] = useState<'loading' | 'form' | 'summary'>('loading');
  const [formData, setFormData] = useState<Partial<AccountSetupFormData>>({})
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerNumber, setRegisterNumber] = useState<string | null>(null)
  const [showRegisterInput, setShowRegisterInput] = useState(false);
  const [registerInput, setRegisterInput] = useState('');
  
  // On mount, check registration number via GET
  useEffect(() => {
    const checkRegister = async () => {
      const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
      if (!token) return;
      const regRes = await getRegistrationNumber(token);
      if (!regRes.registerNumber) {
        setShowRegisterInput(true);
      } else {
        setShowRegisterInput(false);
        setRegisterNumber(regRes.registerNumber);
      }
    };
    checkRegister();
  }, []);

  // Handler for register number submission (POST)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerInput.trim()) {
      setError(t('profile.enterRegisterNumber'));
      return;
    }
    const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
    const nationality = 'MN'; // Or get from context/query if needed
    const res = await sendRegistrationNumber(registerInput.trim(), nationality, token);
    if (res.success) {
      setRegisterNumber(registerInput.trim());
      setShowRegisterInput(false);
      setError(null);
    } else {
      setError(res.message || t('profile.formError'));
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('GeneralInfoPage - summaryData state changed:', summaryData);
    console.log('GeneralInfoPage - viewMode state:', viewMode);
  }, [summaryData, viewMode]);

  useEffect(() => {
    const fetchStatusAndSetMode = async () => {
        const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
        if (token) {
            try {
                const statusResponse = await getAccountStatusRequest(token);
                console.log('General page - statusResponse:', statusResponse);
                
                const status = statusResponse?.data?.status;
                
                // Enhanced data detection logic
                let hasSubmittedData = false;
                
                if (statusResponse.success && statusResponse.data) {
                    const data = statusResponse.data;
                    
                    // Method 1: Check status field
                    const hasValidStatus = status && ['SUBMITTED', 'PAID', 'APPROVED', 'COMPLETED'].includes(status);
                    
                    // Method 2: Check for ID (indicates record exists)
                    const hasId = !!data.id;
                    
                    // Method 3: Check for essential personal data (PascalCase - API format)
                    const hasPascalCaseData = data.FirstName && data.LastName && 
                                             (data.RegistryNumber || data.childRegisterNumber);
                    
                    // Method 4: Check for essential personal data (camelCase - local format)
                    const hasCamelCaseData = data.firstName && data.lastName && 
                                            (data.registerNumber || data.childRegisterNumber);
                    
                    // Method 5: Fallback - check if response has any meaningful data structure
                    const hasFallbackData = data && typeof data === 'object' && Object.keys(data).length > 2;
                    
                    hasSubmittedData = hasValidStatus || hasId || hasPascalCaseData || hasCamelCaseData || hasFallbackData;
                    
                    console.log('General page - Enhanced detection:', {
                        hasValidStatus,
                        hasId,
                        hasPascalCaseData,
                        hasCamelCaseData,
                        hasFallbackData,
                        finalResult: hasSubmittedData,
                        dataKeys: Object.keys(data),
                        firstName: data.FirstName || data.firstName,
                        lastName: data.LastName || data.lastName,
                        registryNumber: data.RegistryNumber || data.registerNumber,
                        rawData: data
                    });
                }
                
                if (hasSubmittedData) {
                    // User has submitted info before, show summary
                    console.log('About to set summaryData with:', statusResponse.data);
                    console.log('Type of statusResponse:', typeof statusResponse);
                    console.log('Keys of statusResponse:', Object.keys(statusResponse));
                    console.log('Type of statusResponse.data:', typeof statusResponse.data);
                    
                    // Fix: Set only the data portion, not the entire response
                    setSummaryData(statusResponse.data);
                    setViewMode('summary');
                    
                    // Pre-populate form data for edit mode
                    const existingData = statusResponse.data;
                    const mappedData = {
                        isAdult: existingData.isAdult || (existingData.CustomerType === 1) || 
                                // Fallback: if no explicit customer type, assume adult if we have occupation
                                (existingData.Occupation || existingData.occupation ? true : undefined),
                        registerNumber: existingData.RegistryNumber || existingData.registerNumber || existingData.childRegisterNumber,
                        childRegisterNumber: existingData.childRegisterNumber,
                        parentRegisterNumber: existingData.parentRegisterNumber,
                        firstName: existingData.FirstName || existingData.firstName,
                        lastName: existingData.LastName || existingData.lastName,
                        phoneNumber: existingData.MobilePhone || existingData.phoneNumber,
                        homePhone: existingData.HomePhone || existingData.homePhone,
                        gender: existingData.Gender || existingData.gender,
                        birthDate: existingData.BirthDate || existingData.birthDate,
                        occupation: existingData.Occupation || existingData.occupation,
                        homeAddress: existingData.HomeAddress || existingData.homeAddress,
                        bankCode: existingData.BankCode || existingData.bankCode,
                        accountNumber: existingData.BankAccountNumber || existingData.bankAccountNumber || existingData.accountNumber
                    };
                    
                    setFormData(mappedData);
                    
                    // Set step to 2 since we have submitted data
                    setStep(2);
                    
                    console.log('General page - Set summary mode with data:', mappedData);
                    console.log('General page - Summary data should be:', statusResponse.data);
                } else {
                    // New user or incomplete data, show form
                    const authRegNumber = searchParams.get('registerNumber');
                    if (authRegNumber) {
                        setRegisterNumber(authRegNumber);
                    }
                    setViewMode('form');
                    console.log('General page - Set form mode');
                }
            } catch (error) {
                console.error('Error fetching status:', error);
                setViewMode('form');
            }
        } else {
            // No token, treat as a new user for now
            console.log('General page - No token, showing form');
            setViewMode('form');
        }
    };

    const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
    if (!Cookies.get('jwt') && !Cookies.get('token') && !Cookies.get('auth_token')) {
        Cookies.set('jwt', demoToken, { expires: 7 })
    }
    
    fetchStatusAndSetMode();
  }, [searchParams])

  
  const handleStep1Submit = (data: AdultCheckFormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }
  
  const submitAllData = async (data: AdultInfoFormData | ChildInfoFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    const combinedData: any = { ...formData, ...data };
    // Add bank name from the bank code
    const bank = mongolianBanks.find(b => b.code === data.bankCode);
    combinedData.bankName = bank?.name || '';
    
    const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');

    if (!token) {
        setError("Authentication token missing. Please log in.");
        setIsSubmitting(false);
        return;
    }

    try {
        console.log('Submitting account setup data:', combinedData);
        const result = await sendAccountStatusRequest(combinedData, token);
        
        if (result.success) {
            console.log('Account setup submission successful:', result);
            
            // Fetch fresh data to show summary view
            const statusResponse = await getAccountStatusRequest(token);
            console.log('Fresh status response after submission:', statusResponse);
            
            if (statusResponse.success && statusResponse.data) {
                setSummaryData(statusResponse.data);
                setViewMode('summary');
                
                // Update form data with fresh server data
                const freshData = statusResponse.data;
                const mappedData = {
                    isAdult: freshData.isAdult || (freshData.CustomerType === 1),
                    registerNumber: freshData.RegistryNumber || freshData.registerNumber || freshData.childRegisterNumber,
                    childRegisterNumber: freshData.childRegisterNumber,
                    parentRegisterNumber: freshData.parentRegisterNumber,
                    firstName: freshData.FirstName || freshData.firstName,
                    lastName: freshData.LastName || freshData.lastName,
                    phoneNumber: freshData.MobilePhone || freshData.phoneNumber,
                    homePhone: freshData.HomePhone || freshData.homePhone,
                    gender: freshData.Gender || freshData.gender,
                    birthDate: freshData.BirthDate || freshData.birthDate,
                    occupation: freshData.Occupation || freshData.occupation,
                    homeAddress: freshData.HomeAddress || freshData.homeAddress,
                    bankCode: freshData.BankCode || freshData.bankCode,
                    accountNumber: freshData.BankAccountNumber || freshData.bankAccountNumber || freshData.accountNumber
                };
                
                setFormData(mappedData);
                console.log('Updated form data with fresh server data:', mappedData);
                
                // Trigger sidebar refresh
                window.dispatchEvent(new Event('accountSetupDataChanged'));
                console.log('Triggered accountSetupDataChanged event');
            } else {
                // Fallback: use submitted data for summary if fresh fetch fails
                setSummaryData(combinedData);
                setViewMode('summary');
                console.log('Used submitted data for summary (fallback)');
            }
        } else {
            console.error('Account setup submission failed:', result);
            setError(result.message || "An unexpected error occurred.");
        }
    } catch (e: any) {
        console.error('Error during account setup submission:', e);
        setError(e.message || "Submission failed.");
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleBack = () => {
    setStep(step - 1)
  }

  const handleCreateInvoice = async () => {
    setError(null);
    const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
    if (!token) {
        setError("Authentication token missing. Please log in.");
        return;
    }
    const result = await createOrRenewInvoice(token);
    if (result.success) {
        // Refresh summary data to show new invoice status
        const statusResponse = await getAccountStatusRequest(token);
        if (statusResponse.success) {
            setSummaryData(statusResponse.data);
        }
        alert('Нэхэмжлэл амжилттай үүслээ. Та банкны апп-аасаа төлбөрөө гүйцэтгэнэ үү.');
    } else {
        setError(result.message || 'Failed to create invoice.');
        alert(`Алдаа: ${result.message || 'Нэхэмжлэл үүсгэхэд алдаа гарлаа.'}`);
    }
  }
  
  const renderContent = () => {
    console.log('renderContent called with viewMode:', viewMode);
    console.log('renderContent summaryData:', summaryData);
    console.log('renderContent summaryData type:', typeof summaryData);
    console.log('renderContent summaryData keys:', summaryData ? Object.keys(summaryData) : 'null');
    
    // Defensive: always pass the correct user data object to SummaryView
    const summary = summaryData && summaryData.data ? summaryData.data : summaryData;
    
    switch (viewMode) {
        case 'loading':
            return <div className="text-center p-8">Loading...</div>
        case 'summary':
            return <SummaryView summaryData={summary} onEdit={() => { 
                setViewMode('form'); 
                // Set the correct step based on whether we have age info
                if (formData.isAdult !== undefined) {
                    setStep(2);
                } else {
                    setStep(1);
                }
            }} onPay={handleCreateInvoice} />
        case 'form':
            if (step === 1) return <Step1 onNext={handleStep1Submit} existingData={formData} />
            if (step === 2 && formData.isAdult === true) return <Step2Adult onNext={submitAllData} onBack={handleBack} registerNumber={registerNumber || undefined} existingData={formData} />
            if (step === 2 && formData.isAdult === false) return <Step2Child onNext={submitAllData} onBack={handleBack} registerNumber={registerNumber || undefined} existingData={formData} />
            // Fallback to step 1 if state is inconsistent
            return <Step1 onNext={handleStep1Submit} existingData={formData} />
    }
  }

  // At the top of the return, conditionally render the register input form
  if (showRegisterInput) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-12">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('profile.enterRegisterNumberTitle', 'Регистрийн дугаар оруулах')}</h1>
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('profile.registerNumber')}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="registerNumber"
              type="text"
              placeholder="AA00112233"
              required
              value={registerInput}
              onChange={e => setRegisterInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors">
              {t('profile.next')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {t('profile.accountSetupGeneral')}
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {viewMode === 'form' && (
            <div className="mb-8">
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-bdsec text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 1 ? <Check className="h-5 w-5" /> : 1}
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-bdsec' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-bdsec text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-center">
                    <span className="text-xs text-gray-500 w-1/2">{t('profile.basicInfo')}</span>
                    <span className="text-xs text-gray-500 w-1/2">{t('profile.personalInfo')}</span>
                </div>
            </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  )
} 