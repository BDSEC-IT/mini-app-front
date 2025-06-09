import OverviewPage from './_components/overview-view-page';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
type pageProps = {
  searchParams: SearchParams;
};
import { serialize } from '@/lib/searchparams';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('CHEXPage'),
    description: t('CHEXPageDescription')
  };
}
export default function page({ searchParams }: pageProps) {
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });

  return <OverviewPage key={key} />;
}
