'use server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import moment from 'moment';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { UBXQuotesTable } from './ubx-table';
import { UBXPriceTable } from './ubx-prices-table/data-table';
import { UbxPriceColumns } from './ubx-prices-table/columns';
import SearchSelectInput from '@/components/pagination/SearchSelectInput';
import { Label } from '@/components/ui/label';

export interface UBXPrice {
  id: number;
  code: string;
  date: string; // ISO date string
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}
import { searchParamsCache } from '@/lib/searchparams';
import QuickGraph from './ubx-prices-table/quick-graph';
import { getTranslations } from 'next-intl/server';

export async function UBXPriceHistoryCard() {
  const TOKEN = await getToken();
  const page = searchParamsCache.get('SYMBOL') || 'AND';
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/ubx/${page}/10/20`,
    {
      cache: 'force-cache',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const data: UBXPrice[] = await response.json();
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const earliestDate = moment(sortedData[0]?.date).format('YYYY-MM-DD');
  const latestDate = moment(sortedData[sortedData.length - 1]?.date).format(
    'YYYY-MM-DD'
  );

  const dateRange = `${earliestDate} - ${latestDate}`;
  const t = await getTranslations('ubxPriceTable');
  return (
    <div className="flex flex-col gap-3">
      <Card className="relative order-2">
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}: {page} {dateRange}
            </CardDescription>
            <div className="flex items-center  gap-2 lg:hidden">
              <Label htmlFor="framework">{t('symbol')}:</Label>
              <SearchSelectInput
                placeholder={t('selectsymbol')}
                defaultValue={page}
                className="flex-none"
                query="SYMBOL"
                options={[
                  {
                    value: 'AND',
                    label: 'AND'
                  },
                  {
                    value: 'INQ',
                    label: 'INQ'
                  },
                  {
                    value: 'MOST',
                    label: 'MOST'
                  },
                  {
                    value: 'ADBB1',
                    label: 'ADBB1'
                  },
                  {
                    value: 'ADBB2',
                    label: 'ADBB2'
                  },
                  {
                    value: 'ADBB3',
                    label: 'ADBB3'
                  },
                  {
                    value: 'ADBB4',
                    label: 'ADBB4'
                  }
                ]}
              />
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <div className="hidden items-center justify-center gap-2 lg:flex">
              <Label htmlFor="framework">{t('symbol')}:</Label>
              <SearchSelectInput
                placeholder={t('selectsymbol')}
                defaultValue={page}
                className="flex-none"
                query="SYMBOL"
                options={[
                  {
                    value: 'AND',
                    label: 'AND'
                  },
                  {
                    value: 'INQ',
                    label: 'INQ'
                  },
                  {
                    value: 'MOST',
                    label: 'MOST'
                  },
                  {
                    value: 'ADBB1',
                    label: 'ADBB1'
                  },
                  {
                    value: 'ADBB2',
                    label: 'ADBB2'
                  },
                  {
                    value: 'ADBB3',
                    label: 'ADBB3'
                  },
                  {
                    value: 'ADBB4',
                    label: 'ADBB4'
                  }
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className=" ">
            {/* <UBXQuotesTable data={data} /> */}
            <UBXPriceTable columns={UbxPriceColumns} data={data} />
          </div>
        </CardContent>
      </Card>
      <Card className="relative order-1">
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}: {page} {dateRange}
            </CardDescription>
            <div className="flex items-center  gap-2 lg:hidden">
              <Label htmlFor="framework">{t('symbol')}:</Label>
              <SearchSelectInput
                placeholder={t('selectsymbol')}
                defaultValue={page}
                className="flex-none"
                query="SYMBOL"
                options={[
                  {
                    value: 'AND',
                    label: 'AND'
                  },
                  {
                    value: 'INQ',
                    label: 'INQ'
                  },
                  {
                    value: 'MOST',
                    label: 'MOST'
                  },
                  {
                    value: 'ADBB1',
                    label: 'ADBB1'
                  },
                  {
                    value: 'ADBB2',
                    label: 'ADBB2'
                  },
                  {
                    value: 'ADBB3',
                    label: 'ADBB3'
                  },
                  {
                    value: 'ADBB4',
                    label: 'ADBB4'
                  }
                ]}
              />
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <div className="hidden items-center justify-center gap-2 lg:flex">
              <Label htmlFor="framework">{t('symbol')}:</Label>
              <SearchSelectInput
                placeholder={t('selectsymbol')}
                defaultValue={page}
                className="flex-none"
                query="SYMBOL"
                options={[
                  {
                    value: 'AND',
                    label: 'AND'
                  },
                  {
                    value: 'INQ',
                    label: 'INQ'
                  },
                  {
                    value: 'MOST',
                    label: 'MOST'
                  },
                  {
                    value: 'ADBB1',
                    label: 'ADBB1'
                  },
                  {
                    value: 'ADBB2',
                    label: 'ADBB2'
                  },
                  {
                    value: 'ADBB3',
                    label: 'ADBB3'
                  },
                  {
                    value: 'ADBB4',
                    label: 'ADBB4'
                  }
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className=" ">
            <QuickGraph data={data} symbol={page} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
