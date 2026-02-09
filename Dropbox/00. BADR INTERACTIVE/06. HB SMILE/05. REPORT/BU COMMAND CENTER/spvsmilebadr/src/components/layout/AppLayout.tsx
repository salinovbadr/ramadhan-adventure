import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
            {/* SidebarTrigger removed as requested */}
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
