'use server';
import { signIn } from '@/auth';
import { InvalidLoginError } from '@/auth.errors';
import { AuthError } from 'next-auth';
import * as z from 'zod';
import { UserFormValue } from '../_components/register-form-schema';
import { getLocale } from 'next-intl/server';
export const register = async (values: UserFormValue) => {
  const { email, password, firstName, lastName, phone } = values;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const locale = await getLocale();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      }
    );
    if (response.ok) {
      return { success: true };
    } else {
      // console.log('Response status:', response.status);
      // console.log('Response headers:', response.headers);
      const data = await response.json(); // Log the raw response
      // console.log('Response text:', text);

      console.log(data);
      return { error: data.message || 'Ямар нэгэн зүйл буруудлаа!' };
    }
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
