import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
const locales = ['en', 'mn'];
export default function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <div className="flex items-center rounded-l border border-accent pl-1 ">
      <Globe className="m-0 size-3.5 text-muted-foreground  md:size-4" />

      <LocaleSwitcherSelect defaultValue={locale} label="Select a locale">
        {locales.map((cur) => (
          <option key={cur} value={cur}>
            {cur}
          </option>
        ))}
      </LocaleSwitcherSelect>
    </div>
  );
}
