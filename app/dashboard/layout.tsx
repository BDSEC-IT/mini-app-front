import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUserLocale } from '@/lib/locale';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
// export async function generateMetadata() {
//   const locale = await getUserLocale();
//   const t = await getTranslations({ locale, namespace: 'Metadata' });

//   return {
//     title: {
//       default: t('HomePage'),
//       template: `%s - ${t('HomePage')}`
//     },
//     description:
//       'Манай вэбсайт нь Монголын бондын зах зээл, хөрөнгөөр баталгаажсан үнэт цаас, хөрөнгө оруулалтын боломж, Монголын эдийн засгийн талаарх хамгийн сүүлийн үеийн мэдээлэл, мэдээ, шинжилгээний эх сурвалж юм.'
//   };
// }
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <div className="overflow-hidden">
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </div>
  );
}
