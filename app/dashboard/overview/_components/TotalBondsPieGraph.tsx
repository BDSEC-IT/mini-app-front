'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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
import { OverviewData } from './overview';

const chartConfig = {
  visitors: {
    label: 'Бондууд'
  },
  mse: {
    label: 'Монголын хөрөнгийн бирж',
    color: 'hsl(var(--chart-1))'
  },
  otc: {
    label: 'Биржийн бус зах зээл',
    color: 'hsl(var(--chart-2))'
  },
  ubx: {
    label: 'Улаанбаатар Үнэт Цаасны Бирж',
    color: 'hsl(var(--chart-3))'
  },

  chex: {
    label: 'Чингис хаан хөрөнгийн бирж',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig;
import { useTranslations } from 'next-intl';

export function TotalBondsPieGraph({ data }: { data: OverviewData }) {
  const t = useTranslations('overview');

  const chartData = [
    { browser: 'otc', visitors: data.otc.total, fill: 'var(--color-otc)' },
    { browser: 'mse', visitors: data.mse.total, fill: 'var(--color-mse)' },
    { browser: 'ubx', visitors: data.ubx.total, fill: 'var(--color-ubx)' },
    { browser: 'chex', visitors: data.chex.total, fill: 'var(--color-chex)' }
  ];
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('bondmarkettotalbond')}</CardTitle>
        <CardDescription>2017-07-29 - {getCurrentDate()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[360px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {t('bonds')}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {t('bartitle1')}{' '}
          {calculatePercentage(data.otc.total, data.all.total).toFixed(2)}
          {t('bartitle2')}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t('bardescription1')}{' '}
          {calculatePercentage(data.mse.total, data.all.total).toFixed(2)}
          {t('bartitle2')}
        </div>
      </CardFooter>
    </Card>
  );
}
const getCurrentDate = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
};
const calculatePercentage = (part: number, total: number) => {
  if (total === 0) {
    return 0; // Avoid division by zero
  }
  return (part / total) * 100;
};
