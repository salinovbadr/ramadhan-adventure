import { useState } from 'react';
import { RevenueOpexForm } from '@/components/admin/RevenueOpexForm';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { DataTable } from '@/components/admin/DataTable';
import { LeadPipeline } from '@/components/admin/LeadPipeline';
import { TeamManagement } from '@/components/admin/TeamManagement';
import { ProjectTeamAllocation } from '@/components/admin/ProjectTeamAllocation';
import { CsatEntry } from '@/components/admin/CsatEntry';
import { ESATManagement } from '@/components/admin/ESATManagement';
import { LoadManagement } from '@/components/admin/LoadManagement';
import { TeamFinancial } from '@/components/admin/TeamFinancial';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, FolderKanban, TrendingUp, Smile, Star, CalendarDays, DollarSign } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Kelola data dan konfigurasi proyek</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Proyek</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tim</span>
          </TabsTrigger>
          <TabsTrigger value="load" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Load</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Finansial</span>
          </TabsTrigger>
          <TabsTrigger value="csat" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">CSAT</span>
          </TabsTrigger>
          <TabsTrigger value="esat" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            <span className="hidden sm:inline">ESAT</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <LeadPipeline />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectManagement onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamManagement onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="load" className="space-y-6">
          <ProjectTeamAllocation onNavigate={setActiveTab} />
          <LoadManagement onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <TeamFinancial />
        </TabsContent>

        <TabsContent value="csat" className="space-y-6">
          <CsatEntry />
        </TabsContent>

        <TabsContent value="esat" className="space-y-6">
          <ESATManagement />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueOpexForm />
          </div>
          <DataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
