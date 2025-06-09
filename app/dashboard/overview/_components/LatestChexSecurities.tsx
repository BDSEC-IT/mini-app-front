'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export const description = 'An interactive bar chart';

export interface CHEXShortened {
  icon: string;
  issuedShares: number;
  outstandingShares: number;
  symbol: string;
  securityStatus: string;
  currency: string;
  parValue: number;
  maturityDate: string;
  bondRate: number;
  fileUrl: string | null;
  name: string;
  total: number | null;
  registeredAt: string;
}
import { useTranslations } from 'next-intl';
export function LatestChexSecurities({ data }: { data: CHEXShortened[] }) {
  const [currentTab, setCurrentTab] = React.useState(data[0].symbol);

  // Find the selected security by symbol
  const selectedSecurity = data.find((sec) => sec.symbol === currentTab);

  // Calculate the progress percentage if selectedSecurity is found
  const progress = selectedSecurity
    ? (selectedSecurity.issuedShares / selectedSecurity.outstandingShares) * 100
    : 0;

  // Calculate the total if it exists based on the progress and outstandingShares
  const total = selectedSecurity?.total
    ? selectedSecurity.total * (progress / 100)
    : null;
  const t = useTranslations('overview');

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{t('chextcarditle')} (2)</CardTitle>
          <CardDescription>{t('chexdescription')}</CardDescription>
        </div>
        <div className="flex">
          {data.map((sec) => {
            return (
              <button
                key={sec.symbol}
                data-active={currentTab === sec.symbol}
                className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setCurrentTab(sec.symbol)}
              >
                <span className="text-xs text-muted-foreground">
                  {sec.name}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {sec.symbol}
                </span>
                <span className="text-xs text-muted-foreground">
                  {sec.registeredAt.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="my-5 flex flex-col md:my-0">
          <span className="text-center  leading-none">
            {t('chexprogress')} {progress.toFixed(2)}%
            {total ? `- ${total.toLocaleString()} MNT` : ''}
          </span>
          <Progress value={progress} />
          <div className="flex flex-col md:flex-row">
            <div className="flex h-5 items-center space-x-4 text-sm">
              <Link
                href="https://chex.mn/"
                className="text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('birj')}
              </Link>
              <Separator orientation="vertical" />
              {selectedSecurity?.fileUrl && (
                <div>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={selectedSecurity?.fileUrl}
                    className="text-blue-700"
                  >
                    {t('file')}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            {/* Left Column: Image and Name */}
            <div className="flex flex-col items-center">
              <Image
                src={selectedSecurity!.icon}
                alt="zurag"
                height={150}
                width={150}
                className="rounded-2xl shadow-lg"
              />
              <div className="mt-4 text-center text-lg font-semibold">
                {selectedSecurity?.name}
              </div>
              <div className="mt-0  text-center text-sm   font-semibold text-muted-foreground">
                {t('hbuts')}
              </div>
            </div>

            {/* Right Column: Table for Details */}
            <div className="col-span-2">
              <Table>
                <TableBody>
                  {selectedSecurity?.total && (
                    <TableRow>
                      <TableCell>{t('TotalAmountBond')}</TableCell>
                      <TableCell>
                        {selectedSecurity?.currency}{' '}
                        {selectedSecurity?.total.toLocaleString('en-US')}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>{t('YearlyRate')}</TableCell>
                    <TableCell>
                      {selectedSecurity?.bondRate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('AstoundingShare')}</TableCell>
                    <TableCell>
                      {selectedSecurity?.outstandingShares.toLocaleString(
                        'en-US'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('ParValue')}</TableCell>
                    <TableCell>
                      {selectedSecurity?.currency}{' '}
                      {selectedSecurity?.parValue.toLocaleString('en-US')}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>{t('RegisteredAt')}</TableCell>
                    <TableCell>{selectedSecurity?.registeredAt}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('RefundDate')}</TableCell>
                    <TableCell>{selectedSecurity?.maturityDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('status')}</TableCell>
                    <TableCell>
                      {selectedSecurity?.securityStatus === 'ACTIVE' ? (
                        <Badge>{t('active')}</Badge>
                      ) : (
                        <Badge variant={'destructive'}>{t('inactive')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator className="my-4" />

          <Link
            className="items-center text-center text-xs text-blue-700 md:text-sm"
            href={`/dashboard/chex?SYMBOL=${currentTab ? currentTab : ''}`}
          >
            {t('details')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
