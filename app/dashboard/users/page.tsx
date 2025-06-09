import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import React from 'react';
import EmployeeListingPage from './_components/employee-listing-page';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';

type pageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('UsersPage'),
    description: t('UsersPageDescription')
  };
}
export default async function Page({ searchParams }: pageProps) {
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return <EmployeeListingPage />;
}
