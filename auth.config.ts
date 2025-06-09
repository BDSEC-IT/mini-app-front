import Credentials from 'next-auth/providers/credentials';

import type { NextAuthConfig } from 'next-auth';
import { InvalidLoginError } from '@/auth.errors';
export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          }
        );
        const responseData = await res.json();

        console.log('Response Data', responseData);

        if (!res.ok) {
          console.log('Response ERR', responseData.message);

          throw new InvalidLoginError(responseData.message);
        }
        if (responseData.data) {
          return responseData.data;
        } else {
          return null;
        }
      }
    })
  ]
} satisfies NextAuthConfig;
