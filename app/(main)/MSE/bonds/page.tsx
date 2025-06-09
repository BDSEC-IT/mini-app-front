import { fetcher } from '@/lib/clientFetcher';
import { Bond, columns } from './columns';
import { DataTable } from './data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
export default async function DemoPage() {
  const bonds = (await fetcher<{ data: Bond[] }>(`/bonds/getmsebonds`)).data;

  return (
    <div className="container  mx-auto py-10">
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>Бондын мэдээлэл</CardTitle>
        </CardHeader>
        <CardDescription className="mx-4 mb-4">
          Монголын хөрөнгийн биржийн бондын мэдээлэл
        </CardDescription>
        <CardContent>
          {/* <p>This content is that takes full available space</p> */}
          <DataTable columns={columns} data={bonds} />
        </CardContent>
      </Card>
    </div>
  );
}
