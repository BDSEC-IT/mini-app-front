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
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function OTCPrimaryTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ BondenName: false });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
  const tPag = useTranslations('pagination');
  const locale = useLocale();

  return (
    <div>
      <div className="mx-3 mb-4 grid grid-cols-1 gap-3 sm:mx-0  sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder={t('pagination.symbol')}
          value={(table.getColumn('symbol')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('symbol')?.setFilterValue(event.target.value)
          }
          className=""
        />
        <Input
          placeholder={t('pagination.bondname')}
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className=""
        />
        <Input
          placeholder={t('pagination.issuer')}
          value={
            (table.getColumn('underwriter')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('underwriter')?.setFilterValue(event.target.value)
          }
          className=""
        />
      </div>
      <div className="rounded-md border">
        <ScrollArea className="grid h-[calc(80vh-180)] rounded-md border md:h-[calc(80dvh-400px)]">
          <Table className="text-xs">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-accent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={index % 2 === 0 ? '' : 'bg-accent'}
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
      <div className="flex flex-wrap items-center justify-end gap-y-2 space-x-2 py-4">
        {/* Rows per page dropdown */}
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-28 border p-1 text-center">
            <SelectValue
              placeholder={`${table.getState().pagination.pageSize} / Хуудас`}
              className="text-center"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10" className="text-center">
              10 / {t('page')}
            </SelectItem>
            <SelectItem value="20" className="text-center">
              20 / {t('page')}
            </SelectItem>
            <SelectItem value="30" className="text-center">
              30 / {t('page')}
            </SelectItem>
            <SelectItem value="50" className="text-center">
              50 / {t('page')}
            </SelectItem>
          </SelectContent>
        </Select>
        {/* Display current page and total pages */}
        <span>
          {t('page')}{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} {t('break')}{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t('previous')}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
}
