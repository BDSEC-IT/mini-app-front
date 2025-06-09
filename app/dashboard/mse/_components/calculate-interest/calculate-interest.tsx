'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CalendarIcon
} from 'lucide-react';
import { MSEBond } from '../mse-overview-table';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BondDetailsProps {
  bonds: CalculateBond[];
}
export interface CalculateBond {
  pkId: number;
  BondenName: string;
  Interest: string;
  NominalValue: number;
  TradedDate: string;
  RefundDate: string;
  Isdollar: string | null;
}
export default function CalculateInterest({ bonds }: BondDetailsProps) {
  const [selectedBond, setSelectedBond] = useState<CalculateBond | null>(null);
  const [days, setDays] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');

  const [selectedOption, setSelectedOption] = useState('default');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  //sell
  const [selectedBoughtDate, setselectedBoughtDate] = useState<string>();
  const [selectedWillSellDate, setSelectedWillSellDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sellBoughtQty, setSellBoughtQty] = useState<number | ''>('');
  const [sellBoughtPrice, setSellBoughtPrice] = useState<number | ''>('');
  const [sellSellPrice, setSellSellPrice] = useState<number | ''>('');
  const [sellDays, setSellDays] = useState<number | ''>('');

  useEffect(() => {
    if (bonds.length > 0) {
      setSelectedBond(bonds[0]);
      setSellBoughtPrice(bonds[0]?.NominalValue ? bonds[0]?.NominalValue : '');
    }
  }, [bonds]);

  const handleBondSelect = (bondId: number) => {
    const bond = bonds.find((bond) => bond.pkId === bondId);
    setSelectedBond(bond || null);
    setSellBoughtPrice(bond?.NominalValue ? bond.NominalValue : '');
    setDays('');
    setSellDays('');
    // setPrice('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const calculateYield = (): string => {
    if (
      !selectedBond ||
      (!days && selectedOption === 'comfortable') ||
      !price
    ) {
      return '0';
    }

    const interestRate = parseFloat(selectedBond.Interest) / 100;
    let totalYield = 0;

    if (selectedOption === 'default') {
      const today = new Date(selectedDate);
      const refundDate = new Date(selectedBond.RefundDate);
      const daysDifference = Math.ceil(
        (refundDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalYield = price * interestRate * (daysDifference / 365);
    } else if (selectedOption === 'comfortable' && days) {
      totalYield = price * interestRate * (days / 365);
    }

    return totalYield.toFixed(2); // Ensure it returns a string
  };
  const calculateSellYield = (): {
    totalYield: string;
    totalMoneySpentBuying: string;
    totalMoneyForSelling: string;
    interestValue: string;
    isProfitable: boolean;
    percentageChange: string;
  } => {
    // Validate required inputs
    if (
      !selectedBond ||
      (!sellDays && selectedOption === 'comfortable') || // `comfortable` mode requires `sellDays`
      !sellBoughtPrice ||
      !sellSellPrice ||
      !sellBoughtQty
    ) {
      return {
        totalYield: '0',
        totalMoneySpentBuying: '0',
        totalMoneyForSelling: '0',
        interestValue: '0',
        isProfitable: false,
        percentageChange: '0'
      };
    }

    // Parse the bond interest rate
    const interestRate = parseFloat(selectedBond.Interest) / 100;

    let totalMoneySpentBuying = 0;
    let totalMoneyForSelling = 0;
    let interestValue = 0;
    let totalYield = 0;

    // Calculate based on selected option
    if (selectedOption === 'default') {
      if (!selectedBoughtDate || !selectedWillSellDate) {
        return {
          totalYield: '0',
          totalMoneySpentBuying: '0',
          totalMoneyForSelling: '0',
          interestValue: '0',
          isProfitable: false,
          percentageChange: '0'
        };
      }

      const boughtDate = new Date(selectedBoughtDate);
      const sellDate = new Date(selectedWillSellDate);

      const daysDifference = Math.ceil(
        (sellDate.getTime() - boughtDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference <= 0 || !isValidDate(daysDifference)) {
        return {
          totalYield: '0',
          totalMoneySpentBuying: '0',
          totalMoneyForSelling: '0',
          interestValue: '0',
          isProfitable: false,
          percentageChange: '0'
        };
      }

      // Calculate totals
      totalMoneySpentBuying = sellBoughtQty * sellBoughtPrice;
      totalMoneyForSelling = sellBoughtQty * sellSellPrice;
      interestValue =
        sellBoughtQty *
        selectedBond.NominalValue *
        interestRate *
        (daysDifference / 365);
    } else if (selectedOption === 'comfortable' && sellDays) {
      if (!isValidDate(sellDays)) {
        return {
          totalYield: '0',
          totalMoneySpentBuying: '0',
          totalMoneyForSelling: '0',
          interestValue: '0',
          isProfitable: false,
          percentageChange: '0'
        };
      }

      // Calculate totals
      totalMoneySpentBuying = sellBoughtQty * sellBoughtPrice;
      totalMoneyForSelling = sellBoughtQty * sellSellPrice;
      interestValue =
        sellBoughtQty *
        selectedBond.NominalValue *
        interestRate *
        (sellDays / 365);
    }

    // Calculate total yield
    totalYield = totalMoneyForSelling + interestValue - totalMoneySpentBuying;

    // Determine if profitable and calculate percentage change
    const isProfitable = totalYield >= 0;
    const percentageChange =
      totalMoneySpentBuying > 0
        ? ((totalYield / totalMoneySpentBuying) * 100).toFixed(2)
        : '0';

    return {
      totalYield: totalYield.toFixed(2),
      totalMoneySpentBuying: totalMoneySpentBuying.toFixed(2),
      totalMoneyForSelling: totalMoneyForSelling.toFixed(2),
      interestValue: interestValue.toFixed(2),
      isProfitable,
      percentageChange
    };
  };

  const isValidDate = (days: number) => {
    if (!selectedBond) return false;
    const tradedDate = new Date(selectedBond.TradedDate);
    const refundDate = new Date(selectedBond.RefundDate);
    const maxDays = Math.ceil(
      (refundDate.getTime() - tradedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days <= maxDays && days > 0;
  };

  const maxDays = selectedBond
    ? Math.ceil(
        (new Date(selectedBond.RefundDate).getTime() -
          new Date(selectedBond.TradedDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const formatCurrency = (value: number | '') => {
    if (value === '') return '';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: selectedBond?.Isdollar === 'доллар' ? 'USD' : 'MNT'
    });
  };
  const t = useTranslations('Controls.yield');
  return (
    <Tabs defaultValue="buy" className="">
      <TabsList className="grid w-full grid-cols-2 md:inline-block md:w-auto">
        <TabsTrigger value="buy">{t('buy')}</TabsTrigger>
        <TabsTrigger value="sell">{t('sell')}</TabsTrigger>
      </TabsList>
      <TabsContent value="buy">
        <div className=" " tabIndex={0}>
          {selectedBond && (
            <div className="text-center ">
              <div className="mx-3 mb-5 flex h-5 items-center justify-center space-x-4 py-8 text-xs sm:py-5 md:py-3 md:text-sm lg:py-2">
                <div className="">
                  {t('yearlyInterest')}: {selectedBond.Interest}
                </div>
                <Separator orientation="vertical" />
                <div className="">
                  {t('nominalValue')}:{' '}
                  {formatCurrency(selectedBond.NominalValue)}
                </div>
                <Separator orientation="vertical" />
                <div className="">
                  {t('refundDate')}: {selectedBond.RefundDate}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bond" className="text-right">
                  {t('bond')}
                </Label>
                <Select
                  onValueChange={(value) => handleBondSelect(Number(value))}
                  defaultValue={bonds[0]?.pkId.toString() || ''}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('bondselect')} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-48 overflow-y-auto md:max-h-64">
                      {bonds.map((bond) => (
                        <SelectItem
                          key={bond.pkId}
                          value={bond.pkId.toString()}
                        >
                          {bond.BondenName}{' '}
                          <span className="text-xs italic text-muted-foreground">
                            ({bond.Interest})
                          </span>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedBond && (
                <>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        {t('Value')}
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="price"
                          type="text" // Change type to text for formatted input
                          value={
                            price !== ''
                              ? Number(price).toLocaleString('en-US')
                              : '' // Format for display
                          }
                          onChange={(e) => {
                            // Remove formatting and sanitize input
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = parseInt(rawValue, 10);

                            if (!isNaN(numericValue) && numericValue >= 0) {
                              setPrice(numericValue); // Store as number
                            } else {
                              setPrice(''); // Reset if invalid
                            }
                          }}
                          placeholder={t('ValuePlaceholder')}
                        />
                        <label className="w-2 text-right">
                          {selectedBond?.Isdollar === 'доллар' ? '$' : '₮'}
                        </label>
                      </div>
                    </div>

                    {selectedOption === 'default' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          {t('buydate')}
                        </Label>
                        <div className="col-span-3">
                          <Popover modal>
                            <PopoverTrigger asChild>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !selectedDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {selectedDate ? (
                                  format(new Date(selectedDate), 'yyyy-MM-dd')
                                ) : (
                                  <span> {t('boughtdateplaceholder')}</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={new Date(selectedDate)}
                                disabled={(date) => {
                                  if (!selectedBond) return false;
                                  const tradedDate = new Date(
                                    selectedBond.TradedDate
                                  );
                                  const refundDate = new Date(
                                    selectedBond.RefundDate
                                  );
                                  return date < tradedDate || date > refundDate;
                                }}
                                onSelect={(date) => {
                                  if (date) {
                                    setSelectedDate(format(date, 'yyyy-MM-dd'));
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}

                    {selectedOption === 'comfortable' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="days" className="text-right capitalize">
                          {t('day')}
                        </Label>
                        <Input
                          id="days"
                          type="number"
                          value={days}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setDays(!isNaN(value) && value >= 0 ? value : '');
                          }}
                          className="col-span-3"
                          placeholder={`${t('Day')} (Max: ${maxDays})`}
                        />
                      </div>
                    )}
                    {!isValidDate(Number(days)) &&
                      selectedOption === 'comfortable' &&
                      days !== '' && (
                        <div className="text-right text-sm text-red-500">
                          {t('daysLimit')} (Max: {maxDays} {t('day')})
                        </div>
                      )}
                    <RadioGroup
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                      className="md:ml-16 lg:ml-20"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">{t('bydate')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">{t('bydays')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>

            <div className="">
              <div className="group flex w-full items-center space-x-4 rounded-md border bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
                <Calculator className="transition-colors duration-300 group-hover:text-green-700" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t('yield')}:{' '}
                    {price &&
                    (selectedOption === 'default' ||
                      (selectedOption === 'comfortable' &&
                        isValidDate(Number(days)))) ? (
                      <>
                        {`${Number(calculateYield()).toLocaleString('en-US')} ${
                          selectedBond?.Isdollar === 'доллар' ? '$' : '₮'
                        }`}
                        <span className="ml-1 inline-flex text-xs italic  text-green-400">
                          {' '}
                          (
                          {((Number(calculateYield()) / price) * 100).toFixed(
                            2
                          )}
                          %)
                          <ArrowUpRight className=" size-4" />
                        </span>
                      </>
                    ) : (
                      '-'
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {/* Display notification text based on selected option */}
                    {selectedOption === 'default' && selectedBond ? (
                      <>
                        {format(new Date(selectedDate), 'yyyy-MM-dd')} -{' '}
                        {format(
                          new Date(selectedBond.RefundDate),
                          'yyyy-MM-dd'
                        )}{' '}
                        (
                        {Math.ceil(
                          (new Date(selectedBond.RefundDate).getTime() -
                            new Date(selectedDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        {t('days')})
                      </>
                    ) : selectedOption === 'comfortable' && days ? (
                      `${days} ${t('days')}`
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="sell">
        <div className=" " tabIndex={0}>
          {selectedBond && (
            <div className="text-center ">
              <div className="mx-3 mb-5 flex h-5 items-center justify-center space-x-4 py-8 text-xs sm:py-5 md:py-3 md:text-sm lg:py-2">
                <div className="">
                  {t('yearlyInterest')}: {selectedBond.Interest}
                </div>
                <Separator orientation="vertical" />
                <div className="">
                  {t('nominalValue')}:{' '}
                  {formatCurrency(selectedBond.NominalValue)}
                </div>
                <Separator orientation="vertical" />
                <div className="">
                  {t('refundDate')}: {selectedBond.RefundDate}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bond" className="text-right">
                  {t('bond')}
                </Label>
                <Select
                  onValueChange={(value) => handleBondSelect(Number(value))}
                  defaultValue={bonds[0]?.pkId.toString() || ''}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('bondselect')} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-48 overflow-y-auto md:max-h-64">
                      {bonds.map((bond) => (
                        <SelectItem
                          key={bond.pkId}
                          value={bond.pkId.toString()}
                        >
                          {bond.BondenName}{' '}
                          <span className="text-xs italic text-muted-foreground">
                            ({bond.Interest})
                          </span>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedBond && (
                <>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellBoughtQty" className="text-right">
                        {t('qty')}
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="sellBoughtQty"
                          type="text" // Change type to text for formatted input
                          value={
                            sellBoughtQty !== ''
                              ? Number(sellBoughtQty).toLocaleString('en-US')
                              : '' // Format for display
                          }
                          onChange={(e) => {
                            // Remove formatting and sanitize input
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = parseInt(rawValue, 10);

                            if (!isNaN(numericValue) && numericValue >= 0) {
                              setSellBoughtQty(numericValue); // Store as number
                            } else {
                              setSellBoughtQty(''); // Reset if invalid
                            }
                          }}
                          placeholder={t('qtysellplaceholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellBoughtPrice" className="text-right">
                        {t('buyprice')}
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="sellBoughtPrice"
                          type="text" // Change type to text for formatted input
                          value={
                            sellBoughtPrice !== ''
                              ? Number(sellBoughtPrice).toLocaleString('en-US')
                              : '' // Format for display
                          }
                          onChange={(e) => {
                            // Remove formatting and sanitize input
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = parseInt(rawValue, 10);

                            if (!isNaN(numericValue) && numericValue >= 0) {
                              setSellBoughtPrice(numericValue); // Store as number
                            } else {
                              setSellBoughtPrice(''); // Reset if invalid
                            }
                          }}
                          placeholder={t('sellpriceplaceholder')}
                        />
                        <label className="w-2 text-right">
                          {selectedBond?.Isdollar === 'доллар' ? '$' : '₮'}
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        {t('sellprice')}
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="sellSellPrice"
                          type="text" // Change type to text for formatted input
                          value={
                            sellSellPrice !== ''
                              ? Number(sellSellPrice).toLocaleString('en-US')
                              : '' // Format for display
                          }
                          onChange={(e) => {
                            // Remove formatting and sanitize input
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = parseInt(rawValue, 10);

                            if (!isNaN(numericValue) && numericValue >= 0) {
                              setSellSellPrice(numericValue); // Store as number
                            } else {
                              setSellSellPrice(''); // Reset if invalid
                            }
                          }}
                          placeholder={t('sellpriceplaceholder')}
                        />
                        <label className="w-2 text-right">
                          {selectedBond?.Isdollar === 'доллар' ? '$' : '₮'}
                        </label>
                      </div>
                    </div>

                    {selectedOption === 'default' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                            {t('boughtdate')}
                          </Label>
                          <div className="col-span-3">
                            <Popover modal>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !selectedBoughtDate &&
                                      'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 size-4" />
                                  {selectedBoughtDate ? (
                                    format(
                                      new Date(selectedBoughtDate),
                                      'yyyy-MM-dd'
                                    )
                                  ) : (
                                    <span>{t('boughtdateplaceholder')}</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  disabled={(date) => {
                                    if (!selectedBond) return false;
                                    const tradedDate = new Date(
                                      selectedBond.TradedDate
                                    );
                                    const refundDate = new Date(
                                      selectedBond.RefundDate
                                    );
                                    return (
                                      date < tradedDate || date > refundDate
                                    );
                                  }}
                                  onSelect={(date) => {
                                    if (date) {
                                      setselectedBoughtDate(
                                        format(date, 'yyyy-MM-dd')
                                      );
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                            {t('selldate')}
                          </Label>
                          <div className="col-span-3">
                            <Popover modal>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !selectedDate && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 size-4" />
                                  {selectedWillSellDate ? (
                                    format(
                                      new Date(selectedWillSellDate),
                                      'yyyy-MM-dd'
                                    )
                                  ) : (
                                    <span>{t('boughtdateplaceholder')}</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={new Date(selectedWillSellDate)}
                                  disabled={(date) => {
                                    if (!selectedBond) return false;
                                    const tradedDate = new Date(
                                      selectedBond.TradedDate
                                    );
                                    const refundDate = new Date(
                                      selectedBond.RefundDate
                                    );
                                    return (
                                      date < tradedDate || date > refundDate
                                    );
                                  }}
                                  onSelect={(date) => {
                                    if (date) {
                                      setSelectedWillSellDate(
                                        format(date, 'yyyy-MM-dd')
                                      );
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedOption === 'comfortable' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="days" className="text-right">
                          {t('Day')}
                        </Label>
                        <Input
                          id="days"
                          type="number"
                          value={sellDays}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setSellDays(
                              !isNaN(value) && value >= 0 ? value : ''
                            );
                          }}
                          className="col-span-3"
                          placeholder={`Өдөр (Max: ${maxDays})`}
                        />
                      </div>
                    )}
                    {!isValidDate(Number(sellDays)) &&
                      selectedOption === 'comfortable' &&
                      sellDays !== '' && (
                        <div className="text-right text-sm text-red-500">
                          {t('daysLimit')} (Max: {maxDays} {t('day')})
                        </div>
                      )}
                    <RadioGroup
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                      className="md:ml-16 lg:ml-20"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">{t('bydate')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">{t('bydays')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>

            <div className="">
              <div className="group flex w-full items-center space-x-4 rounded-md border bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
                <Calculator className="transition-colors duration-300 group-hover:text-green-700" />
                <div className="flex-1 space-y-1">
                  <p className="flex text-sm font-medium leading-none">
                    {t('yield')}:
                    {sellSellPrice &&
                    sellBoughtPrice &&
                    sellBoughtQty &&
                    ((selectedOption === 'default' && selectedBoughtDate) ||
                      (selectedOption === 'comfortable' &&
                        isValidDate(Number(sellDays)))) ? (
                      <span
                        className={`${
                          calculateSellYield().isProfitable
                            ? 'text-green-400'
                            : 'text-destructive'
                        } ml-2 flex`}
                      >
                        {Number(calculateSellYield().totalYield).toLocaleString(
                          'en-US'
                        )}{' '}
                        {selectedBond?.Isdollar === 'доллар' ? '$' : '₮'}
                        <span className="flex">
                          <span className="ml-4 text-xs italic">
                            (
                            {Number(
                              calculateSellYield().percentageChange
                            ).toLocaleString('en-Us')}
                            %)
                          </span>
                          <div>
                            {calculateSellYield().isProfitable ? (
                              <ArrowUpRight className="size-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="size-3 text-destructive" />
                            )}
                          </div>
                        </span>
                      </span>
                    ) : (
                      '-'
                    )}{' '}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {/* Display notification text based on selected option */}
                    {selectedOption === 'default' && selectedBond ? (
                      <>
                        {selectedBoughtDate
                          ? format(new Date(selectedBoughtDate), 'yyyy-MM-dd')
                          : 'X'}{' '}
                        - {format(new Date(selectedWillSellDate), 'yyyy-MM-dd')}{' '}
                        (
                        {selectedBoughtDate
                          ? Math.ceil(
                              (new Date(selectedWillSellDate).getTime() -
                                new Date(selectedBoughtDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 'X'}{' '}
                        {t('days')})
                      </>
                    ) : selectedOption === 'comfortable' && sellDays ? (
                      `${sellDays} ${t('days')}`
                    ) : null}
                  </p>
                </div>
                <div></div>
              </div>
              {(sellSellPrice &&
                sellBoughtPrice &&
                sellBoughtQty &&
                isValidDate(Number(sellDays))) ||
              (selectedBoughtDate && selectedWillSellDate) ? (
                <Card className="mt-2">
                  <CardHeader>
                    <CardTitle> {t('details')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="">
                      <p className="text-sm font-light leading-none">
                        {t('boughtprice')}:{' '}
                        {sellSellPrice &&
                        sellBoughtPrice &&
                        sellBoughtQty &&
                        selectedBoughtDate &&
                        ((selectedOption === 'default' && selectedBoughtDate) ||
                          (selectedOption === 'comfortable' &&
                            isValidDate(Number(sellDays))))
                          ? `${Number(
                              calculateSellYield().totalMoneySpentBuying
                            ).toLocaleString('en-US')} ${
                              selectedBond?.Isdollar === 'доллар' ? '$' : '₮'
                            }`
                          : '-'}{' '}
                      </p>
                      <p className="text-sm font-light leading-none">
                        {t('interestValue')}:{' '}
                        {sellSellPrice &&
                        sellBoughtPrice &&
                        sellBoughtQty &&
                        (selectedOption === 'default' ||
                          (selectedOption === 'comfortable' &&
                            isValidDate(Number(sellDays))))
                          ? `${Number(
                              calculateSellYield().interestValue
                            ).toLocaleString('en-US')} ${
                              selectedBond?.Isdollar === 'доллар' ? '$' : '₮'
                            }`
                          : '-'}{' '}
                      </p>
                      <p className="text-sm font-light leading-none">
                        {t('totalsellprice')}:{' '}
                        {sellSellPrice &&
                        sellBoughtPrice &&
                        sellBoughtQty &&
                        (selectedOption === 'default' ||
                          (selectedOption === 'comfortable' &&
                            isValidDate(Number(sellDays))))
                          ? `${Number(
                              calculateSellYield().totalMoneyForSelling
                            ).toLocaleString('en-US')} ${
                              selectedBond?.Isdollar === 'доллар' ? '$' : '₮'
                            }`
                          : '-'}{' '}
                      </p>
                      <p className="text-sm font-light leading-none">
                        {t('yield')}:{' '}
                        {sellSellPrice &&
                        sellBoughtPrice &&
                        sellBoughtQty &&
                        (selectedOption === 'default' ||
                          (selectedOption === 'comfortable' &&
                            isValidDate(Number(sellDays))))
                          ? `${Number(
                              calculateSellYield().totalMoneyForSelling
                            ).toLocaleString('en-US')} + ${Number(
                              calculateSellYield().interestValue
                            ).toLocaleString('en-US')} - ${Number(
                              calculateSellYield().totalMoneySpentBuying
                            ).toLocaleString('en-US')} = ${Number(
                              calculateSellYield().totalYield
                            ).toLocaleString('en-US')} ${
                              selectedBond?.Isdollar === 'доллар' ? '$' : '₮'
                            }`
                          : '-'}{' '}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
