export interface Project {
  id: string;
  name: string;
  budget: number;
  actualCost: number;
  revenue: number;
  cogs: number;
  status: 'On Track' | 'At Risk' | 'Underperform';
}

export interface MonthlyData {
  id: string;
  month: string;
  year: number;
  revenue: number;
  opex: number;
  cogs: number;
}

export interface SurveyData {
  id: string;
  date: string;
  csat: number;
  esat: number;
}

export type LeadStage = 'gathering_requirement' | 'prototype' | 'proposal' | 'negotiation' | 'review' | 'won' | 'lost';
export type LeadSource = 'referral' | 'website' | 'cold_call' | 'event' | 'social_media' | 'other';

export interface Lead {
  id: string;
  companyName: string;
  projectName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  estimatedValue: number;
  probability: number;
  stage: LeadStage;
  source: LeadSource;
  proposalDate?: string;
  expectedCloseDate?: string;
  closedDate?: string;
  lossReason?: string;
  lossDetails?: string;
  winFactors?: string;
  competitor?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  previousStage?: string;
  newStage: string;
  changedBy: string;
  notes?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  position?: string;
  squad?: string;
  supervisor?: string;
  employmentStatus?: 'Permanent' | 'Contract' | 'Freelance' | 'Vendor';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyTask {
  id: string;
  teamMemberId: string;
  taskDate: string;
  taskName: string;
  projectId?: string;
  duration: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectTeamAllocation {
  id: string;
  projectId?: string;
  teamMemberId: string;
  month: string;
  allocationPercentage: number;
  roleInProject?: string;
  costType?: 'hpp' | 'opex';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberEsat {
  id: string;
  teamMemberId: string;
  month: string;
  esatScore: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectRevenue {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt?: string;
}

export const LEAD_STAGES: { value: LeadStage; label: string; color: string }[] = [
  { value: 'gathering_requirement', label: 'Gathering Requirement', color: 'bg-slate-500' },
  { value: 'prototype', label: 'Prototype', color: 'bg-indigo-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-blue-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
  { value: 'review', label: 'Review', color: 'bg-purple-500' },
  { value: 'won', label: 'Won', color: 'bg-success' },
  { value: 'lost', label: 'Lost', color: 'bg-destructive' },
];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'event', label: 'Event' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

export const LOSS_REASONS = [
  'Harga terlalu tinggi',
  'Fitur tidak sesuai',
  'Kalah dari kompetitor',
  'Budget klien terbatas',
  'Timeline tidak sesuai',
  'Klien memilih vendor lain',
  'Proyek dibatalkan',
  'Lainnya',
];

export const initialProjects: Project[] = [
  { id: '1', name: 'Enterprise CRM Platform', budget: 850000000, actualCost: 720000000, revenue: 1200000000, cogs: 480000000, status: 'On Track' },
  { id: '2', name: 'Mobile Banking App', budget: 650000000, actualCost: 680000000, revenue: 890000000, cogs: 390000000, status: 'At Risk' },
  { id: '3', name: 'E-Commerce Redesign', budget: 420000000, actualCost: 580000000, revenue: 520000000, cogs: 310000000, status: 'Underperform' },
  { id: '4', name: 'Data Analytics Dashboard', budget: 380000000, actualCost: 340000000, revenue: 680000000, cogs: 220000000, status: 'On Track' },
  { id: '5', name: 'Cloud Migration Project', budget: 920000000, actualCost: 850000000, revenue: 1450000000, cogs: 580000000, status: 'On Track' },
  { id: '6', name: 'HR Management System', budget: 280000000, actualCost: 295000000, revenue: 380000000, cogs: 180000000, status: 'At Risk' },
];

export const initialMonthlyData: MonthlyData[] = [
  { id: '1', month: 'Jul', year: 2024, revenue: 4200000000, opex: 1850000000, cogs: 1680000000 },
  { id: '2', month: 'Aug', year: 2024, revenue: 4580000000, opex: 1920000000, cogs: 1830000000 },
  { id: '3', month: 'Sep', year: 2024, revenue: 4890000000, opex: 1980000000, cogs: 1950000000 },
  { id: '4', month: 'Oct', year: 2024, revenue: 5120000000, opex: 2050000000, cogs: 2050000000 },
  { id: '5', month: 'Nov', year: 2024, revenue: 5380000000, opex: 2120000000, cogs: 2150000000 },
  { id: '6', month: 'Dec', year: 2024, revenue: 5850000000, opex: 2280000000, cogs: 2340000000 },
];

export const initialSurveyData: SurveyData[] = [
  { id: '1', date: '2024-07-15', csat: 82, esat: 78 },
  { id: '2', date: '2024-08-15', csat: 84, esat: 80 },
  { id: '3', date: '2024-09-15', csat: 86, esat: 79 },
  { id: '4', date: '2024-10-15', csat: 85, esat: 82 },
  { id: '5', date: '2024-11-15', csat: 88, esat: 84 },
  { id: '6', date: '2024-12-15', csat: 87, esat: 85 },
];

export const initialLeads: Lead[] = [
  {
    id: '1',
    companyName: 'PT Bank Nusantara',
    projectName: 'Core Banking System',
    contactPerson: 'Budi Santoso',
    contactEmail: 'budi@banknusantara.co.id',
    contactPhone: '081234567890',
    estimatedValue: 2500000000,
    probability: 75,
    stage: 'negotiation',
    source: 'referral',
    proposalDate: '2024-11-01',
    expectedCloseDate: '2025-02-01',
  },
  {
    id: '2',
    companyName: 'PT Retail Indonesia',
    projectName: 'E-Commerce Platform',
    contactPerson: 'Siti Rahayu',
    contactEmail: 'siti@retailindo.com',
    estimatedValue: 850000000,
    probability: 60,
    stage: 'proposal',
    source: 'website',
    proposalDate: '2024-12-01',
    expectedCloseDate: '2025-03-15',
  },
  {
    id: '3',
    companyName: 'PT Logistik Cepat',
    projectName: 'Fleet Management System',
    contactPerson: 'Agus Wijaya',
    contactEmail: 'agus@logistikcepat.id',
    estimatedValue: 1200000000,
    probability: 90,
    stage: 'review',
    source: 'event',
    proposalDate: '2024-10-15',
    expectedCloseDate: '2025-01-15',
  },
  {
    id: '4',
    companyName: 'PT Asuransi Mandiri',
    projectName: 'Claims Portal',
    contactPerson: 'Diana Putri',
    estimatedValue: 680000000,
    probability: 100,
    stage: 'won',
    source: 'cold_call',
    proposalDate: '2024-09-01',
    closedDate: '2024-12-01',
    winFactors: 'Harga kompetitif, referensi proyek sebelumnya bagus',
  },
  {
    id: '5',
    companyName: 'PT Manufaktur Jaya',
    projectName: 'ERP Implementation',
    contactPerson: 'Rudi Hermawan',
    estimatedValue: 3200000000,
    probability: 0,
    stage: 'lost',
    source: 'referral',
    proposalDate: '2024-08-01',
    closedDate: '2024-11-15',
    lossReason: 'Kalah dari kompetitor',
    lossDetails: 'Klien memilih vendor dengan pengalaman ERP lebih lama',
    competitor: 'SAP Partner Indonesia',
  },
];

export const initialTeamMembers: TeamMember[] = [
  { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@company.com', position: 'Project Manager', isActive: true },
  { id: '2', name: 'Sari Dewi', email: 'sari@company.com', position: 'Lead Developer', isActive: true },
  { id: '3', name: 'Budi Santoso', email: 'budi@company.com', position: 'Business Analyst', isActive: true },
  { id: '4', name: 'Rina Kusuma', email: 'rina@company.com', position: 'UI/UX Designer', isActive: true },
  { id: '5', name: 'Dedi Pratama', email: 'dedi@company.com', position: 'Backend Developer', isActive: true },
  { id: '6', name: 'Maya Putri', email: 'maya@company.com', position: 'QA Engineer', isActive: true },
];

export const TARGET_REVENUE = 6000000000;

export const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export const formatFullCurrency = (value: number): string => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

// ESAT Survey Types
export type ESATSurveyStatus = 'draft' | 'active' | 'closed';
export type ESATCategory = 'scope' | 'workload' | 'collaboration' | 'process' | 'pm_direction' | 'open_ended';

export interface ESATSurvey {
  id: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  status: ESATSurveyStatus;
  accessToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ESATResponse {
  id: string;
  surveyId: string;
  respondentName: string;
  respondentPosition: string | null;
  respondentSquad: string | null;
  submittedAt: string | null;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ESATAnswer {
  id: string;
  responseId: string;
  questionCode: string;
  category: ESATCategory;
  answerValue: number | null;
  answerText: string | null;
  createdAt: string;
}

export interface ESATQuestion {
  code: string;
  category: ESATCategory;
  text: string;
  type: 'likert' | 'text';
}

