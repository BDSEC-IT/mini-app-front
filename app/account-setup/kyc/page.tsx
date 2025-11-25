'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';

interface KycData {
  id: number;
  userId: number;
  nationalIdFront: string | null;
  nationalIdBack: string | null;
  selfie: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function KycPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycData, setKycData] = useState<KycData | null>(null);
  
  // Image previews
  const [nationalIdFrontPreview, setNationalIdFrontPreview] = useState<string | null>(null);
  const [nationalIdBackPreview, setNationalIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  // Image files
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null);
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error(t('common.pleaseLogin', 'Please login'));
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/kyc/pictures`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setKycData(result.data);
        
        // Set existing image previews using the proxy API route
        const timestamp = new Date().getTime();
        if (result.data.nationalIdFront) {
          setNationalIdFrontPreview(`/api/kyc-image?field=nationalIdFront&t=${timestamp}`);
        }
        if (result.data.nationalIdBack) {
          setNationalIdBackPreview(`/api/kyc-image?field=nationalIdBack&t=${timestamp}`);
        }
        if (result.data.selfie) {
          setSelfiePreview(`/api/kyc-image?field=selfie&t=${timestamp}`);
        }
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      toast.error(t('kyc.fetchError', 'Failed to load KYC data'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'nationalIdFront' | 'nationalIdBack' | 'selfie'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('kyc.invalidFileType', 'Please select an image file'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('kyc.fileTooLarge', 'File size must be less than 5MB'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      
      switch (type) {
        case 'nationalIdFront':
          setNationalIdFrontFile(file);
          setNationalIdFrontPreview(preview);
          break;
        case 'nationalIdBack':
          setNationalIdBackFile(file);
          setNationalIdBackPreview(preview);
          break;
        case 'selfie':
          setSelfieFile(file);
          setSelfiePreview(preview);
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Validate that all images are selected
    if (!nationalIdFrontFile && !nationalIdFrontPreview) {
      toast.error(t('kyc.nationalIdFrontRequired', 'National ID front image is required'));
      return;
    }
    if (!nationalIdBackFile && !nationalIdBackPreview) {
      toast.error(t('kyc.nationalIdBackRequired', 'National ID back image is required'));
      return;
    }
    if (!selfieFile && !selfiePreview) {
      toast.error(t('kyc.selfieRequired', 'Selfie is required'));
      return;
    }

    setUploading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error(t('common.pleaseLogin', 'Please login'));
        router.push('/auth/login');
        return;
      }

      // Create FormData
      const formData = new FormData();
      if (nationalIdFrontFile) {
        formData.append('nationalIdFront', nationalIdFrontFile);
      }
      if (nationalIdBackFile) {
        formData.append('nationalIdBack', nationalIdBackFile);
      }
      if (selfieFile) {
        formData.append('selfie', selfieFile);
      }

      const response = await fetch(`${BASE_URL}/kyc/pictures`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('kyc.uploadSuccess', 'KYC documents uploaded successfully'));
        setKycData(result.data);
        
        // Clear file states but keep previews
        setNationalIdFrontFile(null);
        setNationalIdBackFile(null);
        setSelfieFile(null);
        
        // Refresh data
        await fetchKycData();
      } else {
        toast.error(result.message || t('kyc.uploadError', 'Failed to upload documents'));
      }
    } catch (error) {
      console.error('Error uploading KYC documents:', error);
      toast.error(t('kyc.uploadError', 'Failed to upload documents'));
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('kyc.statusPending', 'Pending Review')}</span>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('kyc.statusApproved', 'Approved')}</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('kyc.statusRejected', 'Rejected')}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderUploadBox = (
    type: 'nationalIdFront' | 'nationalIdBack' | 'selfie',
    preview: string | null,
    label: string,
    description: string
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, type)}
            className="hidden"
            id={`upload-${type}`}
            disabled={uploading || loading || !!(kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie))}
          />
          
          <label
            htmlFor={`upload-${type}`}
            className={`
              block w-full aspect-[3/2] rounded-lg border-2 border-dashed 
              ${preview ? 'border-green-500 dark:border-green-600' : 'border-gray-300 dark:border-gray-600'}
              hover:border-blue-500 dark:hover:border-blue-500
              transition-colors overflow-hidden
              ${uploading || loading || (kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie)) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'}
            `}
          >
            {preview ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('kyc.clickToUpload', 'Click to upload')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG (max 5MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('kyc.title', 'KYC Verification')}
              </h1>
            </div>
            
            {kycData && getStatusBadge(kycData.status)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {kycData?.status === 'REJECTED' && kycData.statusReason && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">
                  {t('kyc.rejectionReason', 'Rejection Reason')}
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                  {kycData.statusReason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('kyc.uploadDocuments', 'Upload Identity Documents')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('kyc.uploadDescription', 'Please upload clear photos of your national ID card (both sides) and a selfie.')}
            </p>
          </div>

          <div className="space-y-6">
            {renderUploadBox(
              'nationalIdFront',
              nationalIdFrontPreview,
              t('kyc.nationalIdFront', 'National ID - Front'),
              t('kyc.nationalIdFrontDesc', 'Upload the front side of your national ID card')
            )}

            {renderUploadBox(
              'nationalIdBack',
              nationalIdBackPreview,
              t('kyc.nationalIdBack', 'National ID - Back'),
              t('kyc.nationalIdBackDesc', 'Upload the back side of your national ID card')
            )}

            {renderUploadBox(
              'selfie',
              selfiePreview,
              t('kyc.selfie', 'Selfie'),
              t('kyc.selfieDesc', 'Upload a clear selfie photo of yourself')
            )}
          </div>

          {/* Success message when documents are submitted */}
          {kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie) && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-200">
                    {t('kyc.documentsSubmitted', 'Баримт илгээгдсэн')}
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    {t('kyc.documentsSubmittedDesc', 'Таны баримт бичгүүд амжилттай илгээгдлээ. Хянагдаж байна.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={
                uploading || 
                loading || 
                kycData?.status === 'APPROVED' ||
                !!(kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie))
              }
              className={`
                flex-1 py-3 px-6 rounded-lg font-medium transition-all
                ${uploading || 
                  loading || 
                  kycData?.status === 'APPROVED' ||
                  (kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie))
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                }
              `}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('kyc.uploading', 'Uploading...')}
                </span>
              ) : kycData?.status === 'APPROVED' ? (
                t('kyc.alreadyApproved', 'Already Approved')
              ) : (kycData && (kycData.nationalIdFront || kycData.nationalIdBack || kycData.selfie)) ? (
                t('kyc.documentsSubmitted', 'Баримт илгээгдсэн')
              ) : (
                t('kyc.submit', 'Submit Documents')
              )}
            </button>
          </div>

          {kycData && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('kyc.submittedAt', 'Submitted')}:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(kycData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('kyc.lastUpdated', 'Last Updated')}:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(kycData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}