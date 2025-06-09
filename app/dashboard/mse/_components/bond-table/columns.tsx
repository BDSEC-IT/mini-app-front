'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
// Define the Bond type based on your data
export interface Bond {
  pkId: number;
  id: number;
  Symbol: string;
  BondmnName: string;
  BondenName: string;
  Issuer: string;
  IssuerEn: string;
  Interest: string;
  Date: string;
  NominalValue: number;
  mnInterestConditions: string;
  enInterestConditions: string;
  MoreInfo: string;
  updatedAt: string;
  TradedDate: string;
  RefundDate: string;
  Isdollar: string | null;
  createdAt: string;
  BondName: string;
}
interface ColumnWrapperProps {
  children: (t: any) => JSX.Element;
}
const ColumnWrapper = ({ children }: ColumnWrapperProps) => {
  const t = useTranslations('mseBondTable');
  return <>{children(t)}</>;
};
const accessorWrapper = ({ children }: ColumnWrapperProps) => {
  const t = useTranslations('mseBondTable');
  const locale = useLocale();
  return <>{children(t)}</>;
};
// Define columns for the bond data
export const columns: ColumnDef<Bond>[] = [
  {
    accessorKey: 'Symbol',

    header: () => (
      <ColumnWrapper>{(t) => <div>{t('symbol')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const symbol = row.getValue<string>('Symbol');
      return <div>{symbol ? <Badge>{symbol.split('-')[0]}</Badge> : ''}</div>;
    }
  },
  {
    id: 'BondNameDynamic',
    accessorFn: (row) => {
      const locale = useLocale();
      return locale === 'mn' ? row.BondmnName : row.BondenName;
    },
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('bondname')}</div>}</ColumnWrapper>
    )
  },

  {
    id: 'IssuerNameDynamic',
    accessorFn: (row) => {
      const locale = useLocale();
      return locale === 'mn' ? row.Issuer : row.IssuerEn;
    },
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('issuer')}</div>}</ColumnWrapper>
    )
  },
  {
    accessorKey: 'Date',

    header: () => (
      <ColumnWrapper>{(t) => <div>{t('date')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const locale = useLocale();
      const symbol = row.getValue<string>('Date');
      return (
        <div>
          {symbol ? `${symbol} ${locale === 'mn' ? 'жил' : 'year'}` : ''}
        </div>
      );
    }
  },
  {
    accessorKey: 'Interest',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('interest')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </ColumnWrapper>
    )
  },
  {
    accessorKey: 'Isdollar',
    enableHiding: true,

    header: () => (
      <ColumnWrapper>{(t) => <div>{t('currency')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const currency = row.getValue<string>('Isdollar');
      return <div>{currency === 'доллар' ? `USD` : 'MNT'}</div>;
    }
  },
  {
    accessorKey: 'NominalValue',
    header: () => (
      <ColumnWrapper>
        {(t) => <div className="text-left">{t('nominalValue')}</div>}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('NominalValue');
      const currency = row.getValue<string>('Isdollar');
      const curval = currency === 'доллар' ? `USD` : 'MNT';
      const formatted = new Intl.NumberFormat('en-US').format(value); // No currency style

      return (
        <div className="flex max-w-6 flex-col items-center text-center font-medium">
          <Badge className="mb-1 text-xs" variant="outline">
            {curval}
          </Badge>
          <span>{formatted}</span>
        </div>
      );
    }
  },

  {
    accessorKey: 'TradedDate',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('tradedDate')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </ColumnWrapper>
    )
  },
  {
    accessorKey: 'RefundDate',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('RefundDate')}
            <ArrowUpDown className=" h-4 w-4" />
          </Button>
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      let formatted = '';
      const value = row.getValue<string>('RefundDate');
      const locale = useLocale();
      const isDatePast =
        value !== 'Буцаан төлөгдсөн' && new Date(value) < new Date();

      if (value === 'Буцаан төлөгдсөн') {
        formatted = locale === 'mn' ? value : 'Refund completed';
        return (
          <div className="text-left font-medium text-muted-foreground">
            {formatted}
          </div>
        );
      } else {
        formatted = value;
      }

      return (
        <div
          className={`text-left font-medium ${
            isDatePast ? 'text-destructive' : 'text-green-700'
          }`}
        >
          {formatted}
        </div>
      );
    },
    enableSorting: true // Enable sorting for this column
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const bond = row.original;

      return (
        <ColumnWrapper>
          {(t) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions.actions')}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(bond.Symbol)}
                >
                  {t('actions.copySymbol')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a
                    href={bond.MoreInfo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('actions.viewMoreInfo')}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ColumnWrapper>
      );
    }
  }
];
