'use client';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/lib/store-yield';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ColumnActions({
  id,
  title
}: {
  id: UniqueIdentifier;
  title: string;
}) {
  const removeCol = useTaskStore((state) => state.removeCol);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const t = useTranslations('Controls');
  return (
    <>
      <span className="mx-2 text-lg font-semibold">{t('yieldcalculator')}</span>
      {/* <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-1">
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete Section
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <Button
        onClick={() => setShowDeleteDialog(true)}
        variant="outline"
        className="ml-4"
      >
        <X className="h-4 w-4 text-destructive" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteyield')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteyielddescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setTimeout(() => (document.body.style.pointerEvents = ''), 100);
                setShowDeleteDialog(false);
                removeCol(id);
                toast(t('deletedyield'));
              }}
            >
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
