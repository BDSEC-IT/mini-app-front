import { ScrollArea } from '@/components/ui/scroll-area';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CHEXSecurityDescription } from './chex-abs';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { CHEXSecurity, CHEXTable } from './ubx-overview-table';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function EmployeeViewPage({ key }: { key: string }) {
  const t = await getTranslations('mseBondTable');
  return (
    <PageContainer>
      <PageContainer scrollable>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('chex.chexcardtitle')}
              description={t('chex.chexcarddescription')}
            />
          </div>
          <Separator />
          <CHEXListContent key={key} />
        </div>
      </PageContainer>
    </PageContainer>
  );
}
async function CHEXListContent({ key }: { key: string }) {
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/chex/ipo/last-registration`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const jsonResponse = await response.json();
  const data: CHEXSecurity[] = jsonResponse.content;
  return (
    <div className="flex flex-col gap-3  lg:flex-row">
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={13} rowCount={8} />}
      >
        <div className="hidden w-full lg:block">
          <CHEXTable data={data} />
        </div>
      </Suspense>
      <Suspense
        key={key}
        fallback={
          <div className="w-[350px]">
            <DataTableSkeleton columnCount={3} rowCount={5} />
          </div>
        }
      >
        <CHEXSecurityDescription data={data} />
      </Suspense>
    </div>
  );
}
