import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import CalculateInterest, { CalculateBond } from './calculate-interest';
import { fetcher } from '@/lib/clientFetcher';
import { MSEBond } from '../mse-overview-table';
import { CalculatorIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function CalculateModal() {
  const bonds = (
    await fetcher<{ data: MSEBond[] }>(`/bonds/getmsebonds`)
  ).data.filter(
    (bond) =>
      bond.RefundDate !== 'Буцаан төлөгдсөн' &&
      new Date(bond.RefundDate) >= new Date() // Keep only future or valid refund dates
  );
  const t = await getTranslations('Controls.yield');
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalculatorIcon className="mr-2 size-4" />
          {t('yieldTitle')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full min-w-fit md:min-w-[800px] lg:min-w-[1000px]">
        <DialogHeader>
          <DialogTitle> {t('yieldDescription')}</DialogTitle>
          <DialogDescription> {t('calculateYield')}</DialogDescription>
        </DialogHeader>
        <CalculateInterest bonds={bonds} />
      </DialogContent>
    </Dialog>
  );
}
