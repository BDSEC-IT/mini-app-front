import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import BondDetailsViewPage from '../_components/bond-details-view-page';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import { OTCBond } from '../_components/otcbond-primarytable-card';
// import ProductViewPage from '../_components/product-view-page';
type PageProps = { params: { bondId: string } };
interface Bond {
  id: number;
  name: string;
}

interface BondDetails {
  bond: Bond;
}
export async function generateMetadata({ params }: PageProps) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/otc/real/detail/${params.bondId}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const jsonResponse = await response.json();

  const data: BondDetails = jsonResponse.data;
  console.log(data);
  const title = data.bond.name || t('OTCPage');
  return {
    title: title,
    description:
      'Манай вэбсайт нь Монголын бондын зах зээл, хөрөнгөөр баталгаажсан үнэт цаас, хөрөнгө оруулалтын боломж, Монголын эдийн засгийн талаарх хамгийн сүүлийн үеийн мэдээлэл, мэдээ, шинжилгээний эх сурвалж юм.'
  };
}

export default function Page({ params }: PageProps) {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          {/* <ProductViewPage bondId={params.bondId} /> */}
          <BondDetailsViewPage bondId={params.bondId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
