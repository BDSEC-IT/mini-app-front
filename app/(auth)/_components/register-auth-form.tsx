'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { login } from '../actions/login';
import LoadingButton from '@/components/customui/LoadingButton';
// import { login } from '../(signin)/login/actions';
import { useTranslations } from 'next-intl';
import { UserFormValue, formSchema } from './register-form-schema';
import { PasswordInput } from '@/components/customui/PasswordInput';
import { register } from '../actions/register';
import { Copy } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import SendEmailConfirmation from './send-email-confirmation';
export default function RegisterForm() {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const validationMessages = useTranslations('validation');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const [emailData, setEmailData] = useState('');
  const defaultValues = {};
  // const defaultValues = {
  //   email: 'radnaa2003@yahoo.com',
  //   phone: '125125315',
  //   password: 'User303###',
  //   confirmPassword: 'User303###',
  //   firstName: 'John',
  //   lastName: 'Doe'
  // };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema(validationMessages)),
    defaultValues
  });
  const router = useRouter();
  const onSubmit = async (data: UserFormValue) => {
    setEmailData('');
    setError('');
    startTransition(async () => {
      const result = await register(data);
      console.log('Result from login:', result);
      if (result && result.error) {
        setError(result!.error);
        toast.error(result!.error);
      } else {
        setEmailData(data.email);
        openDialog();
        toast.success(t('signed_up_success'));
        // window.location.reload();
      }
    });
  };
  // Wait send logic

  const [duration, setDuration] = useState(0);
  const [parentData, setParentData] = useState(true);
  const [getMessage, setGetMessage] = useState(true);
  const [firstTime, setFirstTime] = useState(false);
  const t = useTranslations('Controls');
  useEffect(() => {
    console.log('FALESED');
    if (!parentData) {
      setGetMessage((i) => (i = true));
      setDuration((i) => (i = 60));
      setFirstTime((i) => (i = true));
    }
  }, [parentData]);
  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => setDuration((prev) => prev - 1), 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setParentData(true);
      setGetMessage(false);
    }
  }, [duration]);
  const handleChildData = (data: boolean) => {
    setParentData(data);
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-5"
        >
          {error && (
            <div className="rounded-sm  bg-destructive p-2 text-center text-destructive-foreground ">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1 rounded-[10px]   pt-2">
                <FormLabel className="pb-0 pl-3 ">{t('AUTH.email')}</FormLabel>
                <FormControl>
                  <Input
                    className="border-none pt-0 shadow-none "
                    type="email"
                    placeholder={t('AUTH.enter_email')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1 rounded-[10px]   pt-2">
                <FormLabel className="pb-0 pl-3 ">
                  {t('AUTH.password')}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className="border-none pt-0 shadow-none "
                    type="password"
                    placeholder={t('AUTH.enter_password')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1 rounded-[10px]   pt-2">
                <FormLabel className="pb-0 pl-3 ">
                  {t('AUTH.password_confirmation')}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className="border-none pt-0 shadow-none "
                    type="password"
                    placeholder={t('AUTH.confirm_password')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            loading={loading}
            className="ml-auto h-10 w-full rounded-[10px]"
            type="submit"
          >
            {t('AUTH.continue')}
          </LoadingButton>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-accent px-2 text-muted-foreground">
            {t('AUTH.already_registered')}
          </span>
        </div>
      </div>
      <Button
        variant={'outline'}
        onClick={() => {
          router.push('/login');
        }}
        className="rounded-[10px] border-none  "
      >
        {t('AUTH.login')}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('AUTH.verify_email')}</DialogTitle>
            <DialogDescription>{emailData}</DialogDescription>
          </DialogHeader>
          <div className="my-3 flex items-center space-x-2">
            <SendEmailConfirmation
              action="newUser"
              email={emailData}
              method="email"
              disabled={getMessage}
              sendDataToParent={handleChildData}
              closeModal={closeDialog}
            ></SendEmailConfirmation>
          </div>
          {firstTime && (
            <p className="">
              {duration} {t('AUTH.resend_in')}
            </p>
          )}
          {firstTime && (
            <p className="text-sm text-muted-foreground">
              {t('AUTH.check_spam')}
            </p>
          )}
          <DialogFooter className="">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {t('AUTH.close')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
