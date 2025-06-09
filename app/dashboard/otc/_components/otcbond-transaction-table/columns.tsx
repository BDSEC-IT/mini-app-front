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
import Link from 'next/link';
import { OTCBond } from '../otcbond-primarytable-card';
import { useIsMobile } from '@/hooks/use-mobile';
interface ColumnWrapperProps {
  children: (t: any) => JSX.Element;
}

const ColumnWrapper = ({ children }: ColumnWrapperProps) => {
  const t = useTranslations('OTCBond');
  return <>{children(t)}</>;
};
interface SortableHeaderProps {
  column: any;
  title: string;
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { History } from '../bond-details-view-page';

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown className="size-3" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp className="size-3" />
            ) : (
              <ChevronsUpDown className="size-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            <ColumnWrapper>{(t) => <div>{t('header.asc')}</div>}</ColumnWrapper>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            <ColumnWrapper>
              {(t) => <div>{t('header.desc')}</div>}
            </ColumnWrapper>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            <ColumnWrapper>
              {(t) => <div>{t('header.hide')}</div>}
            </ColumnWrapper>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export const OTCTransactionTableColumn: ColumnDef<History>[] = [
  {
    accessorKey: 'settlement_date',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('settlement_date')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => {
      const formattedDate = new Date(
        row.getValue<string>('settlement_date')
      ).toLocaleDateString();
      return <div>{formattedDate}</div>;
    }
  },
  {
    accessorKey: 'symbol',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('symbol')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('symbol')}</div>
  },

  {
    accessorKey: 'quantity',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('quantity')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('quantity')}</div>
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('price')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => (
      <div>
        {parseFloat(row.getValue<string>('price')).toLocaleString('en-US', {
          maximumFractionDigits: 2
        })}
      </div>
    )
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <DataTableColumnHeader column={column} title={t('totalAmount')} />
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => (
      <div>
        {parseFloat(row.getValue<string>('total_amount')).toLocaleString(
          'en-US',
          {
            maximumFractionDigits: 2
          }
        )}
      </div>
    )
  }
];
