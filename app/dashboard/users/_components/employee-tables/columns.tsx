'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { User } from '../employee-listing-page';
import { format, addHours } from 'date-fns';

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'firstName',
    header: 'First Name'
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number'
  },
  {
    accessorKey: 'role',
    header: 'ROLE'
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const utcDate = new Date(row.original.createdAt); // Parse UTC date
      const localDate = addHours(utcDate, 8); // Add 8 hours for Mongolia timezone
      return format(localDate, 'yyyy-MM-dd HH:mm:ss'); // Format the date
    }
  },
  {
    accessorKey: 'modifiedAt',
    header: 'Modified',
    cell: ({ row }) => {
      const utcDate = new Date(row.original.modifiedAt); // Parse UTC date
      const localDate = addHours(utcDate, 8); // Add 8 hours for Mongolia timezone
      return format(localDate, 'yyyy-MM-dd HH:mm:ss'); // Format the date
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
