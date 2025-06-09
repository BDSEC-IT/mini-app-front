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
import { CalculatorIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MSEBond } from '@/app/dashboard/mse/_components/mse-overview-table';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import { OTCBond } from '../otcbond-primarytable-card';

export default async function CalculateModal() {
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
  const formattedBonds: CalculateBond[] = data
    .filter((bond) => {
      // Parse the maturity_date and the current date in the +08:00 timezone
      const maturityDate = new Date(bond.maturity_date);
      const currentDate = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Ulaanbaatar' })
      );

      // Keep bonds where maturity_date is after the current date
      return maturityDate >= currentDate;
    })
    .map((bond) => ({
      pkId: bond.pkId,
      BondenName: bond.name, // Mapping name to BondenName
      Interest: bond.interestRate, // Mapping interestRate to Interest
      NominalValue: Number(bond.nominalValue), // Converting nominalValue from string to number
      TradedDate: bond.start_date, // Mapping start_date to TradedDate
      RefundDate: bond.maturity_date, // Mapping maturity_date to RefundDate
      Isdollar: bond.isdollar === 'yes' ? 'доллар' : null // Convert isdollar to "доллар" or null
    }));
  console.log(formattedBonds);

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
        <CalculateInterest bonds={formattedBonds} />
      </DialogContent>
    </Dialog>
  );
}
