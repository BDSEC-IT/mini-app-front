import { Metadata } from 'next';
import SignInViewPage from '../../_components/sigin-view';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('RegisterPage'),
    description: t('RegisterPageDescription')
  };
}

export default function Page() {
  return <SignInViewPage />;
}
