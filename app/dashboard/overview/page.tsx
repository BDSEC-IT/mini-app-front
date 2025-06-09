import { getUserLocale } from '@/lib/locale';
import OverViewPage from './_components/overview';
import OverViewPageSkeleton from './_components/skeleton';
import { getTranslations } from 'next-intl/server';

// export const metadata = {
//   title: 'Dashboard : Overview'
// };

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('OverviewPage'),
    description: 'Демо арилжааны систем'
  };
}
export default function page() {
  // return <OverViewPageSkeleton />;
  // return <OverViewPage />;
  return <div>aaa</div>;
}
