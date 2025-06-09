import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import LoadingButton from '@/components/customui/LoadingButton';
import SearchField from '@/components/customui/SearchField';
import Hero1 from '@/components/customui/main/hero1';
import Statistics from '@/components/customui/main/statistics';
import MarketNumber from '@/components/customui/main/marketNumber';
import YieldCalculation from '@/components/customui/main/yieldCalculation';
import { HeroSectionOne } from './Hero';

export default function HomePage() {
  const t = useTranslations('HomePage');
  return (
    <div>
      <HeroSectionOne />
    </div>
    //     <div>
    //       {/* <h1>{t("title")}</h1> */}
    //       {/* <Link href="/contact">{t("about")}</Link>
    //       <Button className="block my-4">Normal button</Button>
    //       <LoadingButton loading={true} variant={"destructive"}>
    //         Loading button
    //       </LoadingButton>
    //       <SearchField />
    // <br></br>
    //       <Link href="/main">{t("main")}</Link> */}

    //       <Hero1 />
    //       <Statistics />
    //       <MarketNumber />
    //       <YieldCalculation />
    //     </div>
  );
}
