import { ScrollArea } from '@/components/ui/scroll-area';
import { searchParamsCache } from '@/lib/searchparams';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { MSEOrderBook } from './orderbook';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { MSETable } from './mse-overview-table';
type pageProps = {
  searchParams: SearchParams;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchParams } from 'nuqs/parsers';
import { serialize } from '@/lib/searchparams';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import CalculateModal from './calculate-interest/calculate-modal';

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
              title={t('MsePageTitle')}
              description={t('MsePageDescription')}
            />
            <div>
              <CalculateModal />
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-3  xl:flex-row">
            <Suspense
              // key={key}
              fallback={<DataTableSkeleton columnCount={13} rowCount={8} />}
            >
              <div className="w-full">
                <MSETable />
              </div>
            </Suspense>
            <Suspense
              key={key}
              fallback={
                <div className="w-full max-w-full overflow-x-auto xl:w-[400px]">
                  <DataTableSkeleton columnCount={3} rowCount={5} />
                </div>
              }
            >
              <MSEOrderBook />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </PageContainer>
  );
}
