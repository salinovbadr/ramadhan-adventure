import { z } from 'zod';

// Lead validation schema
export const leadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  projectName: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  contactPerson: z.string().max(100, 'Contact person name too long').optional().nullable(),
  contactEmail: z.string().email('Invalid email format').max(100, 'Email too long').optional().nullable().or(z.literal('')),
  contactPhone: z.string().max(20, 'Phone number too long').optional().nullable(),
  estimatedValue: z.number().int('Must be a whole number').min(0, 'Value cannot be negative'),
  probability: z.number().int('Must be a whole number').min(0, 'Probability cannot be negative').max(100, 'Probability cannot exceed 100'),
  stage: z.enum(['gathering_requirement', 'prototype', 'proposal', 'negotiation', 'review', 'won', 'lost']),
  source: z.enum(['referral', 'website', 'cold_call', 'event', 'social_media', 'other']),
  proposalDate: z.string().optional().nullable(),
  expectedCloseDate: z.string().optional().nullable(),
  closedDate: z.string().optional().nullable(),
  lossReason: z.string().max(200, 'Loss reason too long').optional().nullable(),
  lossDetails: z.string().max(2000, 'Loss details too long').optional().nullable(),
  winFactors: z.string().max(2000, 'Win factors too long').optional().nullable(),
  competitor: z.string().max(200, 'Competitor name too long').optional().nullable(),
  notes: z.string().max(5000, 'Notes too long').optional().nullable(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// Project validation schema
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  budget: z.number().int('Must be a whole number').min(0, 'Budget cannot be negative'),
  actualCost: z.number().int('Must be a whole number').min(0, 'Actual cost cannot be negative'),
  cogs: z.number().int('Must be a whole number').min(0, 'COGS cannot be negative'),
  status: z.enum(['On Track', 'At Risk', 'Underperform']),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Monthly data validation schema
export const monthlyDataSchema = z.object({
  month: z.string().min(1, 'Month is required').max(50, 'Month too long'),
  year: z.number().int('Must be a whole number').min(2020, 'Year too old').max(2100, 'Year too far in future'),
  revenue: z.number().int('Must be a whole number').min(0, 'Revenue cannot be negative'),
  opex: z.number().int('Must be a whole number').min(0, 'OPEX cannot be negative'),
  cogs: z.number().int('Must be a whole number').min(0, 'COGS cannot be negative'),
});

export type MonthlyDataInput = z.infer<typeof monthlyDataSchema>;

// Survey data validation schema
export const surveyDataSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  csat: z.number().min(0, 'CSAT cannot be negative').max(100, 'CSAT cannot exceed 100'),
  esat: z.number().min(0, 'ESAT cannot be negative').max(100, 'ESAT cannot exceed 100'),
});

export type SurveyDataInput = z.infer<typeof surveyDataSchema>;

// Team member validation schema
export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(100, 'Email too long').optional().nullable().or(z.literal('')),
  position: z.string().max(100, 'Position too long').optional().nullable(),
  squad: z.string().max(100, 'Squad too long').optional().nullable(),
  supervisor: z.string().max(100, 'Supervisor too long').optional().nullable(),
  employmentStatus: z.enum(['Permanent', 'Contract', 'Freelance', 'Vendor']).optional().nullable(),
  isActive: z.boolean(),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// Daily task validation schema
export const dailyTaskSchema = z.object({
  teamMemberId: z.string().uuid('Invalid team member ID'),
  taskDate: z.string().min(1, 'Task date is required'),
  taskName: z.string().min(1, 'Task name is required').max(500, 'Task name too long'),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  duration: z.number().min(0, 'Duration cannot be negative').max(24, 'Duration cannot exceed 24 hours'),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type DailyTaskInput = z.infer<typeof dailyTaskSchema>;

// Project team allocation validation schema
export const projectAllocationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  teamMemberId: z.string().uuid('Invalid team member ID'),
  month: z.string().min(1, 'Month is required').max(50, 'Month too long'),
  allocationPercentage: z.number().int('Must be a whole number').min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
  roleInProject: z.string().max(100, 'Role too long').optional().nullable(),
  costType: z.enum(['hpp', 'opex']).optional().nullable(),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type ProjectAllocationInput = z.infer<typeof projectAllocationSchema>;

// Team member ESAT validation schema
export const teamMemberEsatSchema = z.object({
  teamMemberId: z.string().uuid('Invalid team member ID'),
  month: z.string().min(1, 'Month is required').max(50, 'Month too long'),
  esatScore: z.number().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type TeamMemberEsatInput = z.infer<typeof teamMemberEsatSchema>;

// Lead history validation schema
export const leadHistorySchema = z.object({
  leadId: z.string().uuid('Invalid lead ID'),
  previousStage: z.string().max(50).optional().nullable(),
  newStage: z.string().min(1, 'New stage is required').max(50, 'Stage too long'),
  changedBy: z.string().min(1, 'Changed by is required').max(100, 'Name too long'),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type LeadHistoryInput = z.infer<typeof leadHistorySchema>;

// Project revenue validation schema
export const projectRevenueSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(1000, 'Note too long').optional().nullable(),
});

export type ProjectRevenueInput = z.infer<typeof projectRevenueSchema>;
