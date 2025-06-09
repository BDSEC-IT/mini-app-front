import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { Montserrat } from 'next/font/google'; // Import Montserrat font
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getUserLocale } from '@/lib/locale';
import { title } from 'process';

type Props = {
  children: ReactNode;
};
export async function generateMetadata({}: Omit<Props, 'children'>) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      default: t('HomePage'),
      template: `%s - ${t('HomePage')}`
    },
    description: t('HomePageDescription'),
    twitter: {
      card: 'summary_large_image'
    }
  };
}

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Adjust weights as needed
  display: 'swap'
});

export default async function RootLayout({ children }: Props) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${montserrat.className}`} // Use Montserrat font
      suppressHydrationWarning={true}
    >
      <body className={''}>
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader showSpinner={false} />
          <SessionProvider>
            <Providers>
              <Toaster />
              {children}
            </Providers>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
