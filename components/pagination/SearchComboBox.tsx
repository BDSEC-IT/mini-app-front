'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Option {
  value: string;
  label: string;
}

export default function SearchComboBox({
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

  const [currentValue, setCurrentValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentValue(defaultValue || ''); // Update the current value when defaultValue changes
  }, [defaultValue]);

  const handleChange = (value: string) => {
    setCurrentValue(value); // Update state on value change

    const params = new URLSearchParams(searchParams);
    params.delete('page');

    if (value === '') {
      params.delete(query);
      replace(`${pathname}?${params.toString()}`);
      return;
    }

    params.set(query, value);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter options based on search term, matching both value and label
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const t = useTranslations('');
  return (
    <div className={cn('relative flex flex-1 flex-shrink-0', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {currentValue
              ? options.find((option) => option.value === currentValue)
                  ?.label || placeholder
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="flex h-12 items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground opacity-50" />
              <input
                type="text"
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`${placeholder}...`}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                value={searchTerm} // Bind the value of the input field
              />
            </div>
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(value) => {
                    handleChange(value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      currentValue === option.value
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
