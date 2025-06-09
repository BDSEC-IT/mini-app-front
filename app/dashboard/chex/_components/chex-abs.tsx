'use server';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import SearchSelectInput from '@/components/pagination/SearchSelectInput';
import { Separator } from '@/components/ui/separator';
import { CHEXSecurity } from './ubx-overview-table';
import Image from 'next/image';
import { searchParamsCache } from '@/lib/searchparams';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';

// Utility to format numbers with commas
function formatBigNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export async function CHEXSecurityDescription({
  data
}: {
  data: CHEXSecurity[];
}) {
  const page = searchParamsCache.get('SYMBOL') || 'BIDD';
  const currentSecurity: CHEXSecurity | undefined = data.find(
    (security) => security.symbol === page
  );

  if (!currentSecurity) {
    return <div>Not found</div>;
  }
  const t = await getTranslations('mseBondTable');
  return (
    <Card className="w-full max-w-full overflow-x-auto lg:w-[600px]">
      <CardHeader>
        <CardTitle>{t('chexABS.securityDetails')}</CardTitle>
        <CardDescription>{t('chexABS.securityDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <div className="flex items-center space-x-4">
            <Image
              src={currentSecurity.icon}
              alt={`${currentSecurity.name} icon`}
              width={100}
              height={100}
            />
            <div>
              <p className="text-lg font-medium">{currentSecurity.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('chexABS.symbol')}: {currentSecurity.symbol}
              </p>
            </div>
          </div>
          <Separator />

          {/* Visible only on smaller screens */}
          <div className="block lg:hidden">
            <div className="mb-1 ml-2"> ХБҮЦ-ээ сонгоно уу</div>
            <SearchSelectInput
              placeholder="Симболоо сонгоно уу"
              defaultValue={page}
              className="flex-none"
              query="SYMBOL"
              options={[
                {
                  value: 'BIDD',
                  label: 'BIDD'
                },
                {
                  value: 'BGFP',
                  label: 'BGFP'
                }
              ]}
            />
          </div>

          <Table className="w-full">
            <TableBody>
              <TableRow>
                <TableCell>{t('chexABS.registeredAt')}</TableCell>
                <TableCell>
                  {currentSecurity.baseSecurity.registeredAt}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{t('chexABS.isin')}</TableCell>
                <TableCell>{currentSecurity.isin}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.currency')}</TableCell>
                <TableCell>{currentSecurity.currency}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.securityType')}</TableCell>
                <TableCell>
                  <Badge variant={'outline'}>
                    {currentSecurity.securityType}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.marketType')}</TableCell>
                <TableCell>
                  {' '}
                  <Badge variant={'outline'}>
                    {currentSecurity.securityMarketType}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.status')}</TableCell>
                <TableCell>
                  <Badge variant={'outline'}>
                    {currentSecurity.securityStatus}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chextable.interestFrequency')}</TableCell>
                <TableCell>
                  <Badge variant={'outline'}>
                    {currentSecurity.couponPeriod}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.outstandingShares')}</TableCell>
                <TableCell>
                  {formatBigNumber(currentSecurity.outstandingShares)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.issuedShares')}</TableCell>
                <TableCell>
                  {formatBigNumber(currentSecurity.issuedShares)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.bondRate')}</TableCell>
                <TableCell>{currentSecurity.bondRate}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.parValue')}</TableCell>
                <TableCell>
                  {formatBigNumber(currentSecurity.parValue)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.referencePrice')}</TableCell>
                <TableCell>
                  {formatBigNumber(currentSecurity.referencePrice)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('chexABS.maturityDate')}</TableCell>
                <TableCell>{currentSecurity.maturityDate}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Separator />

          <Accordion type="single" collapsible>
            <AccordionItem value="investmentPortfolio">
              <AccordionTrigger>
                {t('chexABS.investmentPortfolio')}
              </AccordionTrigger>
              <AccordionContent>
                <Table className="w-full">
                  <TableBody>
                    <TableRow>
                      <TableCell>{t('chexABS.portfolioType')}</TableCell>
                      <TableCell>
                        {currentSecurity.investmentPortfolio.type}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('chexABS.portfolioQuantity')}</TableCell>
                      <TableCell>
                        {formatBigNumber(
                          currentSecurity.investmentPortfolio.qty
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('chexABS.portfolioPrice')}</TableCell>
                      <TableCell>
                        MNT{' '}
                        {formatBigNumber(
                          currentSecurity.investmentPortfolio.price
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('chexABS.status')}</TableCell>
                      <TableCell>
                        <Badge variant={'outline'}>
                          {currentSecurity.investmentPortfolio.approved == true
                            ? `${t('chexABS.approved')}`
                            : `${t('chexABS.notapproved')}`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
