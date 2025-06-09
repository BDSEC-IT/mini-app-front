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
import { UBXPrice } from '../ubx-prices-history-table';
import Link from 'next/link';

interface ColumnWrapperProps {
  children: (t: any) => JSX.Element;
}

const ColumnWrapper = ({ children }: ColumnWrapperProps) => {
  const t = useTranslations('ubxPriceTable');
  return <>{children(t)}</>;
};

export const UbxPriceColumns: ColumnDef<UBXPrice>[] = [
  {
    accessorKey: 'id',
    header: () => <ColumnWrapper>{(t) => <div>ID</div>}</ColumnWrapper>
  },
  {
    accessorKey: 'code',
    header: () => <ColumnWrapper>{(t) => <div>{t('code')}</div>}</ColumnWrapper>
  },
  {
    accessorKey: 'date',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('date')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const date = row.getValue<string>('date');
      const formattedDate = new Date(date).toLocaleDateString();
      return <div>{formattedDate}</div>;
    }
  },
  {
    accessorKey: 'open',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('open')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('open');
      return <div>{value.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: 'low',
    header: () => <ColumnWrapper>{(t) => <div>{t('low')}</div>}</ColumnWrapper>,
    cell: ({ row }) => {
      const value = row.getValue<number>('low');
      return <div>{value.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: 'high',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('high')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('high');
      return <div>{value.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: 'close',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('close')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('close');
      return <div>{value.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: 'volume',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('volume')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('volume');
      const formattedVolume = new Intl.NumberFormat('en-US').format(value);
      return <div>{formattedVolume}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ubxPrice = row.original;

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
                  onClick={() => navigator.clipboard.writeText(ubxPrice.code)}
                >
                  {t('actions.copyCode')}
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={`/dashboard/ubx?SYMBOL=${ubxPrice.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('actions.viewDetails')}
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ColumnWrapper>
      );
    }
  }
];
