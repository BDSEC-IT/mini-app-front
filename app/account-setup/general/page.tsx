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
import { getAccountStatusRequest, sendAccountStatusRequest, createOrRenewInvoice, getUserAccountInformation, getRegistrationNumber, sendRegistrationNumber, BASE_URL, checkInvoiceStatus } from '@/lib/api'

export default function GeneralInfoPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nationality = searchParams.get('nationality') || '496'
  
  const [step, setStep] = useState(1)
  const [viewMode, setViewMode] = useState<'loading' | 'form' | 'summary'>('loading');
  const [formData, setFormData] = useState<Partial<AccountSetupFormData>>({})
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerNumber, setRegisterNumber] = useState<string | null>(null)
  const [showRegisterInput, setShowRegisterInput] = useState(false);
  const [registerInput, setRegisterInput] = useState('');
  const [countries, setCountries] = useState<{ countryCode: string, countryName: string }[]>([]);
  const [banks, setBanks] = useState<{ BankCode: string, BankName: string }[]>([]);

  useEffect(() => {
    // Fetch countries
    fetch(`${BASE_URL}/helper/countries`)
      .then(res => res.json())
      .then(data => {
        setCountries(data.data || []);
        // If the form does not have a countryCode, set default to Mongolia ('496') if available, else first country
        if (!(formData as any).countryCode) {
          const mn = (data.data || []).find((c: any) => c.countryNameEn === 'Mongolia' || c.countryName === 'Монгол');
          setFormData(prev => ({
            ...prev,
            countryCode: mn ? mn.countryCode : (data.data?.[0]?.countryCode || '')
          }));
        }
      });
    // Fetch banks
    fetch(`${BASE_URL}/helper/banks`)
      .then(res => res.json())
      .then(data => setBanks(data.data || []));
  }, []);

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
                <input id="adult-yes" type="radio" value="true" onChange={() => methods.setValue('isAdult', true)} checked={methods.watch('isAdult') === true} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" />
                <label htmlFor="adult-yes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.yes')}</label>
              </div>
              <div className="flex items-center">
                <input id="adult-no" type="radio" value="false" onChange={() => methods.setValue('isAdult', false)} checked={methods.watch('isAdult') === false} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" />
                <label htmlFor="adult-no" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.no')}</label>
              </div>
            </div>
            {methods.formState.errors.isAdult && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.isAdult.message}</p>}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-bdsec dark:bg-indigo-500 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
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
    const searchParams = useSearchParams()
    const nationality = searchParams.get('nationality') || '496'
    
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
        accountNumber: existingData?.accountNumber || '',
        countryCode: existingData?.countryCode || nationality
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
          accountNumber: existingData.accountNumber || '',
          countryCode: existingData.countryCode || nationality
        });
      }
    }, [existingData, registerNumber, methods])
    
    const onSubmit = (data: AdultInfoFormData) => {
      onNext({ ...data, customerType: '0' });
    }
    
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <FormField name="registerNumber" label={t('profile.registerNumber')} placeholder="AA00112233" required disabled={!!registerNumber} />
          <FormField name="lastName" label={t('profile.lastName')} placeholder={t('profile.enterLastName')} required />
          <FormField name="firstName" label={t('profile.firstName')} placeholder={t('profile.enterFirstName')} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.gender')} <span className="text-red-500">*</span></label>
            <div className="flex space-x-4">
              <div className="flex items-center"><input id="gender-male" type="radio" value="Male" {...methods.register('gender')} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" /><label htmlFor="gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.male')}</label></div>
              <div className="flex items-center"><input id="gender-female" type="radio" value="Female" {...methods.register('gender')} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" /><label htmlFor="gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.female')}</label></div>
            </div>
            {methods.formState.errors.gender && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.gender.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.birthDate')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="date" 
                {...methods.register('birthDate')} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                style={{ 
                  fontSize: '16px', // Prevents zoom on iOS
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {methods.formState.errors.birthDate && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.birthDate.message}</p>}
          </div>
          <FormField name="phoneNumber" label={t('profile.phoneNumber')} placeholder="88889999" required />
          <FormField name="homePhone" label={t('profile.homePhone')} placeholder="75753636" />
          <FormField name="occupation" label={t('profile.occupation')} placeholder={t('profile.enterOccupation')} required />
          <FormField name="homeAddress" label={t('profile.homeAddress')} placeholder={t('profile.enterHomeAddress')} required />
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('profile.bankInfo')}</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">Банкны мэдээлэл нь ирээдүйд ҮЦТХТ дансаасаа мөнгө татах, оруулахад ашиглагдана.</div>
            <div className="mb-4">
              <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.selectBank')} <span className="text-red-500">*</span></label>
              <select id="bankCode" {...methods.register('bankCode')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.bankCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}>
                <option value="">{t('profile.selectBank')}</option>
                {banks.map(b => (
                  <option key={b.BankCode} value={b.BankCode}>
                    {b.BankName}
                  </option>
                ))}
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
               <div className="flex items-center"><input id="child-gender-male" type="radio" value="Male" {...methods.register('gender')} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" /><label htmlFor="child-gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.male')}</label></div>
               <div className="flex items-center"><input id="child-gender-female" type="radio" value="Female" {...methods.register('gender')} className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500" /><label htmlFor="child-gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('profile.female')}</label></div>
            </div>
            {methods.formState.errors.gender && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.gender.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.birthDate')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="date" 
                {...methods.register('birthDate')} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                style={{ 
                  fontSize: '16px', // Prevents zoom on iOS
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {methods.formState.errors.birthDate && <p className="mt-1 text-sm text-red-500">{methods.formState.errors.birthDate.message}</p>}
          </div>
          <FormField name="phoneNumber" label={t('profile.phoneNumber')} placeholder="88889999" required />
          <FormField name="homePhone" label={t('profile.homePhone')} placeholder="75753636" />
          <FormField name="homeAddress" label={t('profile.homeAddress')} placeholder={t('profile.enterHomeAddress')} required />
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{t('profile.bankInfo')}</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">Банкны мэдээлэл нь ирээдүйд ҮЦТХТ дансаасаа мөнгө татах, оруулахад ашиглагдана.</div>
            <div className="mb-4">
              <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.selectBank')} <span className="text-red-500">*</span></label>
              <select id="bankCode" {...methods.register('bankCode')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${methods.formState.errors.bankCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}>
                <option value="">{t('profile.selectBank')}</option>
                {banks.map(b => (
                  <option key={b.BankCode} value={b.BankCode}>
                    {b.BankName}
                  </option>
                ))}
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
      // Reduced debug logging to improve performance
      // console.log('SummaryView received summaryData:', summaryData);
      // console.log('SummaryView data type:', typeof summaryData);
      // console.log('SummaryView data keys:', summaryData ? Object.keys(summaryData) : 'null');

      const { t } = useTranslation()
      const [isProcessing, setIsProcessing] = useState(false);

      const handlePayment = async () => {
          setIsProcessing(true);
          await onPay();
          setIsProcessing(false);
          // Trigger sidebar refresh
          window.dispatchEvent(new Event('accountSetupDataChanged'));
      }
      
      const bankCode = summaryData?.BankCode || summaryData?.bankCode;
      const bankName = banks.find(b => b.BankCode === bankCode)?.BankName || (summaryData?.BankName || summaryData?.bankName || bankCode);
      console.log("summaryData",summaryData)
      const isPaid = summaryData?.invoiceStatus === 'PAID';

      return (
          <div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Таны мэдээлэл</h2>
                  <button onClick={onEdit} disabled={isPaid} className="disabled:opacity-50 text-sm text-bdsec dark:text-indigo-400 hover:underline flex items-center gap-1">
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
                          onClick={()=>{
                            router.push('/account-setup/fee');
                          }}
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

  useEffect(() => {
    const fetchStatusAndSetMode = async () => {
        const existingToken = Cookies.get('token');
        
        if (existingToken) {
            try {
                // First, check if user has a registration number
                const regRes = await getRegistrationNumber(existingToken);
                // console.log('General page - Registration number response:', regRes);
                
                if (!regRes.registerNumber) {
                    // No registration number, show register input form
                    setShowRegisterInput(true);
                    setViewMode('loading');
                    return;
                } else {
                    // User has registration number, set it and continue with status check
                    setShowRegisterInput(false);
                    setRegisterNumber(regRes.registerNumber);
                }
                
                // Now check account status
                const statusResponse = await getAccountStatusRequest(existingToken);
                
                // Reduced debug logging to improve performance
                // console.log('General page - statusResponse:', statusResponse);
                
                let hasSubmittedData = false;
                let isDataComplete = false;
                
                if (statusResponse.success && statusResponse.data) {
                    const data = statusResponse.data;
                    
                    // Check if we have valid status data
                    const hasValidStatus = statusResponse.success;
                    const hasId = data && data.id;
                    const hasPascalCaseData = data && (data.FirstName || data.LastName || data.RegistryNumber);
                    const hasCamelCaseData = data && (data.firstName || data.lastName || data.registerNumber);
                    const hasFallbackData = data && Object.keys(data).length > 0;
                    
                    hasSubmittedData = hasValidStatus || hasId || hasPascalCaseData || hasCamelCaseData || hasFallbackData;
                    
                    // Trust the backend's validation if it exists
                    const backendValidation = (statusResponse.data as any)?.validation;
                    
                    if (backendValidation) {
                        // Backend provides validation, trust it
                        isDataComplete = backendValidation.isValid === true;
                        console.log('General page - Using backend validation:', backendValidation);
                    } else {
                        // Fallback validation if backend doesn't provide validation
                        const requiredFields = [
                            'FirstName', 'LastName', 'RegistryNumber', 'MobilePhone', 
                            'Gender', 'BirthDate', 'Occupation', 'HomeAddress', 
                            'BankCode', 'BankAccountNumber', 'CustomerType', 'Country'
                        ];
                        
                        const missingRequiredFields = requiredFields.filter(field => {
                            const value = data[field];
                            // Check if the field is null, undefined, or empty string
                            return value === null || value === undefined || value === '';
                        });
                        
                        isDataComplete = missingRequiredFields.length === 0;
                        
                        console.log('General page - Fallback validation:', {
                            missingRequiredFields,
                            isDataComplete
                        });
                    }
                    
                    console.log('General page - Data completeness check:', {
                        isDataComplete,
                        backendValidation,
                        hasSubmittedData
                    });
                } else {
                    // 404 or other error - user hasn't submitted data yet
                    // console.log('General page - No account status found (404 expected for new users)');
                    hasSubmittedData = false;
                    isDataComplete = false;
                }
                
                if (hasSubmittedData && isDataComplete) {
                    // User has submitted complete info, show summary
                    // console.log('General page - User has submitted complete data, showing summary');
                    // console.log('About to set summaryData with:', statusResponse.data);
                    // console.log('Type of statusResponse:', typeof statusResponse);
                    // console.log('Keys of statusResponse:', Object.keys(statusResponse));
                    // console.log('Type of statusResponse.data:', typeof statusResponse.data);
                    
                    // Fix: Set only the data portion, not the entire response
                    const invoiceStatus = await checkInvoiceStatus(existingToken);
                    if(invoiceStatus.success && invoiceStatus.data?.data?.registrationFee?.status === 'COMPLETED'){
                      statusResponse.data.data.invoiceStatus = 'PAID';
                      setSummaryData(statusResponse.data);
                      setViewMode('summary');
                      return
                    }
                    else{
                      setSummaryData(statusResponse.data);
                    }
                    setViewMode('summary');
                    
                    // Pre-populate form data for edit mode
                    const existingData = statusResponse.data;
                    const mappedData = {
                        isAdult: existingData.isAdult || (existingData.CustomerType === 1) || 
                                // Fallback: if no explicit customer type, assume adult if we have occupation
                                (existingData.Occupation || existingData.occupation ? true : undefined),
                        registerNumber: existingData.RegistryNumber || existingData.registerNumber || existingData.childRegisterNumber || '',
                        childRegisterNumber: existingData.childRegisterNumber || '',
                        parentRegisterNumber: existingData.parentRegisterNumber || '',
                        firstName: existingData.FirstName || existingData.firstName || '',
                        lastName: existingData.LastName || existingData.lastName || '',
                        phoneNumber: existingData.MobilePhone || existingData.phoneNumber || '',
                        homePhone: existingData.HomePhone || existingData.homePhone || '',
                        gender: existingData.Gender || existingData.gender || '',
                        birthDate: existingData.BirthDate || existingData.birthDate || '',
                        occupation: existingData.Occupation || existingData.occupation || '',
                        homeAddress: existingData.HomeAddress || existingData.homeAddress || '',
                        bankCode: existingData.BankCode || existingData.bankCode || '',
                        accountNumber: existingData.BankAccountNumber || existingData.bankAccountNumber || existingData.accountNumber || '',
                        customerType: existingData.CustomerType || existingData.customerType || '0',
                        countryCode: existingData.Country || existingData.countryCode || nationality
                    };
                    
                    setFormData(mappedData);
                    
                    // Set step to 2 since we have submitted data
                    setStep(2);
                    
                    console.log('General page - Set summary mode with data:', mappedData);
                    // console.log('General page - Summary data should be:', statusResponse.data);
                } else if (hasSubmittedData && !isDataComplete) {
                    // User has submitted incomplete data, show form in edit mode
                    // console.log('General page - User has submitted incomplete data, showing form in edit mode');
                    
                    // Pre-populate form data with existing data
                    const existingData = statusResponse.data;
                    const mappedData = {
                        isAdult: existingData.isAdult || (existingData.CustomerType === 1) || 
                                // Fallback: if no explicit customer type, assume adult if we have occupation
                                (existingData.Occupation || existingData.occupation ? true : undefined),
                        registerNumber: existingData.RegistryNumber || existingData.registerNumber || existingData.childRegisterNumber || '',
                        childRegisterNumber: existingData.childRegisterNumber || '',
                        parentRegisterNumber: existingData.parentRegisterNumber || '',
                        firstName: existingData.FirstName || existingData.firstName || '',
                        lastName: existingData.LastName || existingData.lastName || '',
                        phoneNumber: existingData.MobilePhone || existingData.phoneNumber || '',
                        homePhone: existingData.HomePhone || existingData.homePhone || '',
                        gender: existingData.Gender || existingData.gender || '',
                        birthDate: existingData.BirthDate || existingData.birthDate || '',
                        occupation: existingData.Occupation || existingData.occupation || '',
                        homeAddress: existingData.HomeAddress || existingData.homeAddress || '',
                        bankCode: existingData.BankCode || existingData.bankCode || '',
                        accountNumber: existingData.BankAccountNumber || existingData.bankAccountNumber || existingData.accountNumber || '',
                        customerType: existingData.CustomerType || existingData.customerType || '0',
                        countryCode: existingData.Country || existingData.countryCode || nationality
                    };
                    
                    setFormData(mappedData);
                    setViewMode('form');
                    setStep(2); // Skip step 1 since we know it's an adult
                    
                    console.log('General page - Set form mode with existing data:', mappedData);
                } else {
                    // New user, show form
                    // console.log('General page - User has NOT submitted data, showing form');
                    const authRegNumber = searchParams.get('registerNumber');
                    if (authRegNumber) {
                        setRegisterNumber(authRegNumber);
                    }
                    setViewMode('form');
                    // console.log('General page - Set form mode');
                }
            } catch (error) {
                console.error('Error fetching status:', error);
                setViewMode('form');
            }
        } else {
            // No token, treat as a new user for now
            // console.log('General page - No token, showing form');
            setViewMode('form');
        }
    };

    const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDg4MjN9.CP4XJIAlErOi8fwrQ-vmBA4XT_wzdvIXw2lZ1wFbBII"
    if (!Cookies.get('jwt') && !Cookies.get('token') ) {
        Cookies.set('jwt', demoToken, { expires: 7 })
    }
    
    fetchStatusAndSetMode();
  }, [searchParams, t])

  
  const handleStep1Submit = (data: AdultCheckFormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }
  
  const submitAllData = async (data: AdultInfoFormData | ChildInfoFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    console.log('=== SUBMIT ALL DATA DEBUG ===');
    console.log('Raw data received:', data);
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data));
    console.log('Form data:', formData);
    console.log('Nationality:', nationality);
    
    const combinedData: any = { ...formData, ...data };
    
    // Map form field names to backend field names - use camelCase to match backend
    const mappedData = {
      isAdult: formData.isAdult,
      registerNumber: (data as any).registerNumber || (data as any).childRegisterNumber,
      childRegisterNumber: (data as any).childRegisterNumber,
      parentRegisterNumber: (data as any).parentRegisterNumber,
      mobilePhone: data.phoneNumber,
      registryNumber: (data as any).registerNumber || (data as any).childRegisterNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      homePhone: data.homePhone,
      gender: data.gender,
      birthDate: data.birthDate,
      occupation: (data as any).occupation,
      homeAddress: data.homeAddress,
      bankCode: data.bankCode,
      bankName: '', // Will be set below
      bankAccountNumber: data.accountNumber,
      customerType: String((data as any).customerType ?? '0'), // Always send as string
      countryCode: nationality
    };
    
    // Add bank name from the bank code
    const bank = banks.find(b => b.BankCode === data.bankCode);
    mappedData.bankName = bank?.BankName || '';
    
    // Debug: Log the request body
    console.log('Mapped data before API call (camelCase):', mappedData);
    console.log('=== END SUBMIT DEBUG ===');

    const token = Cookies.get('token');

    if (!token) {
        setError("Authentication token missing. Please log in.");
        setIsSubmitting(false);
        return;
    }

    try {
        console.log('=== FORM SUBMISSION DEBUG ===');
        console.log('Form data:', formData);
        console.log('Step data:', data);
        console.log('Combined data:', combinedData);
        console.log('Nationality:', nationality);
        console.log('Mapped data being sent:', mappedData);
        console.log('=== END DEBUG ===');
        const result = await sendAccountStatusRequest(mappedData, token);
        
        if (result.success) {
            console.log('Account setup submission successful:', result);
            
            // Use the submitted data directly for the summary view
            setSummaryData(mappedData);
            setViewMode('summary');
            
            // Trigger sidebar refresh
            window.dispatchEvent(new Event('accountSetupDataChanged'));
            console.log('Triggered accountSetupDataChanged event');
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
    const token = Cookies.get('token');
    if (!token) {
        setError("Authentication token missing. Please log in.");
        return;
    }

    // First, validate that account status request has all required fields
    const statusResponse = await getAccountStatusRequest(token);
    if (!statusResponse.success || !statusResponse.data) {
        setError("Failed to get account status. Please complete your account setup first.");
        alert("Алдаа: Дансны мэдээлэл олдсонгүй. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
        return;
    }

    const accountData = statusResponse.data;
    
    // Debug: Log the actual account data structure
    console.log('=== ACCOUNT STATUS DEBUG ===');
    console.log('Account data:', accountData);
    console.log('Account data keys:', Object.keys(accountData || {}));
    console.log('Backend validation:', (statusResponse.data as any)?.validation);
    console.log('=== END DEBUG ===');
    
    // Trust the backend's validation if it exists
    const backendValidation = (statusResponse.data as any)?.validation;
    if (backendValidation && backendValidation.isValid === false) {
        console.error('Backend validation failed:', backendValidation);
        setError("Account setup is incomplete. Please complete your account setup first.");
        alert("Алдаа: Дансны мэдээлэл бүрэн бөгөөгүй байна. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
        return;
    }
    
    // Fallback validation only if backend doesn't provide validation
    if (!backendValidation) {
        // Check for required fields - if any are null, account status creation failed
        // Check both PascalCase and camelCase field names since backend might return either
        const requiredFields = [
            { pascalCase: 'FirstName', camelCase: 'firstName' },
            { pascalCase: 'LastName', camelCase: 'lastName' },
            { pascalCase: 'RegistryNumber', camelCase: 'registryNumber' },
            { pascalCase: 'MobilePhone', camelCase: 'mobilePhone' },
            { pascalCase: 'Gender', camelCase: 'gender' },
            { pascalCase: 'BirthDate', camelCase: 'birthDate' },
            { pascalCase: 'HomeAddress', camelCase: 'homeAddress' },
            { pascalCase: 'BankCode', camelCase: 'bankCode' },
            { pascalCase: 'BankAccountNumber', camelCase: 'bankAccountNumber' },
            { pascalCase: 'Country', camelCase: 'country' } // Backend returns 'Country' field
        ];
        
        const missingFields = requiredFields.filter(field => {
            const pascalValue = accountData[field.pascalCase];
            const camelValue = accountData[field.camelCase];
            const value = pascalValue !== undefined ? pascalValue : camelValue;
            return value === null || value === undefined || value === '';
        });

        if (missingFields.length > 0) {
            console.error('Account status validation failed. Missing fields:', missingFields);
            console.error('Account data:', accountData);
            setError("Account setup is incomplete. Some required fields are missing. Please complete your account setup first.");
            alert("Алдаа: Дансны мэдээлэл бүрэн бөгөөгүй байна. Зарим талбарууд хоосон байна. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
            return;
        }
    }

    // If all validations pass, proceed with invoice creation
    const result = await createOrRenewInvoice(token);
    if (result.success) {
        // Refresh summary data to show new invoice status
        const updatedStatusResponse = await getAccountStatusRequest(token);
        if (updatedStatusResponse.success) {
            setSummaryData(updatedStatusResponse.data);
        }
        alert('Нэхэмжлэл амжилттай үүслээ. Та банкны апп-аасаа төлбөрөө гүйцэтгэнэ үү.');
    } else {
        setError(result.message || 'Failed to create invoice.');
        alert(`Алдаа: ${result.message || 'Нэхэмжлэл үүсгэхэд алдаа гарлаа.'}`);
    }
  }
  
  const renderContent = () => {
    // Reduced debug logging to improve performance
    // console.log('renderContent called with viewMode:', viewMode);
    // console.log('renderContent summaryData:', summaryData);
    // console.log('renderContent summaryData type:', typeof summaryData);
    // console.log('renderContent summaryData keys:', summaryData ? Object.keys(summaryData) : 'null');
    
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

  // Handler for register number submission (POST)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerInput.trim()) {
      setError(t('profile.enterRegisterNumber'));
      return;
    }
    const token = Cookies.get('token');
    const res = await sendRegistrationNumber(registerInput.trim(), nationality, token!);
    if (res.success) {
      setRegisterNumber(registerInput.trim());
      setShowRegisterInput(false);
      setError(null);
      // After successful registration, re-fetch status to update the view
      // Trigger a re-render by updating searchParams or force a refresh
      window.location.reload();
    } else {
      setError(res.message || t('profile.formError'));
    }
  };

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
            <button type="submit" className="w-full px-4 py-2 bg-bdsec dark:bg-indigo-500 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
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
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-bdsec dark:bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 1 ? <Check className="h-5 w-5" /> : 1}
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-bdsec dark:bg-indigo-500' : 'bg-gray-200'}`}></div>
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