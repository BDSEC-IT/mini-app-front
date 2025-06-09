'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogIn,
  LogInIcon,
  LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { Session } from 'next-auth';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { NavItem } from '@/types';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
export const company = {
  name: 'БиДиСЕК ҮЦК',
  logo: GalleryVerticalEnd,
  plan: 'Демо арилжаа'
};

const filterNavItems = (items: NavItem[], userRoles: string[]): NavItem[] => {
  return items
    .map((item) => {
      // If the item is locked, ensure it is always included, but it will be "disabled"
      const isLocked = item.locked ?? false;
      const isAccessible =
        !isLocked && item.roles?.some((role) => userRoles.includes(role));
      return {
        ...item,
        isAccessible, // Add a flag for accessibility
        items: item.items
          ? filterNavItems(item.items, userRoles) // Recursively add isAccessible to child items
          : []
      };
    })
    .filter((item) => item.isAccessible || item.locked); // Ensure locked items are not hidden
};

export default function AppSidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user.role;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Controls');
  const locale = useLocale();
  const isLoading = status === 'loading';
  const userRoles = isLoading
    ? [] // No roles while loading
    : session?.user.role
    ? [session.user.role, 'ALL'] // Include "all" for public items
    : ['ALL'];

  // Filter navigation items based on roles
  const filteredNavItems = filterNavItems(navItems, userRoles);
  const { state, isMobile, setOpen, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;
  const handleLinkClickOnMobile = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };
  // Show a placeholder or loading indicator while session is loading
  if (isLoading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-sidebar-primary-foreground dark:bg-sidebar-primary">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>
              <Skeleton className="h-4 w-24" />
            </SidebarGroupLabel>
            <SidebarMenu>
              <Skeleton className="my-2 h-10 w-full rounded-lg" />
              <Skeleton className="my-2 h-10 w-full rounded-lg" />
              <Skeleton className="my-2 h-10 w-full rounded-lg" />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {isCollapsed ? (
            <Skeleton className="size-8 " />
          ) : (
            <Skeleton className="mx-2 mb-3 h-8 " />
          )}
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    );
  }
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
          <div
            onClick={() => router.push('/dashboard/overview')}
            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-sidebar-primary-foreground hover:cursor-pointer dark:bg-sidebar-primary"
          >
            <Image
              alt={'logo'}
              src={'/dark.png'}
              width={40}
              height={40}
              className="size-8 rounded-lg"
            />
            {/* <company.logo className="size-4" /> */}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{t('BDSec')}</span>
            <span className="truncate text-xs">{t('bondmarket')}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items.length > 0 ? (
                <>
                  {!isCollapsed && item.groupLabel && (
                    <SidebarGroupLabel>{t(item.groupLabel)}</SidebarGroupLabel>
                  )}
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <DropdownMenu>
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger
                              disabled={!isCollapsed}
                              asChild
                            >
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton
                                    tooltip={t(item.title)}
                                    isActive={pathname === item.url}
                                  >
                                    {item.icon && <Icon />}
                                    <span>{t(item.title)}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {item.items?.map((subItem) => {
                                      const SubIcon = subItem.icon
                                        ? Icons[subItem.icon]
                                        : Icons.logo; // Add this line to pick the sub-item icon
                                      return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={pathname === subItem.url}
                                          >
                                            <Link
                                              href={subItem.url}
                                              onClick={handleLinkClickOnMobile}
                                            >
                                              <div className="flex w-full items-center  justify-between">
                                                <span>{t(subItem.title)} </span>
                                                {subItem.icon && (
                                                  <SubIcon className="size-4" />
                                                )}
                                              </div>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="start"
                            alignOffset={2}
                          >
                            {t(item.title)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenuContent
                        side="right"
                        sideOffset={25}
                        align="start"
                      >
                        <DropdownMenuLabel className="flex max-w-[190px] items-center gap-2 truncate">
                          {item.icon && <Icon className="size-4" />}
                          {t(item.title)}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.items.map((subItem) => {
                          const SubIcon = subItem.icon
                            ? Icons[subItem.icon]
                            : Icons.logo; // Add this line to pick the sub-item icon
                          return (
                            <DropdownMenuItem key={subItem.title} asChild>
                              <Link
                                className={`cursor-pointer ${
                                  pathname === subItem.url ? 'bg-secondary' : ''
                                }`}
                                onClick={handleLinkClickOnMobile}
                                href={subItem.url}
                              >
                                <p className="max-w-[180px] truncate">
                                  <div className="flex w-full items-center justify-between  gap-2">
                                    {subItem.icon && (
                                      <SubIcon className="size-4" />
                                    )}
                                    <span>{t(subItem.title)} </span>
                                  </div>
                                </p>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuArrow className="fill-border" />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Collapsible>
                </>
              ) : (
                <>
                  {!isCollapsed && item.groupLabel && (
                    <SidebarGroupLabel>{t(item.groupLabel)}</SidebarGroupLabel>
                  )}
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={t(item.title)}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url} onClick={handleLinkClickOnMobile}>
                        <Icon />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                    Удирдлага
                  </p> */}
                  {}
                </>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* {status === 'loading' && (
          <Skeleton className="mx-2 mb-3 h-8">
          </Skeleton>
        )} */}
        {status === 'authenticated' && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <company.logo className="size-4" />
            </div> */}
                      <AvatarImage
                        src={session?.user?.image || ''}
                        alt={session?.user?.name || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.email?.slice(0, 2)?.toUpperCase() ||
                          'N/A'}
                        {/* {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'} */}
                      </AvatarFallback>
                    </Avatar>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name || ''}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user?.email || ''}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={session?.user?.image || ''}
                          alt={session?.user?.name || ''}
                        />
                        <AvatarFallback className="rounded-lg">
                          {session?.user?.email?.slice(0, 2)?.toUpperCase() ||
                            'N/A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user?.name || ''}
                        </span>
                        <span className="truncate text-xs">
                          {' '}
                          {session?.user?.email || ''}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/profile')}
                    >
                      <BadgeCheck className="mr-1 size-5" />
                      {t('MyProfile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-1 size-5" />
                      {t('billing')}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-1 size-5" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        {status === 'unauthenticated' &&
          (isCollapsed ? (
            <div
              onClick={() => router.push('/login')}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-all duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <LogIn className="size-5" />
            </div>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              className="mx-2 mb-3 transition-all duration-300 ease-in-out"
              variant={'outline'}
            >
              {t('login')}
              <LogIn className="ml-3 size-4" />
            </Button>
          ))}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
