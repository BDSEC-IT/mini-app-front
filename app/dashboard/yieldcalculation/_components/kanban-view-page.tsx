import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { KanbanBoard } from './kanban-board';
import { getTranslations } from 'next-intl/server';
import { fetcher } from '@/lib/clientFetcher';
import { MSEBond } from '../../mse/_components/mse-overview-table';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { OTCBond } from '../../otc/_components/otcbond-primarytable-card';

export default async function KanbanViewPage() {
  const t = await getTranslations('Controls');
  const SESSION = await auth();

  let otcBonds: MSEBond[] | null = null;

  if (SESSION?.user.role === 'ADMIN' || SESSION?.user.role === 'SUPERADMIN') {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/otc/real/all`,
      {
        cache: 'force-cache', // Enables caching
        next: { revalidate: 1800 }, // Cache for 30 minutes (1800 seconds)
        headers: {
          Authorization: `Bearer ${SESSION.user.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => notFound());

    if (response.status === 403) {
      return (
        <div className="m-4 rounded-2xl bg-destructive p-4 text-destructive-foreground shadow-sm">
          Та хаягаараа дахин нэвтэрч орно уу
        </div>
      );
    }

    const jsonResponse = await response.json();

    const data: OTCBond[] = jsonResponse.data;
    // @ts-ignore
    const formattedBonds: MSEBond[] = data
      .filter((bond) => {
        const maturityDate = new Date(bond.maturity_date);
        const currentDate = new Date(
          new Date().toLocaleString('en-US', { timeZone: 'Asia/Ulaanbaatar' })
        );
        return maturityDate >= currentDate;
      })
      .map((bond) => ({
        pkId: bond.pkId,
        BondenName: bond.name,
        Interest: bond.interestRate,
        NominalValue: Number(bond.nominalValue),
        TradedDate: bond.start_date,
        RefundDate: bond.maturity_date,
        Isdollar: bond.isdollar === 'yes' ? 'доллар' : null
      }));
    otcBonds = formattedBonds;
  }

  const bonds = (
    await fetcher<{ data: MSEBond[] }>(`/bonds/getmsebonds`, {
      cache: 'force-cache',
      next: { revalidate: 600 } // Cache for 10 minutes (600 seconds)
    })
  ).data.filter(
    (bond) =>
      bond.RefundDate !== 'Буцаан төлөгдсөн' &&
      new Date(bond.RefundDate) >= new Date() // Keep only future or valid refund dates
  );

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={t(`yieldcalculatorpage`)}
            description={t(`yieldcalculatordescription`)}
          />
        </div>
        <KanbanBoard bonds={bonds} otcBonds={otcBonds} />
      </div>
    </PageContainer>
  );
}
