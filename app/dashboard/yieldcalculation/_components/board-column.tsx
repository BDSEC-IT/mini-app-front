import { useDndContext, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ColumnActions } from './column-action';
import Yield from './yield'; // Import the Yield component
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MSEBond } from '../../mse/_components/mse-overview-table';

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = 'Column';

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  isOverlay?: boolean;
  bonds: MSEBond[];
  otcBonds: MSEBond[] | null;
}

export function BoardColumn({
  column,
  isOverlay,
  bonds,
  otcBonds
}: BoardColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  const variants = cva(
    'h-[75vh] max-h-[75vh] w-full md:w-[900px] max-w-full bg-background flex flex-col flex-shrink-0 snap-center',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary'
        }
      }
    }
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined
      })}
    >
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold">
        <Button
          variant={'ghost'}
          {...attributes}
          {...listeners}
          className=" relative -ml-2 h-auto  cursor-grab p-1 text-primary/50"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <ColumnActions id={column.id} title={'Өгөөж'} />
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-4 overflow-hidden p-2">
        <ScrollArea className="h-full flex-grow">
          <Yield bonds={bonds} otcBonds={otcBonds} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('px-2 pb-4 md:px-0', {
    variants: {
      dragging: {
        default: '',
        active: 'snap-none'
      }
    }
  });

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div
        className={variations({
          dragging: dndContext.active ? 'active' : 'default'
        })}
      >
        <div className="mr-3 grid grid-cols-1 gap-4  md:mr-0 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      </div>
    </ScrollArea>
  );
}
