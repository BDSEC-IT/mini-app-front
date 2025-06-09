'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { File } from './bond-details-view-page';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function OTCLinks({ data }: { data: File[] }) {
  const router = useRouter();
  const file = data[0];
  const t = useTranslations('OTCBond');
  if (!file) {
    return <Badge> {t('Links.nofile')}</Badge>;
  }
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {file.security_intro && (
        <Button
          className="p-2"
          onClick={() => window.open(file.security_intro, '_blank')}
        >
          {t('Links.expertConclusion')}
        </Button>
      )}
      {file.form && (
        <Button
          className="p-2"
          onClick={() => window.open(file.form, '_blank')}
        >
          {t('Links.form')}
        </Button>
      )}
      {file.ugha && (
        <Button
          className="p-2"
          onClick={() => window.open(file.ugha, '_blank')}
        >
          {t('Links.ugha')}
        </Button>
      )}
      {file.estimate && (
        <Button
          className="p-2"
          onClick={() => window.open(file.estimate, '_blank')}
        >
          {t('Links.estimate')}
        </Button>
      )}
    </div>
  );
}
