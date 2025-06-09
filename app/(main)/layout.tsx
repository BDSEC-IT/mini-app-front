// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
import Navbar from '@/components/Controls/NavBar';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-[20px]">
      {/* <Navbar /> */}
      <section> {children}</section>
    </div>
  );
}
