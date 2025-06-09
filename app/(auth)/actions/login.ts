'use server';
import { signIn } from '@/auth';
import { InvalidLoginError } from '@/auth.errors';
import { AuthError } from 'next-auth';
import * as z from 'zod';
import { UserFormValue } from '../_components/login-form-schema';
import { getLocale } from 'next-intl/server';

export const login = async (values: UserFormValue) => {
  const { email, password } = values;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const locale = await getLocale();
    await signIn('credentials', {
      email: values.email,
      password: values.password
      // redirect: true,
      // redirectTo: '/dashboard/overview'
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('ERRORTYPE', error.type);
      switch (error.type) {
        case 'CredentialsSignin':
          console.log('typere', (error as any)?.code);
          if ((error as any)?.code === 'credentials')
            return { error: 'Ямар нэгэн алдаа гарлаа' };
          return { error: (error as any)?.code || 'Нэвтрэх алдаа' };
        default:
          return { error: 'Ямар нэгэн зүйл буруудлаа!' };
      }
    }
    throw error;
  }
};
