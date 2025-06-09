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
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { login } from '../actions/login';
import LoadingButton from '@/components/customui/LoadingButton';
// import { login } from '../(signin)/login/actions';
import { useTranslations } from 'next-intl';
import { UserFormValue, formSchema } from './login-form-schema';

export default function UserAuthForm() {
  const validationMessages = useTranslations('validation');

  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    email: 'demo@gmail.com'
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema(validationMessages)),
    defaultValues
  });
  const router = useRouter();
  const onSubmit = async (data: UserFormValue) => {
    setError('');
    startTransition(async () => {
      const result = await login(data);
      console.log('Result from login:', result);
      if (result && result.error) {
        setError(result!.error);
        toast.error(result!.error);
      } else {
        toast.success('Signed In Successfully!');
        window.location.reload();
      }
      // router.push('/dashboard');
    });
  };
  const t = useTranslations('Controls.AUTH');
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 "
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
              <FormItem className="space-y-1 rounded-[10px]  pt-1">
                <FormLabel className="pl-3"> {t('email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('enter_email')}
                    disabled={loading}
                    {...field}
                    className="border-none shadow-none "
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
              <FormItem className="space-y-1  rounded-[10px]  pt-1 ">
                <FormLabel className="pl-3 "> {t('password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('enter_password')}
                    disabled={loading}
                    {...field}
                    className="border-none shadow-none "
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
            {t('login')}
          </LoadingButton>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className=" px-2 text-muted-foreground">
            {t('dontHaveAccount')}
          </span>
        </div>
      </div>
      <Button
        className="h-10 rounded-[10px]  border-none bg-background hover:bg-accent"
        variant={'outline'}
        onClick={() => {
          router.push('/register');
        }}
      >
        {t('register')}
      </Button>
    </>
  );
}
