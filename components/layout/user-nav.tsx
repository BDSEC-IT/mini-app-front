'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import DefaultUserAvatar from '@/public/avatar-placeholder.png';
import { Session } from 'next-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Router } from 'lucide-react';
import { useTranslations } from 'next-intl';
export function UserNav() {
  const t = useTranslations('Controls');
  const { data: session, status } = useSession();
  const isMobile = useIsMobile();
  const router = useRouter();
  return (
    <div>
      {status === 'loading' && <Skeleton className="h-8 w-8 rounded-full" />}
      {status === 'authenticated' && <UserButton session={session} />}
      {status === 'unauthenticated' && (
        <Button
          onClick={() => router.push('/login')}
          variant={'outline'}
          size={isMobile ? 'sm' : 'default'}
        >
          {t('login')}
        </Button>
      )}
    </div>
  );
}
function UserButton({ session }: { session: Session }) {
  const t = useTranslations('Controls');
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://loremflickr.com/200/200?random=1`}
              // src={DefaultUserAvatar}
              // src={session.user?.image ?? '/public/avatar-placeholder.png'}
              alt={session.user?.name ?? 'zurag'}
            />
            <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            {t('Account')}

            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {t('billing')}
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          {t('logout')}

          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
