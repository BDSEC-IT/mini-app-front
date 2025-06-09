import { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = 'en';
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    name: t('HomePage'),
    start_url: '/',
    theme_color: '#101E33'
  };
}
