'use server';
import { signIn, signOut } from '@/auth';
import { InvalidLoginError } from '@/auth.errors';
import { AuthError } from 'next-auth';
import * as z from 'zod';
export const signOutAction = async () => {
  try {
    await signOut({ redirectTo: '/' });
  } catch (error) {
    throw error;
  }
};
