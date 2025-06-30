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
  AccountSetupFormData
} from '@/lib/schemas'
import FormField from '@/components/ui/FormField'
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import Cookies from 'js-cookie'
import { submitAccountSetup } from '@/lib/api'

// Step 1: Adult check only
const Step1 = ({ onNext, registerNumber }: { onNext: (data: AdultCheckFormData) => void, registerNumber?: string }) => {
  const { t } = useTranslation()
  const methods = useForm<AdultCheckFormData>({
    resolver: zodResolver(adultCheckSchema),
    defaultValues: {
      isAdult: undefined,
    }
  })
  
  const onSubmit = (data: AdultCheckFormData) => {
    // Ensure isAdult is a boolean before passing it on
    const formattedData = {
      ...data,
      isAdult: data.isAdult === true
    }
    onNext(formattedData)
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.isAdult')}
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="adult-yes"
                type="radio"
                value="true"
                onChange={() => methods.setValue('isAdult', true)}
                checked={methods.watch('isAdult') === true}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="adult-yes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.yes')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="adult-no"
                type="radio"
                value="false"
                onChange={() => methods.setValue('isAdult', false)}
                checked={methods.watch('isAdult') === false}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="adult-no" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.no')}
              </label>
            </div>
          </div>
          {methods.formState.errors.isAdult && (
            <p className="mt-1 text-sm text-red-500">
              {methods.formState.errors.isAdult.message}
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            {t('profile.next')} <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

// Step 2: Adult information
const Step2Adult = ({ onNext, onBack, registerNumber }: { onNext: (data: AdultInfoFormData) => void, onBack: () => void, registerNumber?: string }) => {
  const { t } = useTranslation()
  const methods = useForm<AdultInfoFormData>({
    resolver: zodResolver(adultInfoSchema),
    defaultValues: {
      registerNumber: registerNumber || '',
      lastName: '',
      firstName: '',
      phoneNumber: '',
      homePhone: '',
      gender: undefined,
      birthDate: '',
      occupation: '',
      homeAddress: '',
    }
  })
  
  // Update the form value when registerNumber prop changes
  useEffect(() => {
    if (registerNumber) {
      methods.setValue('registerNumber', registerNumber)
    }
  }, [registerNumber, methods])
  
  const onSubmit = (data: AdultInfoFormData) => {
    onNext(data)
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="registerNumber"
          label={t('profile.registerNumber')}
          placeholder="AA00112233"
          required
          disabled={!!registerNumber}
        />
        
        <FormField
          name="lastName"
          label={t('profile.lastName')}
          placeholder={t('profile.enterLastName')}
          required
        />
        
        <FormField
          name="firstName"
          label={t('profile.firstName')}
          placeholder={t('profile.enterFirstName')}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.gender')} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="gender-male"
                type="radio"
                value="Male"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.male')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="gender-female"
                type="radio"
                value="Female"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.female')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="gender-unknown"
                type="radio"
                value="Unknown"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="gender-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.unknown')}
              </label>
            </div>
          </div>
          {methods.formState.errors.gender && (
            <p className="mt-1 text-sm text-red-500">
              {methods.formState.errors.gender.message}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.birthDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...methods.register('birthDate')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              methods.formState.errors.birthDate
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          />
          {methods.formState.errors.birthDate && (
            <p className="mt-1 text-sm text-red-500">
              {methods.formState.errors.birthDate.message}
            </p>
          )}
        </div>
        
        <FormField
          name="phoneNumber"
          label={t('profile.phoneNumber')}
          placeholder="88889999"
          required
        />
        
        <FormField
          name="homePhone"
          label={t('profile.homePhone')}
          placeholder="75753636"
        />
        
        <FormField
          name="occupation"
          label={t('profile.occupation')}
          placeholder={t('profile.enterOccupation')}
          required
        />
        
        <FormField
          name="homeAddress"
          label={t('profile.homeAddress')}
          placeholder={t('profile.enterHomeAddress')}
          required
        />
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.back')}
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            {t('profile.next')} <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

// Step 2: Child information
const Step2Child = ({ onNext, onBack, registerNumber }: { onNext: (data: ChildInfoFormData) => void, onBack: () => void, registerNumber?: string }) => {
  const { t } = useTranslation()
  const methods = useForm<ChildInfoFormData>({
    resolver: zodResolver(childInfoSchema),
    defaultValues: {
      childRegisterNumber: registerNumber || '',
      parentRegisterNumber: '',
      lastName: '',
      firstName: '',
      phoneNumber: '',
      homePhone: '',
      gender: undefined,
      birthDate: '',
      homeAddress: '',
    }
  })
  
  // Update the form value when registerNumber prop changes
  useEffect(() => {
    if (registerNumber) {
      methods.setValue('childRegisterNumber', registerNumber)
    }
  }, [registerNumber, methods])
  
  const onSubmit = (data: ChildInfoFormData) => {
    onNext(data)
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="childRegisterNumber"
          label={t('profile.childRegisterNumber')}
          placeholder="AA00112233"
          required
          disabled={!!registerNumber}
        />
        
        <FormField
          name="parentRegisterNumber"
          label={t('profile.parentRegisterNumber')}
          placeholder="AA00112233"
          required
        />
        
        <FormField
          name="lastName"
          label={t('profile.lastName')}
          placeholder={t('profile.enterLastName')}
          required
        />
        
        <FormField
          name="firstName"
          label={t('profile.firstName')}
          placeholder={t('profile.enterFirstName')}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.gender')} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="child-gender-male"
                type="radio"
                value="Male"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="child-gender-male" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.male')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="child-gender-female"
                type="radio"
                value="Female"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="child-gender-female" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.female')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="child-gender-unknown"
                type="radio"
                value="Unknown"
                {...methods.register('gender')}
                className="h-4 w-4 text-bdsec dark:text-indigo-500 focus:ring-bdsec dark:focus:ring-indigo-500"
              />
              <label htmlFor="child-gender-unknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('profile.unknown')}
              </label>
            </div>
          </div>
          {methods.formState.errors.gender && (
            <p className="mt-1 text-sm text-red-500">
              {methods.formState.errors.gender.message}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.birthDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...methods.register('birthDate')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              methods.formState.errors.birthDate
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          />
          {methods.formState.errors.birthDate && (
            <p className="mt-1 text-sm text-red-500">
              {methods.formState.errors.birthDate.message}
            </p>
          )}
        </div>
        
        <FormField
          name="phoneNumber"
          label={t('profile.phoneNumber')}
          placeholder="88889999"
          required
        />
        
        <FormField
          name="homePhone"
          label={t('profile.homePhone')}
          placeholder="75753636"
        />
        
        <FormField
          name="homeAddress"
          label={t('profile.homeAddress')}
          placeholder={t('profile.enterHomeAddress')}
          required
        />
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.back')}
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            {t('profile.next')} <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default function GeneralInfoPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<AccountSetupFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerNumber, setRegisterNumber] = useState<string | null>(null)
  
  // Get register number from URL or session storage
  useEffect(() => {
    // Get token from cookies and save it
    const authToken = Cookies.get('auth_token')
    if (authToken) {
      // Store token in cookie for use in API calls
      Cookies.set('token', authToken, { expires: 7 })
    } else {
      // If no auth_token, set a fallback demo token for development
      const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
      Cookies.set('token', demoToken, { expires: 7 })
      console.log('Using fallback demo token for development')
    }
    
    // First check if we have it in auth session storage
    const authRegNumber = sessionStorage.getItem('registerNumber')
    if (authRegNumber) {
      setRegisterNumber(authRegNumber)
      console.log('Using register number from auth session:', authRegNumber)
    } 
    // Then check URL parameter
    else {
      const regNumber = searchParams.get('registerNumber')
      if (regNumber) {
        setRegisterNumber(regNumber)
        console.log('Using register number from URL:', regNumber)
      } 
      // Finally check account setup data
      else {
        const storedData = sessionStorage.getItem('accountSetupData')
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (parsedData.registerNumber) {
              setRegisterNumber(parsedData.registerNumber)
              console.log('Using register number from stored data:', parsedData.registerNumber)
            }
          } catch (e) {
            console.error('Error parsing stored data:', e)
          }
        }
      }
    }
  }, [searchParams])
  
  const handleStep1Submit = (data: AdultCheckFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(2)
  }
  
  const handleStep2AdultSubmit = (data: AdultInfoFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    
    // Save form data to session storage
    const combinedData = { ...formData, ...data, isAdult: true }
    sessionStorage.setItem('accountSetupData', JSON.stringify(combinedData))
    
    // Also save the register number separately for other components to access
    if (data.registerNumber) {
      sessionStorage.setItem('registerNumber', data.registerNumber)
    }
    
    router.push('/account-setup/fee')
  }
  
  const handleStep2ChildSubmit = (data: ChildInfoFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    
    // Save form data to session storage
    const combinedData = { ...formData, ...data, isAdult: false }
    sessionStorage.setItem('accountSetupData', JSON.stringify(combinedData))
    
    // Also save the register number separately for other components to access
    if (data.childRegisterNumber) {
      sessionStorage.setItem('registerNumber', data.childRegisterNumber)
    }
    
    router.push('/account-setup/fee')
  }
  
  const handleBack = () => {
    setStep(step - 1)
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
        
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-bdsec dark:bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {step > 1 ? <Check className="h-5 w-5" /> : 1}
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-bdsec dark:bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-bdsec dark:bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700`}></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              3
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.basicInfo')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.personalInfo')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.accountFee')}</span>
          </div>
        </div>
        
        {step === 1 && <Step1 onNext={handleStep1Submit} registerNumber={registerNumber || undefined} />}
        {step === 2 && formData.isAdult === true && <Step2Adult onNext={handleStep2AdultSubmit} onBack={handleBack} registerNumber={registerNumber || undefined} />}
        {step === 2 && formData.isAdult === false && <Step2Child onNext={handleStep2ChildSubmit} onBack={handleBack} registerNumber={registerNumber || undefined} />}
      </div>
    </div>
  )
} 