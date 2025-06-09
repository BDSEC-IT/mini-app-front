'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Mails } from 'lucide-react';
import LoadingButton from '@/components/customui/LoadingButton';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
export default function SendEmailConfirmation(Prop: {
  email: string;
  action: string;
  method: string;
  disabled: boolean;
  sendDataToParent: (data: boolean) => void;
  closeModal: () => void;
}) {
  const [loading, startTransition] = useTransition();

  const handleConfirmation = async (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      Prop.sendDataToParent && Prop.sendDataToParent(true);
      try {
        const body = {
          email: Prop.email,
          method: Prop.method,
          action: Prop.action
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sendconfirmation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        );
        // console.log(response);

        if (response.ok) {
          // console.log(response);
          const data = await response.json();
          toast.success(data.message || 'EMAIL SENT');
          Prop.sendDataToParent(false);
        } else {
          if (response.status === 410) {
            toast.info('SendConfirmationEmail_Verified');
            Prop.sendDataToParent(false);
            Prop.closeModal!();
          } else {
            Prop.sendDataToParent(false);
            throw new Error('createBuyerForm_success_failedsubform');
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Message_NSuccess');
        console.log(error);
        Prop.sendDataToParent(false);
      }
    });
  };
  const t = useTranslations('Controls');
  return (
    <LoadingButton
      loading={loading}
      disabled={Prop.disabled}
      className="w-full"
      variant="outline"
      type="button"
      onClick={handleConfirmation}
    >
      <Mails className="mr-2 h-4 w-4" />
      {t('sendemaillink')}
    </LoadingButton>
  );
}
