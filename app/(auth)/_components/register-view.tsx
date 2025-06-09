import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from './login-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RegisterForm from './register-auth-form';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/Controls/LocaleSwitcher';
import { Card } from '@/components/ui/card';
export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function RegisterView() {
  const t = useTranslations('Controls.AUTH');
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password below <br />
          to log into your account
        </p>
      </div>
      {/* <UserAuthForm /> */}
      <RegisterForm />
    </Card>
    // <div className="relative h-screen flex-col items-center justify-center">
    //   <div className="flex h-full items-center p-4  lg:p-8">
    //     <div className="mx-auto flex w-full flex-col justify-center space-y-6 rounded-[30px] bg-accent p-4 py-8 sm:w-[550px] sm:p-16">
    //       <div className="flex flex-col space-y-2 text-center">
    //         <div className="flex justify-end">
    //           <LocaleSwitcher />
    //         </div>
    //         <h1 className="text-2xl font-semibold tracking-tight">
    //           {t('register')}
    //         </h1>
    //       </div>
    //       <RegisterForm />
    //     </div>
    //   </div>
    // </div>
  );
}
