import { ScrollArea } from '@/components/ui/scroll-area';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { OTCBond, OTCPrimaryTableCard } from './otcbond-primarytable-card';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import { OTCSecondaryTableCard } from './otcbond-secondarytable-card';
import { getTranslations } from 'next-intl/server';
import CalculateInterest from './calculate-interest/calculate-interest';
import CalculateModal from './calculate-interest/calculate-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default async function EmployeeViewPage({ key }: { key: string }) {
  const t = await getTranslations('OTCBond');
  return (
    <PageContainer>
      <PageContainer scrollable>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title={t('maintitle')} description={t('description')} />
            <Suspense
              fallback={<Skeleton className="h-8 w-10 rounded-lg"></Skeleton>}
            >
              <CalculateModal />
            </Suspense>
          </div>
          <Separator />
          <OTCContent key={key} />
        </div>
      </PageContainer>
    </PageContainer>
  );
}
async function OTCContent({ key }: { key: string }) {
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/otc/real/all`,
    {
      cache: 'force-cache', // Enables caching
      next: { revalidate: 1800 }, // Cache for 30 minutes (1800 seconds)
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const jsonResponse = await response.json();

  const data: OTCBond[] = jsonResponse.data;
  const primary: OTCBond[] = [];
  const secondary: OTCBond[] = [];
  data.forEach((item) => {
    if (item.isPrimary === 'yes') {
      primary.push(item);
    } else {
      secondary.push(item);
    }
  });
  return (
    <div className="flex flex-col gap-3  lg:flex-row">
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={13} rowCount={8} />}
      >
        <div className="flex w-full flex-col gap-3">
          <OTCPrimaryTableCard data={primary} />
          <OTCSecondaryTableCard data={secondary} />
        </div>
      </Suspense>
    </div>
  );
}
