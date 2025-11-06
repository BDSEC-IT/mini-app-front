"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Plus, X, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWithdrawalData } from '@/hooks/useWithdrawalData';
import { formatCurrency } from '@/utils/balanceUtils';
import { MONGOLIAN_BANKS, type WithdrawalType } from '@/lib/api';
import toast from 'react-hot-toast';

export default function BalanceWithdrawal() {
  const { t } = useTranslation();
  // Get type from URL query parameter
  const [selectedType, setSelectedType] = useState<WithdrawalType>('NOMINAL');
  const [currentView, setCurrentView] = useState<'main' | 'create' | 'addBank' | 'createAgreement'>('main');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [agreementBank, setAgreementBank] = useState<string>(''); // Bank for CSD agreement
  const [amount, setAmount] = useState<string>('');
  const [displayAmount, setDisplayAmount] = useState<string>(''); // Formatted display value
  const [description, setDescription] = useState<string>('');
  const [selectedAssetCode, setSelectedAssetCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showBalance, setShowBalance] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // New bank account form
  const [newBankData, setNewBankData] = useState({
    accNumber: '',
    accName: '',
    bankCode: '',
    currency: 'MNT'
  });

  const {
    withdrawals,
    banks,
    nominalBalance,
    csdBalance,
    csdAgreement,
    loading,
    loadingCreate,
    loadingCancel,
    loadingAddBank,
    loadingAgreementAction,
    createWithdrawal,
    cancelWithdrawal,
    addBank,
    handleCreateCSDAgreement,
    handleUpdateCSDAgreement,
    hasActiveWithdrawalForType,
    getAvailableBalance,
    getCSDAvailableBalance,
    getWithdrawalsByType
  } = useWithdrawalData();

  // Initialize type from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'CSD' || typeParam === 'NOMINAL') {
      setSelectedType(typeParam);
    }
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Reset pagination when type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters except decimal point
    let cleanValue = input.replace(/[^\d.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Store the raw value (without commas) for calculations
    setAmount(cleanValue);
    
    // Format for display with commas
    if (cleanValue) {
      const [integerPart, decimalPart] = cleanValue.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const formatted = decimalPart !== undefined 
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
      setDisplayAmount(formatted);
    } else {
      setDisplayAmount('');
    }
  };

  // Handle withdrawal creation
  const handleCreateWithdrawal = async () => {
    if (!selectedBank || !amount || !description) {
      toast.error(t('withdrawal.fillAllFields', 'Бүх талбарыг бөглөнө үү'));
      return;
    }

    if (selectedType === 'CSD' && !selectedAssetCode) {
      toast.error('CSD-ийн хувьд asset code сонгоно уу');
      return;
    }

    const amountNum = parseFloat(amount);
    const availableBalance = selectedType === 'NOMINAL' 
      ? getAvailableBalance() 
      : getCSDAvailableBalance();

    if (amountNum <= 0) {
      toast.error('Дүн 0-ээс их байх ёстой');
      return;
    }

    if (amountNum > availableBalance) {
      toast.error(`Нийт үлдэгдэл: ${formatCurrency(availableBalance)} ₮`);
      return;
    }

    const result = await createWithdrawal(selectedType, {
      accountNumber: selectedBank,
      amount: amountNum,
      description,
      assetCode: selectedType === 'CSD' ? selectedAssetCode : undefined,
      channel: 'WEB'
    });

    if (result.success) {
      toast.success(t('withdrawal.requestSentSuccess', 'Мөнгө хүсэх хүсэлт амжилттай илгээгдлээ'));
      setCurrentView('main');
      setAmount('');
      setDisplayAmount('');
      setDescription('');
      setSelectedBank('');
      setSelectedAssetCode('');
    } else {
      toast.error(result.message || t('common.error', 'Алдаа гарлаа'));
    }
  };

  // Handle withdrawal cancellation
  const handleCancelWithdrawal = async (withdrawalId: number) => {
    const result = await cancelWithdrawal(withdrawalId);
    if (result.success) {
      toast.success(t('withdrawal.requestCancelled', 'Хүсэлт цуцлагдлаа'));
    } else {
      toast.error(result.message || t('withdrawal.cancelError', 'Цуцлах үед алдаа гарлаа'));
    }
  };

  // Handle adding new bank account
  const handleAddBank = async () => {
    if (!newBankData.accNumber || !newBankData.accName || !newBankData.bankCode) {
      toast.error(t('withdrawal.fillAllFields', 'Бүх талбарыг бөглөнө үү'));
      return;
    }

    const result = await addBank(newBankData);
    if (result.success) {
      toast.success(t('withdrawal.bankAddedSuccess', 'Банкны данс амжилттай нэмэгдлээ'));
      setCurrentView('main');
      setNewBankData({ accNumber: '', accName: '', bankCode: '', currency: 'MNT' });
    } else {
      toast.error(result.message || t('withdrawal.bankAddError', 'Банкны данс нэмэхэд алдаа гарлаа'));
    }
  };

  // Get withdrawal status info
  const getWithdrawalStatusInfo = (state: string) => {
    switch (state) {
      case 'new':
        return { 
          icon: <Clock className="w-4 h-4 text-yellow-500" />, 
          text: t('withdrawal.statusNew', 'Шинэ'), 
          color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' 
        };
      case 'accepted':
        return { 
          icon: <CheckCircle className="w-4 h-4 text-green-500" />, 
          text: t('withdrawal.statusApproved', 'Зөвшөөрөгдсөн'), 
          color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' 
        };
      case 'cancelled':
        return { 
          icon: <XCircle className="w-4 h-4 text-red-500" />, 
          text: t('withdrawal.statusCancelled', 'Цуцлагдсан'), 
          color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400' 
        };
      case 'completed':
        return { 
          icon: <CheckCircle className="w-4 h-4 text-blue-500" />, 
          text: t('withdrawal.statusCompleted', 'Дууссан'), 
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' 
        };
      default:
        return { 
          icon: <Clock className="w-4 h-4 text-gray-500" />, 
          text: t('withdrawal.statusUnknown', 'Тодорхойгүй'), 
          color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400' 
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Main loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec dark:border-indigo-500"></div>
      </div>
    );
  }

  // CSD Agreement Alert (only for CSD) - TEMPORARILY DISABLED FOR TESTING
  const renderCSDAlert = () => {
    // Temporarily disabled for testing
    // return null;
    
    if (selectedType !== 'CSD' || !csdAgreement || csdAgreement.hasContract) return null;

    return (
      <div className="mx-4 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Гурвалсан гэрээ шаардлагатай
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              ҮЦТХТ-ээс мөнгө хүсэхийн тулд танд идэвхитэй гурвалсан гэрээ байгуулна уу
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Balance Info Card
  const renderBalanceCard = () => {
    if (selectedType === 'NOMINAL') {
      const availableBalance = getAvailableBalance();
      return (
        <div className="mx-4 mb-4">
          <div className="relative w-full p-4 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
            {/* SVG Illumination Effect */}
            <svg
              className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
              width="200%"
              height="200%"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                transform="translate(100 100)"
              />
            </svg>
            
            <div className="flex items-center justify-between mb-6 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">₮</span>
                </div>
                <div className="z-10">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Номинал боломжит үлдэгдэл</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Бэлэн мөнгө</p>
                </div>
              </div>
              <div className="text-right z-10">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {showBalance ? `${formatCurrency(availableBalance)} ₮` : '***,*** ₮'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // CSD - Show both 9992 and 9998 balances
      const balance9992 = csdBalance.find(item => item.code === '9992');
      const balance9998 = csdBalance.find(item => item.code === '9998');
      
      return (
        <div className="mx-4 mb-4 space-y-3">
          {/* 9992 Balance */}
          <div className="relative w-full p-4 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
            {/* SVG Illumination Effect */}
            <svg
              className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
              width="200%"
              height="200%"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                transform="translate(100 100)"
              />
            </svg>
            
            <div className="flex items-center justify-between mb-6 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">₮</span>
                </div>
                <div className="z-10">
                  <h3 className="font-semibold text-gray-900 dark:text-white">9992</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ногдол ашиг/хувийн мөнгө</p>
                </div>
              </div>
              <div className="text-right z-10">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {showBalance ? `${formatCurrency(balance9992?.amount || 0)} ₮` : '***,*** ₮'}
                </p>
              </div>
            </div>
          </div>

          {/* 9998 Balance */}
          <div className="relative w-full p-4 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
            {/* SVG Illumination Effect */}
            <svg
              className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
              width="200%"
              height="200%"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                transform="translate(100 100)"
              />
            </svg>
            
            <div className="flex items-center justify-between mb-6 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">₮</span>
                </div>
                <div className="z-10">
                  <h3 className="font-semibold text-gray-900 dark:text-white">9998</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Бэлэн мөнгө</p>
                </div>
              </div>
              <div className="text-right z-10">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {showBalance ? `${formatCurrency(balance9998?.amount || 0)} ₮` : '***,*** ₮'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Active Withdrawal Alert
  const renderActiveWithdrawalAlert = () => {
    if (!hasActiveWithdrawalForType(selectedType)) return null;

    const activeWithdrawals = getWithdrawalsByType(selectedType).filter(w => w.state === 'new');
    if (activeWithdrawals.length === 0) return null;

    const activeWithdrawal = activeWithdrawals[0];

    return (
      <div className="mx-4 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Идэвхитэй хүсэлт байна
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Таны {formatCurrency(activeWithdrawal.amount)} ₮ хүсэлт боловсруулагдаж байна.
            </p>
            <button
              onClick={() => handleCancelWithdrawal(activeWithdrawal.withdrawalid)}
              className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
            >
              Хүсэлт цуцлах
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create Withdrawal Form
  const renderCreateForm = () => (
    <div className="p-4">
      <div className="space-y-4">
        {/* Bank Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Банкны данс
            </label>
            <button
              onClick={() => setCurrentView('addBank')}
              className="flex items-center space-x-1 text-sm text-muted-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>Шинэ данс нэмэх</span>
            </button>
          </div>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec focus:border-transparent"
          >
            <option value="">Банкны данс сонгох</option>
            {banks.filter(bank => bank.active).map((bank) => (
              <option key={bank.resPartnerBankId} value={bank.accNumber}>
                {bank.bankName} - {bank.accNumber} ({bank.accHolderName})
              </option>
            ))}
          </select>
        </div>

        {/* CSD Asset Code Selection */}
        {selectedType === 'CSD' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asset Code
            </label>
            <select
              value={selectedAssetCode}
              onChange={(e) => setSelectedAssetCode(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec focus:border-transparent"
            >
              <option value="">Asset Code сонгох</option>
              <option value="9992">9992</option>
              <option value="9998">9998</option>
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Мөнгөн дүн (₮)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder={t('withdrawal.enterAmount', 'Дүн оруулах')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-bdsec focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Нийт: {formatCurrency(selectedType === 'NOMINAL' ? getAvailableBalance() : getCSDAvailableBalance())} ₮
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Гүйлгээний утга
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('withdrawal.descriptionPlaceholder', 'Гүйлгээний утга оруулна уу')}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-bdsec focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreateWithdrawal}
          disabled={loadingCreate || !selectedBank || !amount || !description || (selectedType === 'CSD' && !selectedAssetCode)}
          className="w-full bg-bdsec dark:bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-bdsec/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loadingCreate ? t('withdrawal.sending', 'Илгээж байна...') : t('withdrawal.sendRequest', 'Хүсэлт илгээх')}
        </button>
      </div>
    </div>
  );

  // Handle CSD Agreement
  const handleCSDAgreement = async () => {
    if (!agreementBank) {
      toast.error(t('withdrawal.selectBank', 'Банкны данс сонгоно уу'));
      return;
    }
    const result = await handleCreateCSDAgreement(agreementBank);
    if (result.success) {
      toast.success(t('withdrawal.agreementCreatedSuccess', 'Гурвалсан гэрээ амжилттай байгууллаа'));
      setCurrentView('main');
      setAgreementBank('');
    } else {
      toast.error(result.message || t('withdrawal.agreementCreateError', 'Гэрээ байгуулахад алдаа гарлаа'));
    }
  };

  // CSD Agreement Form
  const renderCSDAgreementForm = () => (
    <div className="p-4">
      <div className="space-y-4">
        {/* Bank Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Банкны данс
            </label>
            <button
              onClick={() => setCurrentView('addBank')}
              className="flex items-center space-x-1 text-sm text-muted-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>Шинэ данс нэмэх</span>
            </button>
          </div>
          <select
            value={agreementBank}
            onChange={(e) => setAgreementBank(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec focus:border-transparent"
          >
            <option value="">Банкны данс сонгох</option>
            {banks.filter(bank => bank.active).map((bank) => (
              <option key={bank.resPartnerBankId} value={bank.accNumber}>
                {bank.bankName} - {bank.accNumber} ({bank.accHolderName})
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCSDAgreement}
          disabled={loadingAgreementAction || !agreementBank}
          className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loadingAgreementAction ? t('withdrawal.creating', 'Байгуулж байна...') : t('withdrawal.createAgreement', 'Гурвалсан гэрээ байгуулах')}
        </button>
      </div>
    </div>
  );

  // Add Bank Form
  const renderAddBankForm = () => (
    <div className="p-4">
      <div className="space-y-4">
        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Дансны дугаар
          </label>
          <input
            type="text"
            value={newBankData.accNumber}
            onChange={(e) => setNewBankData({ ...newBankData, accNumber: e.target.value })}
            placeholder={t('withdrawal.enterAccountNumber', 'Дансны дугаар оруулах')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-bdsec focus:border-transparent"
          />
        </div>

        {/* Account Holder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Дансан дээрх нэр
          </label>
          <input
            type="text"
            value={newBankData.accName}
            onChange={(e) => setNewBankData({ ...newBankData, accName: e.target.value })}
            placeholder={t('withdrawal.enterAccountName', 'Дансан дахь овог нэрээ оруулна уу')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-bdsec focus:border-transparent"
          />
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Банк
          </label>
          <select
            value={newBankData.bankCode}
            onChange={(e) => setNewBankData({ ...newBankData, bankCode: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec focus:border-transparent"
          >
            <option value="">Банк сонгох</option>
            {MONGOLIAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Валют
          </label>
          <select
            value={newBankData.currency}
            onChange={(e) => setNewBankData({ ...newBankData, currency: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec focus:border-transparent"
          >
            <option value="MNT">MNT</option>
            <option value="USD">USD</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAddBank}
          disabled={loadingAddBank || !newBankData.accNumber || !newBankData.accName || !newBankData.bankCode}
          className="w-full bg-bdsec dark:bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-bdsec/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loadingAddBank ? t('withdrawal.adding', 'Нэмж байна...') : t('withdrawal.addBankAccount', 'Банкны данс нэмэх')}
        </button>
      </div>
    </div>
  );

  // Withdrawal History
  const renderWithdrawalHistory = () => {
    const typeWithdrawals = getWithdrawalsByType(selectedType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const totalPages = Math.ceil(typeWithdrawals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedWithdrawals = typeWithdrawals.slice(startIndex, endIndex);

    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedType === 'NOMINAL' ? t('withdrawal.nominalRequestHistory', 'Номинал хүсэлтийн түүх') : t('withdrawal.csdRequestHistory', 'ҮЦТХТ хүсэлтийн түүх')}
        </h3>
        
        {typeWithdrawals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Хүсэлт байхгүй</p>
          </div>
        ) : (
          <>
          <div className="space-y-3">
            {paginatedWithdrawals.map((withdrawal) => {
              const statusInfo = getWithdrawalStatusInfo(withdrawal.state);
              return (
                <div key={withdrawal.withdrawalid} className="relative w-full p-4 overflow-hidden transition-all duration-300 border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500">
                  {/* SVG Illumination Effect */}
                  <svg
                    className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
                    width="200%"
                    height="200%"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                      transform="translate(100 100)"
                    />
                  </svg>
                  
                  <div className="flex items-center justify-between mb-3 z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">₮</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(withdrawal.amount)} ₮
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {withdrawal.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.text}</span>
                      </span>
                      {withdrawal.state === 'new' && (
                        <button
                          onClick={() => handleCancelWithdrawal(withdrawal.withdrawalid)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title={t('common.cancel', 'Цуцлах')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs z-10">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Огноо:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatDate(withdrawal.date)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Тайлбар:</span>
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {withdrawal.description}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Суваг:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {withdrawal.channel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          </>
        )}
      </div>
    );
  };

  // Main View
  const renderMainView = () => (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => setCurrentView('create')}
          disabled={hasActiveWithdrawalForType(selectedType) || (selectedType === 'CSD' && !csdAgreement?.hasContract)}
          className={`w-full bg-bdsec dark:bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-bdsec/90 disabled:opacity-50 disabled:cursor-not-allowed transition ${selectedType === 'CSD' && !csdAgreement?.hasContract ? 'hidden' : ''}`}
        >
          Шинэ хүсэлт үүсгэх
        </button>
        
        {hasActiveWithdrawalForType(selectedType) && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
            Танд идэвхитэй хүсэлт байна
          </p>
        )}
        
        {/* CSD Agreement check */}
        {selectedType === 'CSD' && !csdAgreement?.hasContract && (
          <div className="space-y-2">
      
            <button
              onClick={() => setCurrentView('createAgreement')}
              className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition"
            >
              Гурвалсан гэрээ байгуулах
            </button>
          </div>
        )}
      </div>

      {renderWithdrawalHistory()}
    </div>
  );

  // Render header for all views
  const renderHeader = () => {
    const handleBackClick = () => {
      if (currentView === 'create' || currentView === 'addBank' || currentView === 'createAgreement') {
        setCurrentView('main');
      } else {
        window.history.back();
      }
    };

    const getBackText = () => {
      if (currentView === 'create' || currentView === 'addBank' || currentView === 'createAgreement') {
        return t('common.back', 'Буцах');
      }
      return t('nav.balance', 'Үлдэгдэл');
    };

    return (
      <div className="mb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{getBackText()}</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentView === 'main' ? t('withdrawal.title', 'Мөнгө хүсэх') : 
             currentView === 'create' ? t('withdrawal.newRequest', 'Шинэ хүсэлт') : 
             currentView === 'createAgreement' ? t('withdrawal.createAgreement', 'Гурвалсан гэрээ байгуулах') :
             t('withdrawal.addBankAccount', 'Банкны данс нэмэх')}
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
        
        {/* Tabs */}
        {currentView === 'main' && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedType('NOMINAL')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedType === 'NOMINAL'
                  ? 'text-bdsec border-b-2 border-bdsec dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Номинал
            </button>
            <button
              onClick={() => setSelectedType('CSD')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedType === 'CSD'
                  ? 'text-bdsec border-b-2 border-bdsec dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              ҮЦТХТ
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className=" pb-20 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      {renderHeader()}

      {/* Balance Card */}
      {renderBalanceCard()}
      
      {/* CSD Agreement Alert */}
      {renderCSDAlert()}

      {/* Active Withdrawal Alert */}
      {renderActiveWithdrawalAlert()}

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mx-4 mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}
    
      {/* Content based on current view */}
      {currentView === 'main' && renderMainView()}
      {currentView === 'create' && renderCreateForm()}
      {currentView === 'createAgreement' && renderCSDAgreementForm()}
      {currentView === 'addBank' && renderAddBankForm()}
    </div>
  );
}