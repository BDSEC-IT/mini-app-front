'use client';
import Link from 'next/link';
import LocaleSwitcher from './LocaleSwitcher';
import { useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import UserButton from './UserButton';
import { GetSession } from '@/lib/GetTokenClient';
import { useSession } from 'next-auth/react';

export default function NavBar() {
  const t = useTranslations('Navbar');
  // const SESSION = GetSession();
  const { data: session, status } = useSession();
  return (
    <div className="mx-[20px] flex items-center justify-between rounded-[20px] bg-primary px-10  py-1 md:mx-[100px] xl:mx-[10%] 2xl:mx-[20%] ">
      <div className="flex items-center gap-x-6">
        <Link href="/" className="text-white">
          {t('home')}{' '}
        </Link>

        <LocaleSwitcher />
      </div>

      <div className="flex items-center  gap-x-6">
        <Link href="/MSE/bonds" className="text-white">
          MSE
        </Link>
        <Link href="/MSE" className="text-white">
          OTC
        </Link>
        <Link href="/MSE" className="text-white">
          CHEX
        </Link>
        <Link href="/MSE" className="text-white">
          UBX{' '}
        </Link>

        {/* {session ? (
          session.user ? (
            <UserButton />
          ) : (
            <Link href="/login">Login</Link>
          )
        ) : (
          <div>loading</div>
        )} */}
        {status === 'loading' && <div>Loading...</div>}
        {status === 'authenticated' && (
          <UserButton className="size-2" email={session!.user!.email} />
        )}
        {status === 'unauthenticated' && (
          <a className="text-orange-500" href="/login">
            login
          </a>
        )}
      </div>
    </div>
  );
}
//href="/api/auth/signin"
