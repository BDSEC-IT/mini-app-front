import { ContactForm } from '@/components/Controls/ContactForm';
import { getUserLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
export async function generateMetadata() {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('HomePage'),
    description:
      'Манай вэбсайт нь Монголын бондын зах зээл, хөрөнгөөр баталгаажсан үнэт цаас, хөрөнгө оруулалтын боломж, Монголын эдийн засгийн талаарх хамгийн сүүлийн үеийн мэдээлэл, мэдээ, шинжилгээний эх сурвалж юм.'
  };
}
export default async function ContactPage() {
  return (
    <div>
      <ContactForm />
    </div>
  );
}
