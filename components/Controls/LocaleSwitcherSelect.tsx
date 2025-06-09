'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ReactNode, useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/lib/locale';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};
const locales = ['en', 'mn'];
export default function LocaleSwitcherSelect({ defaultValue, label }: Props) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: string) {
    const locale = nextLocale as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={onSelectChange}>
      <SelectTrigger
        className={clsx(
          ' h-7 w-[40px] border-none bg-transparent text-xs text-foreground  focus:ring-0  focus:ring-offset-0 md:h-8 md:w-[60px] md:text-sm',
          isPending && 'pointer-events-none opacity-60'
        )}
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
