'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/select';
import { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface Option {
  value: string;
  label: string;
}

export default function SearchSelectInput({
  placeholder,
  query,
  options,
  className,
  defaultValue
}: {
  placeholder: string;
  query: string;
  options: Option[];
  className?: string;
  defaultValue?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [currentValue, setCurrentValue] = useState(defaultValue || placeholder);

  useEffect(() => {
    setCurrentValue(defaultValue || placeholder); // Update current value when defaultValue changes
  }, [defaultValue, placeholder]);

  const handleChange = (value: string) => {
    setCurrentValue(value); // Update state on value change

    const params = new URLSearchParams(searchParams);
    params.delete('page');

    if (value === placeholder) {
      params.delete(query);
      replace(`${pathname}?${params.toString()}`);
      return;
    }

    params.set(query, value);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        'relative flex flex-1 flex-shrink-0 rounded-[20px]',
        className
      )}
    >
      <Select
        onValueChange={handleChange}
        value={currentValue} // Use the tracked value
      >
        <SelectTrigger id="search-trigger">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60 overflow-y-auto">
          <SelectItem value={placeholder}>{placeholder}</SelectItem>
          <ScrollArea>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
