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
export const OTCPrimaryTableColumn: ColumnDef<OTCBond>[] = [
  {
    accessorKey: 'type',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('type')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('type')}</div>
  },
  {
    accessorKey: 'board',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('board')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('board')}</div>
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
    accessorKey: 'name',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('name')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          href={`/dashboard/otc/${id}`}
          className="inline-flex items-center font-medium text-blue-600 hover:underline dark:text-blue-500"
        >
          {row.getValue<string>('name')}
        </Link>
      );
    }
  },
  {
    accessorKey: 'underwriter',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <DataTableColumnHeader column={column} title={t('underwriter')} />
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('underwriter')}</div>
  },
  {
    accessorKey: 'currency',
    header: () => (
      <ColumnWrapper>{(t) => <div>{t('currency')}</div>}</ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('currency')}</div>
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
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <DataTableColumnHeader column={column} title={t('totalAmount')} />
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => (
      <div>
        {parseFloat(row.getValue<string>('totalAmount')).toLocaleString(
          'en-US',
          { maximumFractionDigits: 2 }
        )}
      </div>
    )
  },
  {
    accessorKey: 'interestRate',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <DataTableColumnHeader column={column} title={t('interestRate')} />
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('interestRate')}</div>
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <DataTableColumnHeader column={column} title={t('start_date')} />
        )}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const formattedDate = new Date(
        row.getValue<string>('start_date')
      ).toLocaleDateString();
      return <div>{formattedDate}</div>;
    }
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('end_date')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const formattedDate = new Date(
        row.getValue<string>('end_date')
      ).toLocaleDateString();
      return <div>{formattedDate}</div>;
    }
  },
  {
    accessorKey: 'progress',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('progress')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const progress = parseFloat(row.getValue<string>('progress'));
      return (
        <div className="align mb-4 flex h-2.5 w-full flex-col justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500"
            style={{ width: `${progress}%` }}
          >
            <div className="mt-2 text-center">{`${progress}%`}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'state',
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => <DataTableColumnHeader column={column} title={t('state')} />}
      </ColumnWrapper>
    ),
    cell: ({ row }) => <div>{row.getValue<string>('state')}</div>
  }
];
