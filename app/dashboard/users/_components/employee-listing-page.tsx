import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/constants/data';
import { fakeUsers } from '@/constants/mock-api';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import EmployeeTable from './employee-tables';
import { fetcher } from '@/lib/clientFetcher';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';

type TEmployeeListingPage = {};
export interface User {
  id: number;
  email: string;
  emailVerified: string | null; // Nullable for unverified emails
  createdAt: string; // ISO 8601 date string
  modifiedAt: string; // ISO 8601 date string
  firstName: string;
  lastName: string;
  phone: string | null; // Nullable if no phone number is provided
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'; // Add other roles if applicable
}
export interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
export default async function EmployeeListingPage({}: TEmployeeListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('search');
  const role = searchParamsCache.get('role');
  const pageLimit = searchParamsCache.get('limit');

  const filters = {
    page: page.toString(),
    limit: pageLimit.toString(),
    ...(search && { search }),
    ...(role && { role })
  };
  // mock api call
  const TOKEN = await getToken();
  const queryParams = new URLSearchParams(filters).toString();
  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/getusers?${queryParams}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
  ).catch((err) => notFound());
  if (!userRes.ok) {
    const data = await userRes.json();
    notFound();
  }
  const data = await userRes.json();
  const users: User[] = data.data;
  const pagination: PaginationData = data.pagination;

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Харилцагч (${pagination.total})`}
            description="Харилцагчийн менежмент хуудас "
          />

          <Link
            href={'/dashboard/employee/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />
        <EmployeeTable data={users} totalData={pagination.total} />
      </div>
    </PageContainer>
  );
}
