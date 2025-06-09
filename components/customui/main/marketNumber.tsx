import { Button } from '@/components/ui/button';
import MarketCard from './marketCards';
import Link from 'next/link';

const data1 = [
  { title: 'OTC', number: 134 },
  { title: 'CHEX', number: 231 }
];
const data2 = [
  { title: 'MSE', number: 12 },
  { title: 'UBX', number: 45 }
];

export default function MarketNumber() {
  return (
    <div className="i my-[40px] h-[80vh] place-content-center bg-accent sm:h-[80vh]  sm:py-0  ">
      <div className=" mx-[20px] md:mx-[100px] xl:mx-[10%] 2xl:mx-[20%]  ">
        <div className="pb-[60px] text-center text-4xl font-semibold">
          Бүртгэлтэй бондын биржүүд
        </div>

        <div className="flex   flex-wrap justify-around gap-y-[20px]">
          {data1.map((item, index) => (
            <MarketCard key={index} title={item.title} number={item.number} />
          ))}
        </div>
        <div className="mt-[20px] flex flex-wrap  justify-around gap-y-[20px] sm:mt-[5%]   ">
          {data2.map((item, index) => (
            <MarketCard key={index} title={item.title} number={item.number} />
          ))}
        </div>
      </div>
      <div className="mt-[70px] flex justify-center">
        {' '}
        <Button
          asChild
          className="w-[35%] min-w-[150px] text-[18px] sm:h-[60px]"
        >
          <Link href="/login">Хөрөнгө оруулах</Link>
        </Button>
      </div>
    </div>
  );
}
