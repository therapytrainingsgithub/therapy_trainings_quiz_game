'use client';

import Link from 'next/link';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  UsersRound,
  MessagesSquare
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import { NavItem } from './nav-item';
import { BreadcrumbProvider, useBreadcrumb } from '@/lib/breadcrumbContext';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { useEffect, useState } from 'react';

import React from 'react';
import { VercelLogo } from '@/components/icons';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  return (
    <Providers>
      <BreadcrumbProvider>
        <main className="flex min-h-screen w-full flex-col bg-[#F5F5F5]">
          {/* <DesktopNav /> */}
          <div className="flex flex-col ">
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-8 sm:static sm:h-auto sm:bg-white">
              <div className="flex items-center gap-6">
                <Link href="/">
                <img
                  src="/logo.png"
                  alt="Therapy Trainings Logo"
                  className="h-10 w-auto sm:h-16 py-2 select-none pointer-events-none" // Smaller size for mobile and larger for screens >= sm
                  draggable="false"
                  />
                  </Link>
              </div>
              <User />
            </header>
            <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
              {children}
            </main>
          </div>
          <Analytics />
        </main>
      </BreadcrumbProvider>
    </Providers>
  );
}

export default DashboardLayout;