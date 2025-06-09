import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function YieldCalculationResult() {
  return (
    <div>
      <div className=" h-[40vh] place-content-center rounded-[30px] border-[1px] border-solid border-slate-200">
        <div className="text-center text-2xl font-semibold">
          Татварыг тооцсон өгөөж{' '}
        </div>

        <div className="text-center text-[40px] font-semibold">
          134’798.123 ₮
        </div>
        <Link
          className="  mt-[5vh] flex translate-y-16 justify-center "
          href=""
        >
          <Button className="w-[70%] rounded-[10px] text-[20px]">
            Хөрөнгө оруулах
          </Button>
        </Link>
      </div>
    </div>
  );
}
