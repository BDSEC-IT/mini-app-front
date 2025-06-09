import { ScrollArea } from '@/components/ui/scroll-area';
import { searchParamsCache } from '@/lib/searchparams';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { UBXOrderBook } from './orderbook';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { UBXTable } from './ubx-overview-table';
type pageProps = {
  searchParams: SearchParams;
};
import { SearchParams } from 'nuqs/parsers';
import { serialize } from '@/lib/searchparams';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { HistoryIcon, Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function EmployeeViewPage({ searchParams }: pageProps) {
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });
  const t = await getTranslations('mseBondTable');
  return (
    <PageContainer>
      <PageContainer scrollable>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`${t('ubxpagetitle')}`}
              description={`${t('ubxpagedescription')}`}
            />
            <Link
              href={'/dashboard/ubx/prices'}
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <HistoryIcon className="mr-2 h-4 w-4" /> UBX Price History
            </Link>
          </div>
          <Separator />
          <div className="flex flex-col gap-3  lg:flex-row">
            <Suspense
              // key={key}
              fallback={<DataTableSkeleton columnCount={13} rowCount={8} />}
            >
              <div className="w-full">
                <UBXTable />
              </div>
            </Suspense>
            <Suspense
              key={key}
              fallback={
                <div className="w-full max-w-full overflow-x-auto lg:w-[400px]">
                  <DataTableSkeleton columnCount={3} rowCount={5} />
                </div>
              }
            >
              <UBXOrderBook />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </PageContainer>
  );
}
