import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

interface Props {
  searchParams: { token: string; action: string; email: string };
}

const ConfirmToken = async ({
  searchParams: { action, token, email }
}: Props) => {
  const params = new URLSearchParams({
    action: action ? String(action) : '',
    token: token ? String(token) : '',
    email: email ? email : ''
  });

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL
    }/auth/confirmtoken?${params.toString()}`,
    {
      cache: 'no-store'
    }
  ).catch((err) => notFound());

  const data = await response.json();
  const t = await getTranslations('NotFoundPage');

  if (!response.ok) {
    return (
      <div className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
        <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[2rem] font-extrabold leading-none  text-transparent md:text-[4rem] lg:text-[6rem]">
          Амжилтгүй
        </span>
        <p className="mt-3">{data.message}</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Нүүр хуудас руу буцах
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md  px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-muted/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Нэвтрэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
      <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[2rem] font-extrabold leading-none  text-transparent md:text-[4rem] lg:text-[6rem]">
        Бүртгэл амжилттай баталгаажлаа
      </span>
      <p className="mt-3">Та нэвтрэх форм руу орж нэвтэрнэ үү</p>
      <div className="mt-8 flex justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Нүүр хуудас руу буцах
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md  px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-muted/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Нэвтрэх
        </Link>
      </div>
    </div>
  );
};

export default ConfirmToken;
