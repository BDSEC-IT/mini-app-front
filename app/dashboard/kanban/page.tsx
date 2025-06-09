import { getUserLocale } from '@/lib/locale';
import KanbanViewPage from './_components/kanban-view-page';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('TODOPage'),
    description: t('TODOPageDescription')
  };
}
export default function page() {
  return <KanbanViewPage />;
}
