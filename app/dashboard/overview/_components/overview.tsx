'use server';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { LatestMseBonds } from './LatestMseBonds';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/auth';

import { MSEBond } from '../../mse/_components/mse-overview-table';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CHEXShortened, LatestChexSecurities } from './LatestChexSecurities';
import { TotalBondsPieGraph } from './TotalBondsPieGraph';
import { OTCTotalAreaGraph } from './OTCTotalAreaGraph';
import { LockedTooltip } from './Lock';
import TradingTime from './TradingTime';
interface MseData {
  total: number;
  available: number;
}
export interface OTCTotal {
  month: number;
  totalAmountSum: number;
}
export interface OverviewData {
  mse: MseData;
  chex: MseData;
  ubx: MseData;
  all: MseData;
  otc: MseData;
  last2chex: {
    data: CHEXShortened[];
  };
  otc6monthstotal: {
    data: OTCTotal[];
  };
  last5msebonds: {
    data: MSEBond[];
  };
}
export default async function OverViewPage() {
  const t = await getTranslations('overview');
  const SESSION = await auth();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/bonds/publicoverview`,
    {
      cache: 'reload',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const data = await response.json();
  const overviewData: OverviewData = data.data;
  if (!overviewData) {
    notFound();
  }
  return (
    <PageContainer scrollable>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {SESSION?.user
              ? `${t('hello')} ${SESSION.user.firstName} 👋`
              : `${t('bondmarket')} 🏦`}
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker aria-disabled />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              {t('analytics')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <LockedTooltip isLocked={false} />
                      {t('msetitle')}
                    </span>
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 ">
                    <div>
                      <div className="text-2xl font-bold">
                        +{overviewData.mse.total} {t('bond')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('availablebond')} {overviewData.mse.available}
                      </p>
                    </div>
                    <Link href={`/dashboard/mse`}>
                      <Button variant={'outline'}>{t('view')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <LockedTooltip isLocked />
                      {t('otctitle')}
                    </span>
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 ">
                    <div>
                      <div className="text-2xl font-bold">
                        +{overviewData.otc.total} {t('bond')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('availablebond')} {overviewData.otc.available}
                      </p>
                    </div>
                    <Link href={`/dashboard/otc`}>
                      <Button variant={'outline'}>{t('view')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <span className="items- flex gap-2">
                      <LockedTooltip isLocked />
                      {t('ubxtitle')}
                    </span>
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 ">
                    <div>
                      <div className="text-2xl font-bold">
                        +{overviewData.ubx.total} {t('bond')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('availablebond')} {overviewData.ubx.available}
                      </p>
                    </div>
                    <Link href={`/dashboard/ubx`}>
                      <Button variant={'outline'}>{t('view')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <LockedTooltip isLocked={false} />
                      {t('chextitle')}
                    </span>
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 ">
                    <div>
                      <div className="text-2xl font-bold">
                        +{overviewData.chex.total} {t('abs')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('availableabs')} {overviewData.chex.available}
                      </p>
                    </div>
                    <Link href={`/dashboard/chex`}>
                      <Button variant={'outline'}>{t('view')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div> */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {['mse', 'otc', 'ubx', 'chex'].map((key) => {
                const item =
                  overviewData[
                    key as keyof Pick<
                      OverviewData,
                      'mse' | 'otc' | 'ubx' | 'chex'
                    >
                  ];

                return (
                  <Card
                    key={key}
                    className="relative min-h-[150px] overflow-hidden rounded-lg border  transition-all duration-300 dark:border-b-primary dark:border-l-primary  dark:bg-opacity-20 dark:shadow-inner dark:hover:shadow-primary"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        <span className="relative z-10 flex items-center gap-2">
                          <LockedTooltip isLocked={key === 'otc'} />
                          {t(`${key}title`)}
                        </span>
                      </CardTitle>
                      <svg
                        className="absolute  right-[-50px] top-[100px] z-[0] h-[200%] w-0 blur-3xl dark:w-[200%] dark:text-primary"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="currentColor"
                          d="M70,-80C90,-60,110,-40,120,-10C130,20,120,50,100,80C80,110,50,130,10,140C-30,150,-70,150,-110,130C-150,110,-170,80,-160,40C-150,0,-120,-40,-90,-70C-60,-100,-30,-130,10,-140C50,-150,90,-140,110,-120Z"
                          transform="translate(15 150)"
                        />
                      </svg>
                    </CardHeader>
                    <CardContent className="relative">
                      <span className="absolute inset-0 z-0 flex -translate-x-1/4 rotate-12 select-none items-center justify-center text-[170px] font-bold uppercase text-gray-300 opacity-30 dark:text-primary dark:opacity-10">
                        {key.toUpperCase()}
                      </span>
                      <svg
                        className="absolute right-[-40px] top-[-40px] z-[0] h-[300%] w-0 text-primary blur-3xl  dark:w-[300%]"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="currentColor"
                          d="M70,-80C90,-60,110,-40,120,-10C130,20,120,50,100,80C80,110,50,130,10,140C-30,150,-70,150,-110,130C-150,110,-170,80,-160,40C-150,0,-120,-40,-90,-70C-60,-100,-30,-130,10,-140C50,-150,90,-140,110,-120Z"
                          transform="translate(100 100)"
                        />
                      </svg>
                      <div className="relative z-10 flex items-end justify-between gap-2">
                        <div>
                          <div className="text-2xl font-bold">
                            +{item.total}{' '}
                            {key === 'chex' ? t('abs') : t('bond')}
                          </div>
                          <TradingTime tradingKey={key} />
                          <p className="text-xs text-muted-foreground">
                            {key === 'chex'
                              ? t('availableabs')
                              : t('availablebond')}{' '}
                            {item.available}
                          </p>
                        </div>
                        <Link href={`/dashboard/${key}`}>
                          <Button variant={'outline'}>{t('view')}</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                {/* <BarGraph /> */}
                {/* <OTCTotalAreaGraph data={overviewData.otc6monthstotal.data} /> */}

                <LatestChexSecurities data={overviewData.last2chex.data} />
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>
                    {t('msecardtitle')} (
                    {overviewData.last5msebonds.data.length})
                  </CardTitle>
                  <CardDescription>{t('msecarddescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <LatestMseBonds data={overviewData.last5msebonds.data} />
                </CardContent>
              </Card>
              <div className="col-span-4">
                {/* <AreaGraph /> */}
                {/* <LatestChexSecurities data={overviewData.last2chex.data} /> */}

                <OTCTotalAreaGraph data={overviewData.otc6monthstotal.data} />
              </div>
              <div className="col-span-4 md:col-span-3">
                <TotalBondsPieGraph data={overviewData} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
