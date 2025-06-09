'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Lock, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { OTCTotal } from './overview';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LockedTooltip } from './Lock';

const chartConfig = {
  bond: {
    label: 'Төвлөрсөн дүн ₮',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export function OTCTotalAreaGraph({ data }: { data: OTCTotal[] }) {
  const t = useTranslations('overview');

  const locale = useLocale();
  const chartData = [
    { month: `${t('months.jan')}`, bond: data[0].totalAmountSum },
    { month: `${t('months.feb')}`, bond: data[1].totalAmountSum },
    { month: `${t('months.mar')}`, bond: data[2].totalAmountSum },
    { month: `${t('months.apr')}`, bond: data[3].totalAmountSum },
    { month: `${t('months.may')}`, bond: data[4].totalAmountSum },
    { month: `${t('months.jun')}`, bond: data[5].totalAmountSum }
  ];
  const highestBond = chartData.reduce((max, current) => {
    return current.bond > max.bond ? current : max;
  });
  const totalSum = chartData.reduce(
    (total, current) => total + current.bond,
    0
  );
  const total = formatLargeNumber(highestBond.bond, locale);
  const allmonthtotalFormatted = formatLargeNumber(totalSum, locale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <LockedTooltip isLocked />
            {t('otccardtitle')}
          </span>
        </CardTitle>
        <CardDescription>{t('otcdetail')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 22, //22-oos dooshoo bolohoor cardaas carchihaad bna.
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              dataKey="bond"
              type="natural"
              fill="var(--color-bond)"
              fillOpacity={0.4}
              stroke="var(--color-bond)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col items-start justify-between gap-2  gap-y-4 text-sm md:flex-row">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {t('otcbelowtitle')} {highestBond.month} {t('andtotal')} {total} ₮{' '}
              {t('gathered')}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {t('otcbelowdescription')} {allmonthtotalFormatted} ₮{' '}
              {t('gathered')}
            </div>
          </div>
          <Link href={`/dashboard/otc`}>
            <Button> {t('details')}</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
const formatLargeNumber = (number: number, locale: string) => {
  if (locale === 'mn') {
    // Mongolian format for larger numbers
    if (number >= 1e15) {
      return (number / 1e15).toFixed(1) + ' их наяд'; // quadrillion
    } else if (number >= 1e12) {
      return (number / 1e12).toFixed(1) + ' триллион'; // trillion
    } else if (number >= 1e9) {
      return (number / 1e9).toFixed(1) + ' тэрбум'; // billion
    } else if (number >= 1e6) {
      return (number / 1e6).toFixed(1) + ' сая'; // million
    } else if (number >= 1e3) {
      return (number / 1e3).toFixed(1) + ' мянга'; // thousand
    }
  }

  // English format for larger numbers
  if (number >= 1e15) {
    return (number / 1e15).toFixed(1) + ' quadrillion';
  } else if (number >= 1e12) {
    return (number / 1e12).toFixed(1) + ' trillion';
  } else if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + ' billion';
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + ' million';
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + ' thousand';
  }

  return number; // Default case (for smaller numbers)
};
