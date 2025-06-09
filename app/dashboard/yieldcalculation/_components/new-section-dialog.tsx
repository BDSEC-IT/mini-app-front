'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTaskStore } from '@/lib/store-yield';
import { useTranslations } from 'next-intl';

export default function NewSectionDialog() {
  const addCol = useTaskStore((state) => state.addCol);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { title } = Object.fromEntries(formData);

    if (typeof title !== 'string') return;
    addCol(title);
  };
  const t = useTranslations('Controls');
  const handleClick = () => {
    addCol('lala');
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="w-full">
          ＋ {t('addyield')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addyield')}</DialogTitle>
          <DialogDescription>{t('addyielddescription')}</DialogDescription>
        </DialogHeader>
        {/* <form
          id="todo-form"
          className="grid gap-4 py-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              name="title"
              placeholder={t('sectiontitle')}
              className="col-span-4"
            />
          </div>bug
        </form> */}
        <DialogFooter>
          <DialogTrigger asChild>
            <Button onClick={handleClick} size="sm" form="todo-form">
              {t('addnew')}
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
