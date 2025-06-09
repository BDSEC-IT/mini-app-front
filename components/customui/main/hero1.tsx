import { Search } from 'lucide-react';
import SearchField from '../SearchField';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function Hero1() {
  return (
    <div className="mt-[40px] h-[40vh] place-content-center items-center bg-accent  ">
      <div className="py-[20px] text-center text-[50px] text-primary  ">
        BONDMARKET.MN
      </div>
      <div className="text-center text-primary">
        Бондын нэгдсэн захиалгын систем
      </div>
      <div className="mt-[30px]   flex justify-center">
        <div className="w-[400px]">
          <SearchField />
        </div>
      </div>
      <div className="mt-[30px] flex justify-center">
        {' '}
        <Button asChild className="h-[30px] w-[180px] text-[18px]">
          <Link href="/login">Нэвтрэх</Link>
        </Button>
      </div>
    </div>
  );
}
