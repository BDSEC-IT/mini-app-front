'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { z } from 'zod';
import { BASE_URL, getUserAccountInformation } from '@/lib/api';

// ============ ZOD SCHEMAS ============

const emergencyContactSchema = z.object({
  who: z.string().min(1, 'kycAdditional.validation.emergencyWhoRequired'),
  phone: z.string().min(8, 'kycAdditional.validation.phoneMin8'),
  address: z.string().optional(),
  lastName: z.string().min(1, 'kycAdditional.validation.lastNameRequired'),
  firstName: z.string().min(1, 'kycAdditional.validation.firstNameRequired'),
  registerCode: z.string().optional(),
});

const kycAdditionalFormSchema = z.object({
  familyName: z.string().min(1, 'kycAdditional.validation.familyNameRequired'),
  name: z.string().min(1, 'kycAdditional.validation.nameRequired'),
  surname: z.string().nullable().optional(),
  register: z.string().min(6, 'kycAdditional.validation.registerMin6').max(10, 'kycAdditional.validation.registerMax10'),
  birthday: z.string().min(1, 'kycAdditional.validation.birthdayRequired'),
  birthDate: z.string().optional(),
  sex: z.enum(['male', 'female']),
  monthly_income: z.string().optional(),
  income_source: z.string().optional(),
  phone: z.string().min(8, 'kycAdditional.validation.phoneMin8'),
  emergencyContact: z.array(emergencyContactSchema).min(1),
  education: z.string().optional(),
  occupation: z.string().optional(),
  jobTitle: z.string().optional(),
  workPhone: z.string().optional(),
  workPlaceName: z.string().optional(),
  employmentStatus: z.string().optional(),
  isHavePolitically: z.boolean(),
  email: z.string().email('kycAdditional.validation.emailInvalid'),
  is_politically: z.boolean(),
  business_sector: z.string().optional(),
});

type EmergencyContact = z.infer<typeof emergencyContactSchema>;
type KycAdditionalFormData = z.infer<typeof kycAdditionalFormSchema>;

interface KycAdditionalData extends KycAdditionalFormData {
  id?: number;
  identityCardUrl?: string | null;
  identityCard2Url?: string | null;
  identityCard3Url?: string | null;
  sentToIStock?: boolean;
}

type FormStep = 'text' | 'image';

interface FieldError {
  [key: string]: string | undefined;
}

export default function KycAdditionalInfoPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('text');
  const [existingData, setExistingData] = useState<KycAdditionalData | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  
  // Check if form was already submitted (has an ID means it's saved in DB)
  const isAlreadySubmitted = !!(existingData?.id);
  
  // Dropdown options with translations
  const MONTHLY_INCOME_OPTIONS = useMemo(() => [
    { value: 'below_500000', labelKey: 'kycAdditional.income.below500k' },
    { value: '500001_1000000', labelKey: 'kycAdditional.income.500kTo1m' },
    { value: '1000001_3000000', labelKey: 'kycAdditional.income.1mTo3m' },
    { value: '3000001_5000000', labelKey: 'kycAdditional.income.3mTo5m' },
    { value: 'above_5000001', labelKey: 'kycAdditional.income.above5m' },
  ], []);

  const INCOME_SOURCE_OPTIONS = useMemo(() => [
    { value: 'salary', labelKey: 'kycAdditional.incomeSource.salary' },
    { value: 'business', labelKey: 'kycAdditional.incomeSource.business' },
    { value: 'investment', labelKey: 'kycAdditional.incomeSource.investment' },
    { value: 'pension', labelKey: 'kycAdditional.incomeSource.pension' },
    { value: 'other', labelKey: 'kycAdditional.incomeSource.other' },
  ], []);

  const EDUCATION_OPTIONS = useMemo(() => [
    { value: 'primary', labelKey: 'kycAdditional.education.primary' },
    { value: 'secondary', labelKey: 'kycAdditional.education.secondary' },
    { value: 'vocational', labelKey: 'kycAdditional.education.vocational' },
    { value: 'bachelor', labelKey: 'kycAdditional.education.bachelor' },
    { value: 'master', labelKey: 'kycAdditional.education.master' },
    { value: 'doctorate', labelKey: 'kycAdditional.education.doctorate' },
  ], []);

  const EMPLOYMENT_STATUS_OPTIONS = useMemo(() => [
    { value: 'full_time', labelKey: 'kycAdditional.employment.fullTime' },
    { value: 'part_time', labelKey: 'kycAdditional.employment.partTime' },
    { value: 'self_employed', labelKey: 'kycAdditional.employment.selfEmployed' },
    { value: 'unemployed', labelKey: 'kycAdditional.employment.unemployed' },
    { value: 'retired', labelKey: 'kycAdditional.employment.retired' },
    { value: 'student', labelKey: 'kycAdditional.employment.student' },
  ], []);

  const EMERGENCY_CONTACT_WHO_OPTIONS = useMemo(() => [
    { value: 'parent', labelKey: 'kycAdditional.emergencyWho.parent' },
    { value: 'sibling', labelKey: 'kycAdditional.emergencyWho.sibling' },
    { value: 'youngerSibling', labelKey: 'kycAdditional.emergencyWho.youngerSibling' },
    { value: 'spouse', labelKey: 'kycAdditional.emergencyWho.spouse' },
    { value: 'friend', labelKey: 'kycAdditional.emergencyWho.friend' },
    { value: 'other', labelKey: 'kycAdditional.emergencyWho.other' },
  ], []);

  // Form data with defaults
  const [formData, setFormData] = useState<KycAdditionalFormData>({
    familyName: '',
    name: '',
    surname: null,
    register: '',
    birthday: '',
    birthDate: '',
    sex: 'male',
    monthly_income: '',
    income_source: '',
    phone: '',
    emergencyContact: [{
      who: '',
      phone: '',
      address: '',
      lastName: '',
      firstName: '',
      registerCode: '',
    }],
    education: '',
    occupation: '',
    jobTitle: '',
    workPhone: '',
    workPlaceName: '',
    employmentStatus: '',
    isHavePolitically: false,
    email: '',
    is_politically: false,
    business_sector: '',
  });

  // Image uploads
  const [identityCard1Preview, setIdentityCard1Preview] = useState<string | null>(null);
  const [identityCard2Preview, setIdentityCard2Preview] = useState<string | null>(null);
  const [identityCard3Preview, setIdentityCard3Preview] = useState<string | null>(null);
  const [identityCard1File, setIdentityCard1File] = useState<File | null>(null);
  const [identityCard2File, setIdentityCard2File] = useState<File | null>(null);
  const [identityCard3File, setIdentityCard3File] = useState<File | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error(t('common.pleaseLogin', 'Please login'));
        router.push('/auth/login');
        return;
      }

      // Fetch both user account info and existing KYC additional data in parallel
      const [accountResult, kycResult, kycPicturesResult] = await Promise.all([
        getUserAccountInformation(token),
        fetchKycAdditionalData(token),
        fetchKycPictures(token),
      ]);

      // Get data from superAppAccount, MCSDStateRequest, and MCSDAccount for auto-fill
      const superApp = accountResult.success ? accountResult.data?.superAppAccount as any : null;
      const mcsdRequest = superApp?.MCSDStateRequest || {};
      const mcsdAccount = superApp?.MCSDAccount || {};

      // Check if there's existing KYC additional data (already submitted - has an ID)
      const hasExistingData = kycResult && kycResult.id;
      
      if (hasExistingData) {
        setExistingData(kycResult);
        setFormData(prev => ({
          ...prev,
          ...kycResult,
          emergencyContact: kycResult.emergencyContact?.length 
            ? kycResult.emergencyContact 
            : prev.emergencyContact,
        }));
      } else {
        // No existing KYC additional data, auto-fill from user account data
        // Try MCSDAccount first (already approved account), then MCSDStateRequest (pending request)
        const birthDate = mcsdAccount.BirthDate || mcsdRequest.BirthDate || '';
        const gender = mcsdAccount.Gender || mcsdRequest.Gender || '';
        
        setFormData(prev => ({
          ...prev,
          // Personal info from superAppAccount
          familyName: superApp?.lastName || mcsdAccount.LastName || mcsdRequest.LastName || prev.familyName || '',
          name: superApp?.firstName || mcsdAccount.FirstName || mcsdRequest.FirstName || prev.name || '',
          phone: superApp?.phone || mcsdAccount.MobilePhone || mcsdRequest.MobilePhone || prev.phone || '',
          email: superApp?.email || prev.email || '',
          register: superApp?.register || mcsdAccount.RegistryNumber || mcsdRequest.RegistryNumber || prev.register || '',
          // BirthDate and Gender from MCSDAccount or MCSDStateRequest
          birthday: birthDate || prev.birthday || '',
          birthDate: birthDate || prev.birthDate || '',
          sex: gender === 'Female' ? 'female' : gender === 'Male' ? 'male' : prev.sex,
          occupation: mcsdAccount.Occupation || mcsdRequest.Occupation || prev.occupation || '',
        }));
      }
      
      // Set image previews from KYC pictures data (same endpoint as /account-setup/kyc)
      if (kycPicturesResult) {
        const timestamp = new Date().getTime();
        if (kycPicturesResult.nationalIdFront) {
          setIdentityCard1Preview(`/api/kyc-image?field=nationalIdFront&t=${timestamp}`);
        }
        if (kycPicturesResult.nationalIdBack) {
          setIdentityCard2Preview(`/api/kyc-image?field=nationalIdBack&t=${timestamp}`);
        }
        if (kycPicturesResult.selfie) {
          setIdentityCard3Preview(`/api/kyc-image?field=selfie&t=${timestamp}`);
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error(t('kycAdditional.fetchError', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const fetchKycAdditionalData = async (token: string): Promise<KycAdditionalData | null> => {
    try {
      const response = await fetch(`${BASE_URL}/kyc/additional`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching KYC additional data:', error);
      return null;
    }
  };

  const fetchKycPictures = async (token: string): Promise<{ nationalIdFront?: string; nationalIdBack?: string; selfie?: string } | null> => {
    try {
      const response = await fetch(`${BASE_URL}/kyc/pictures`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching KYC pictures:', error);
      return null;
    }
  };

  const handleInputChange = (field: keyof KycAdditionalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData(prev => {
      const newContacts = [...prev.emergencyContact];
      newContacts[index] = {
        ...newContacts[index],
        [field]: value,
      };
      return {
        ...prev,
        emergencyContact: newContacts,
      };
    });
    // Clear error
    const errorKey = `emergencyContact.${index}.${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleBirthdayChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      birthday: value,
      birthDate: value,
    }));
    if (fieldErrors['birthday']) {
      setFieldErrors(prev => ({ ...prev, birthday: undefined }));
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'card1' | 'card2' | 'card3'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('kycAdditional.validation.imageOnly', 'Please select an image file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('kycAdditional.validation.fileTooLarge', 'File must be less than 5MB'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === 'card1') {
        setIdentityCard1Preview(preview);
        setIdentityCard1File(file);
      } else if (type === 'card2') {
        setIdentityCard2Preview(preview);
        setIdentityCard2File(file);
      } else {
        setIdentityCard3Preview(preview);
        setIdentityCard3File(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const result = kycAdditionalFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: FieldError = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      setFieldErrors(errors);
      
      // Show first error as toast
      const firstError = result.error.errors[0];
      if (firstError) {
        toast.error(t(firstError.message, firstError.message));
      }
      return false;
    }
    
    setFieldErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep('image');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error(t('common.pleaseLogin', 'Please login'));
        router.push('/auth/login');
        return;
      }

      // Step 1: Upload images first to /kyc/pictures (same as /account-setup/kyc)
      let imageUrls: { nationalIdFront?: string; nationalIdBack?: string; selfie?: string } = {};
      
      if (identityCard1File || identityCard2File || identityCard3File) {
        const imageFormData = new FormData();
        if (identityCard1File) {
          imageFormData.append('nationalIdFront', identityCard1File);
        }
        if (identityCard2File) {
          imageFormData.append('nationalIdBack', identityCard2File);
        }
        if (identityCard3File) {
          imageFormData.append('selfie', identityCard3File);
        }

        const imageResponse = await fetch(`${BASE_URL}/kyc/pictures`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        const imageResult = await imageResponse.json();
        if (imageResult.success && imageResult.data) {
          imageUrls = {
            nationalIdFront: imageResult.data.nationalIdFront,
            nationalIdBack: imageResult.data.nationalIdBack,
            selfie: imageResult.data.selfie,
          };
        } else {
          console.warn('Image upload failed:', imageResult.message);
          toast.error(t('kycAdditional.imageUploadWarning', 'Image upload failed'));
          return;
        }
      }

      // Step 2: Submit the form data with image URLs
      const submitData = {
        ...formData,
        birthDate: formData.birthday,
        // Include image URLs if uploaded
        ...(imageUrls.nationalIdFront && { identityCardUrl: imageUrls.nationalIdFront }),
        ...(imageUrls.nationalIdBack && { identityCard2Url: imageUrls.nationalIdBack }),
        ...(imageUrls.selfie && { identityCard3Url: imageUrls.selfie }),
      };

      const response = await fetch(`${BASE_URL}/kyc/additional/form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message || t('kycAdditional.submitError', 'Failed to save'));
        return;
      }

      toast.success(t('kycAdditional.submitSuccess', 'Information saved successfully'));
      router.push('/profile');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t('kycAdditional.submitError', 'Failed to save'));
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    const errorKey = fieldErrors[field];
    if (errorKey) {
      return t(errorKey, errorKey);
    }
    return undefined;
  };

  const inputClassName = (field: string) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${fieldErrors[field] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
    }
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors
    ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const selectClassName = (field: string) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${fieldErrors[field] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
    }
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors
    ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-bdsec dark:text-indigo-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => currentStep === 'image' ? setCurrentStep('text') : router.back()}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('menu.onlineClient', 'Online Client')}
          </h1>
          <div className="w-8" />
        </div>
        
        {/* Progress indicator */}
        <div className="px-4 pb-2 flex items-center gap-3">
          <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep === 'text' || currentStep === 'image' ? 'bg-bdsec dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {currentStep === 'text' ? '1/2' : '2/2'}
          </span>
          <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep === 'image' ? 'bg-bdsec dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        </div>
      </div>

      <div className="p-4">
        {currentStep === 'text' ? (
          <div className="space-y-4">
            {/* Personal Information */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('kycAdditional.section.personalInfo', 'Personal Information')}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.lastName', 'Last Name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => handleInputChange('familyName', e.target.value)}
                    className={inputClassName('familyName')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('profile.enterLastName', 'Enter last name')}
                  />
                  {getFieldError('familyName') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('familyName')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.firstName', 'First Name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={inputClassName('name')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('profile.enterFirstName', 'Enter first name')}
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.registerNumber', 'Register Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.register}
                    onChange={(e) => handleInputChange('register', e.target.value.toUpperCase())}
                    className={inputClassName('register')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.register', 'e.g. AA12345678')}
                    maxLength={10}
                  />
                  {getFieldError('register') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('register')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.birthDate', 'Birth Date')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleBirthdayChange(e.target.value)}
                    className={inputClassName('birthday')}
                    disabled={isAlreadySubmitted}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ fontSize: '16px' }}
                  />
                  {getFieldError('birthday') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('birthday')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('profile.gender', 'Gender')}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => !isAlreadySubmitted && handleInputChange('sex', 'male')}
                      disabled={isAlreadySubmitted}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                        formData.sex === 'male'
                          ? 'bg-bdsec dark:bg-indigo-500 text-white border-bdsec dark:border-indigo-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500'
                      } ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {t('profile.male', 'Male')}
                    </button>
                    <button
                      type="button"
                      onClick={() => !isAlreadySubmitted && handleInputChange('sex', 'female')}
                      disabled={isAlreadySubmitted}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                        formData.sex === 'female'
                          ? 'bg-bdsec dark:bg-indigo-500 text-white border-bdsec dark:border-indigo-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500'
                      } ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {t('profile.female', 'Female')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.phoneNumber', 'Phone Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    className={inputClassName('phone')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.phone', 'e.g. 99112233')}
                    maxLength={12}
                  />
                  {getFieldError('phone') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('phone')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.email', 'Email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={inputClassName('email')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.email', 'e.g. example@email.com')}
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.education', 'Education')}
                  </label>
                  <select
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className={selectClassName('education')}
                    disabled={isAlreadySubmitted}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    {EDUCATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Income Information */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('kycAdditional.section.incomeInfo', 'Income Information')}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.monthlyIncome', 'Monthly Income')}
                  </label>
                  <select
                    value={formData.monthly_income}
                    onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                    className={selectClassName('monthly_income')}
                    disabled={isAlreadySubmitted}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    {MONTHLY_INCOME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.incomeSource', 'Income Source')}
                  </label>
                  <select
                    value={formData.income_source}
                    onChange={(e) => handleInputChange('income_source', e.target.value)}
                    className={selectClassName('income_source')}
                    disabled={isAlreadySubmitted}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    {INCOME_SOURCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.businessSector', 'Business Sector')}
                  </label>
                  <input
                    type="text"
                    value={formData.business_sector}
                    onChange={(e) => handleInputChange('business_sector', e.target.value)}
                    className={inputClassName('business_sector')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.businessSector', 'Enter business sector')}
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('kycAdditional.section.employmentInfo', 'Employment Information')}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.employmentStatus', 'Employment Status')}
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className={selectClassName('employmentStatus')}
                    disabled={isAlreadySubmitted}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    {EMPLOYMENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.occupation', 'Occupation')}
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className={inputClassName('occupation')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('profile.enterOccupation', 'Enter occupation')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.jobTitle', 'Job Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    className={inputClassName('jobTitle')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.jobTitle', 'Enter job title')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.workPlaceName', 'Workplace Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.workPlaceName}
                    onChange={(e) => handleInputChange('workPlaceName', e.target.value)}
                    className={inputClassName('workPlaceName')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.workPlaceName', 'Enter workplace name')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.workPhone', 'Work Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.workPhone}
                    onChange={(e) => handleInputChange('workPhone', e.target.value.replace(/\D/g, ''))}
                    className={inputClassName('workPhone')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.workPhone', 'Enter work phone')}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('kycAdditional.section.emergencyContact', 'Emergency Contact')}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('kycAdditional.field.relationship', 'Relationship')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.emergencyContact[0]?.who || ''}
                    onChange={(e) => handleEmergencyContactChange(0, 'who', e.target.value)}
                    className={selectClassName('emergencyContact.0.who')}
                    disabled={isAlreadySubmitted}
                  >
                    <option value="">{t('common.select', 'Select')}</option>
                    {EMERGENCY_CONTACT_WHO_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
                    ))}
                  </select>
                  {getFieldError('emergencyContact.0.who') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('emergencyContact.0.who')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.lastName', 'Last Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact[0]?.lastName || ''}
                      onChange={(e) => handleEmergencyContactChange(0, 'lastName', e.target.value)}
                      className={inputClassName('emergencyContact.0.lastName')}
                    disabled={isAlreadySubmitted}
                      placeholder={t('profile.lastName', 'Last Name')}
                    />
                    {getFieldError('emergencyContact.0.lastName') && (
                      <p className="mt-1 text-sm text-red-500">{getFieldError('emergencyContact.0.lastName')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.firstName', 'First Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact[0]?.firstName || ''}
                      onChange={(e) => handleEmergencyContactChange(0, 'firstName', e.target.value)}
                      className={inputClassName('emergencyContact.0.firstName')}
                    disabled={isAlreadySubmitted}
                      placeholder={t('profile.firstName', 'First Name')}
                    />
                    {getFieldError('emergencyContact.0.firstName') && (
                      <p className="mt-1 text-sm text-red-500">{getFieldError('emergencyContact.0.firstName')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.phoneNumber', 'Phone Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact[0]?.phone || ''}
                    onChange={(e) => handleEmergencyContactChange(0, 'phone', e.target.value.replace(/\D/g, ''))}
                    className={inputClassName('emergencyContact.0.phone')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.phone', 'e.g. 99112233')}
                  />
                  {getFieldError('emergencyContact.0.phone') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('emergencyContact.0.phone')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.registerNumber', 'Register Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact[0]?.registerCode || ''}
                    onChange={(e) => handleEmergencyContactChange(0, 'registerCode', e.target.value.toUpperCase())}
                    className={inputClassName('emergencyContact.0.registerCode')}
                    disabled={isAlreadySubmitted}
                    placeholder={t('kycAdditional.placeholder.register', 'e.g. AA12345678')}
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.homeAddress', 'Address')}
                  </label>
                  <textarea
                    value={formData.emergencyContact[0]?.address || ''}
                    onChange={(e) => handleEmergencyContactChange(0, 'address', e.target.value)}
                    rows={2}
                    disabled={isAlreadySubmitted}
                    className={`${inputClassName('emergencyContact.0.address')} resize-none`}
                    placeholder={t('profile.enterHomeAddress', 'Enter address')}
                  />
                </div>
              </div>
            </div>

            {/* Political Exposure */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('kycAdditional.field.isPEP', 'Are you a Politically Exposed Person?')}
              </h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAlreadySubmitted) {
                      handleInputChange('isHavePolitically', false);
                      handleInputChange('is_politically', false);
                    }
                  }}
                  disabled={isAlreadySubmitted}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                    !formData.isHavePolitically
                      ? 'bg-bdsec dark:bg-indigo-500 text-white border-bdsec dark:border-indigo-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500'
                  } ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {t('common.no', 'No')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAlreadySubmitted) {
                      handleInputChange('isHavePolitically', true);
                      handleInputChange('is_politically', true);
                    }
                  }}
                  disabled={isAlreadySubmitted}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                    formData.isHavePolitically
                      ? 'bg-bdsec dark:bg-indigo-500 text-white border-bdsec dark:border-indigo-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500'
                  } ${isAlreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {t('common.yes', 'Yes')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Form Step */
          <div className="space-y-3">
            {/* Identity Card 1 - Front */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('kycAdditional.imageUpload.idFront', 'National ID - Front')}
                </h3>
                {identityCard1Preview && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <label className={`block ${isAlreadySubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'card1')}
                  className="hidden"
                  disabled={isAlreadySubmitted}
                />
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                  identityCard1Preview 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50'
                } ${isAlreadySubmitted ? 'opacity-60' : ''}`}>
                  {identityCard1Preview ? (
                    <img 
                      src={identityCard1Preview} 
                      alt="ID Front" 
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      <div className="text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('kycAdditional.imageUpload.clickToUpload', 'Click to upload')}
                        </p>
                        <p className="text-xs text-gray-500">{t('kycAdditional.imageUpload.fileFormat', 'PNG, JPG (max 5MB)')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Identity Card 2 - Back */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('kycAdditional.imageUpload.idBack', 'National ID - Back')}
                </h3>
                {identityCard2Preview && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <label className={`block ${isAlreadySubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'card2')}
                  className="hidden"
                  disabled={isAlreadySubmitted}
                />
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                  identityCard2Preview 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50'
                } ${isAlreadySubmitted ? 'opacity-60' : ''}`}>
                  {identityCard2Preview ? (
                    <img 
                      src={identityCard2Preview} 
                      alt="ID Back" 
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      <div className="text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('kycAdditional.imageUpload.clickToUpload', 'Click to upload')}
                        </p>
                        <p className="text-xs text-gray-500">{t('kycAdditional.imageUpload.fileFormat', 'PNG, JPG (max 5MB)')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Selfie */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('kycAdditional.imageUpload.selfie', 'Selfie Photo')}
                </h3>
                {identityCard3Preview && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <label className={`block ${isAlreadySubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'card3')}
                  className="hidden"
                  disabled={isAlreadySubmitted}
                />
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                  identityCard3Preview 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-bdsec dark:hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50'
                } ${isAlreadySubmitted ? 'opacity-60' : ''}`}>
                  {identityCard3Preview ? (
                    <img 
                      src={identityCard3Preview} 
                      alt="Selfie" 
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      <div className="text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('kycAdditional.imageUpload.clickToUpload', 'Click to upload')}
                        </p>
                        <p className="text-xs text-gray-500">{t('kycAdditional.imageUpload.fileFormat', 'PNG, JPG (max 5MB)')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Success message when already submitted */}
        {isAlreadySubmitted && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  {t('kycAdditional.alreadySubmitted', 'Information Submitted')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {t('kycAdditional.alreadySubmittedDescription', 'Your additional KYC information has been submitted successfully.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Button at end of content */}
        <div className="mt-6 mb-24">
          {currentStep === 'text' ? (
            <button
              onClick={handleNextStep}
              className="w-full py-3 bg-bdsec dark:bg-indigo-500 text-white font-medium rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              {t('next', 'Дараах')}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || isAlreadySubmitted}
              className={`w-full py-3 bg-bdsec dark:bg-indigo-500 text-white font-medium rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('profile.submitting', 'Submitting...')}
                </>
              ) : isAlreadySubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t('kycAdditional.informationSubmitted', 'Information Submitted')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t('profile.submit', 'Submit')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
