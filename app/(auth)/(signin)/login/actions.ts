'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { UserFormValue } from '../../_components/login-form-schema';
import { getLocale } from 'next-intl/server';
export async function login(
  credentials: UserFormValue
): Promise<{ error: string }> {
  try {
    const locale = await getLocale();
    const { email, password } = credentials;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        }
      }
    );
    return { error: 'asf' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: 'Something went wrong, please try again later'
    };
  }
}
