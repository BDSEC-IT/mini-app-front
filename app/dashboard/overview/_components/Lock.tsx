'use client';
import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface LockedTooltipProps {
  isLocked: boolean; // Prop to determine if the content is locked
}

export function LockedTooltip({ isLocked }: LockedTooltipProps) {
  const [open, setOpen] = React.useState(false);

  const toggleTooltip = () => setOpen((prev) => !prev);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button variant="outline" size="xs" onClick={toggleTooltip}>
            {isLocked ? (
              <Lock className="size-3.5" />
            ) : (
              <Unlock className="size-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs sm:max-w-sm lg:max-w-md">
          <p>
            {isLocked
              ? 'Хаалттай биржийн мэдээлэл тул та манай системд тусгай зөвшөөрлөөр орж хаалттай бондын мэдээллийг харна уу'
              : 'Нээлттэй биржийн мэдээлэл'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
