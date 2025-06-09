'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations('NotFoundPage');

  return (
    <div className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
      <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
        404
      </span>
      <h2 className="font-heading my-2 text-2xl font-bold">{t('title')}</h2>
      <p>{t('description')}</p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()} variant="default" size="lg">
          {t('goback')}
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="lg"
        >
          {t('gotohome')}
        </Button>
      </div>
    </div>
  );
}
