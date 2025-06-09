'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { useLocale, useTranslations } from 'next-intl';
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
import { useSearchParams } from 'next/navigation';

import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/customui/SearchInput';
import { SearchIcon } from 'lucide-react';
interface RowData {
  Symbol: string | null; // Ensure it matches the data type
  [key: string]: any; // Optional: Allow other dynamic properties
}
export function DataTable<TData extends RowData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const handleRowClick = (symbol: string | null) => {
    if (symbol) {
      const params = new URLSearchParams(window.location.search);
      params.set('SYMBOL', symbol);
      params.set('page', String(table.getState().pagination.pageIndex + 1)); // Preserve the current page
      router.replace(`?${params.toString()}`);
      // router.push(`?${params.toString()}`, undefined { shallow: true }); // Use shallow routing to avoid full re-render
    }
  };
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      Isdollar: false // Set this to false to hide by default
    });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    }
  });
  const t = useTranslations('mseBondTable');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const activeSymbol = searchParams.get('SYMBOL');
  return (
    <div>
      <div className="mx-3 mb-4 grid grid-cols-1 gap-3 sm:mx-0  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <SearchInput
          startIcon={SearchIcon}
          placeholder={t('pagination.symbol')}
          value={(table.getColumn('Symbol')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('Symbol')?.setFilterValue(event.target.value)
          }
          className=""
        />
        <SearchInput
          startIcon={SearchIcon}
          placeholder={t('pagination.bondname')}
          value={
            (table.getColumn('BondNameDynamic')?.getFilterValue() as string) ??
            ''
          }
          onChange={(event) =>
            table
              .getColumn('BondNameDynamic')
              ?.setFilterValue(event.target.value)
          }
          className=""
        />
        <SearchInput
          startIcon={SearchIcon}
          placeholder={t('pagination.issuer')}
          value={
            (table
              .getColumn('IssuerNameDynamic')
              ?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table
              .getColumn('IssuerNameDynamic')
              ?.setFilterValue(event.target.value)
          }
          className=""
        />

        <SearchInput
          startIcon={SearchIcon}
          placeholder={t('pagination.refundDate')}
          value={
            (table.getColumn('RefundDate')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('RefundDate')?.setFilterValue(event.target.value)
          }
          className=""
        />
      </div>
      <div className="rounded-md border">
        <ScrollArea className="grid h-[calc(90vh-240px)] rounded-md border md:h-[calc(90dvh-300px)]">
          <Table className="text-xs lg:text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    onClick={() => handleRowClick(row.original.Symbol)} // Access the Symbol field correctly
                    className={`cursor-pointer ${
                      row.original.Symbol === activeSymbol ? 'bg-accent' : ''
                    }`} // Apply class if row's Symbol matches the query parameter.
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <ScrollBar orientation="horizontal" />
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
