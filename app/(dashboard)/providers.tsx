'use client';

import { TooltipProvider } from '@/components/ui/tooltip';

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

export default Providers;
