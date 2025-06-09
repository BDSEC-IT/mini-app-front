import { ScrollArea } from '@/components/ui/scroll-area';

import PageContainer from '@/components/layout/page-container';
import { UBXPriceHistoryCard } from './ubx-prices-history-table';

export default function EmployeeViewPage() {
  return (
    <PageContainer>
      <UBXPriceHistoryCard />
    </PageContainer>
  );
}
