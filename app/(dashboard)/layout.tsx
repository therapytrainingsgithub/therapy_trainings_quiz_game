'use client';

import Link from 'next/link'
import { BreadcrumbProvider, useBreadcrumb } from '@/lib/breadcrumbContext';

import React from 'react';

function DashboardLayout({ children }: { children: React.ReactNode }) {


  return (
      <BreadcrumbProvider>
        <main className="flex min-h-screen w-full flex-col justify-between bg-[#F5F5F5]">
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
            </header>
            <main className="h-full  grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
              {children}
            </main>
          </div>
          <div className="w-full bg-[#709D50] text-white py-4 text-center " style={{ overflowX: 'hidden' }}>
        <p className="text-sm">© 2024 Therapy Trainings. All rights reserved.</p>
      </div>

        </main>
      </BreadcrumbProvider>
  );
}

export default DashboardLayout;