import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MSEBond } from '../../mse/_components/mse-overview-table';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export async function LatestMseBonds({ data }: { data: MSEBond[] }) {
  const locale = await getLocale();
  const t = await getTranslations('overview');

  return (
    <div className="flex flex-col space-y-8">
      {data.map((bond) => (
        <div key={bond.Symbol} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-xs font-medium leading-none md:text-sm">
              {locale === 'mn' ? bond.BondmnName : bond.BondenName}{' '}
              <span className="text-xs italic text-muted-foreground md:text-sm">
                ({bond.TradedDate})
              </span>
            </p>
            <p className="text-xs text-muted-foreground md:text-sm">
              {locale === 'mn' ? bond.Issuer : bond.IssuerEn}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div>
              <div className="ml-auto text-end text-xs font-medium leading-none md:text-sm">
                {bond.Interest} {t('withRate')}
              </div>
              <div className="ml-auto text-end text-xs leading-5 text-muted-foreground md:text-sm">
                {t('RefundDate')} {bond.RefundDate}
              </div>
            </div>
            <Link
              href={bond.MoreInfo}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="ml-2 hover:text-blue-600" />
            </Link>
          </div>
        </div>
      ))}
      <Separator className="my-4" />

      <Link
        className="items-center text-center text-xs text-blue-700 md:text-sm"
        href={'/dashboard/mse'}
      >
        {t('details')}
      </Link>
    </div>
  );
}
