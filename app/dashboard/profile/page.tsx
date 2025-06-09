import { SearchParams } from 'nuqs/parsers';
import ProfileViewPage from './_components/profile-view-page';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';
import Settings from './Settings';

type pageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('ProfilePage'),
    description: t('ProfilePageDescription')
  };
}

export default async function Page({ searchParams }: pageProps) {
  return <Settings />;
}
