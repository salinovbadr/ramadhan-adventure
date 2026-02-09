import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Project, MonthlyData, SurveyData, Lead, LeadStage, LeadSource,
  LeadHistory, TeamMember, ProjectTeamAllocation, TeamMemberEsat, DailyTask,
  ProjectRevenue, ESATSurvey, ESATResponse, ESATAnswer
} from '@/lib/mockData';
import {
  leadSchema,
  projectSchema,
  monthlyDataSchema,
  surveyDataSchema,
  teamMemberSchema,
  projectAllocationSchema,
  teamMemberEsatSchema,
  leadHistorySchema,
  dailyTaskSchema,
  projectRevenueSchema,
} from '@/lib/validation';

// Transform database row to app format
const transformProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  budget: row.budget,
  actualCost: row.actual_cost,
  revenue: row.budget,
  cogs: row.cogs,
  status: row.status === 'on-track' ? 'On Track' : row.status === 'at-risk' ? 'At Risk' : 'Underperform',
});

const transformMonthlyData = (row: any): MonthlyData => ({
  id: row.id,
  month: row.month.split(' ')[0],
  year: parseInt(row.month.split(' ')[1]) || 2024,
  revenue: row.revenue,
  opex: row.opex,
  cogs: row.cogs,
});

const transformSurveyData = (row: any): SurveyData => ({
  id: row.id,
  date: row.date,
  csat: Number(row.csat),
  esat: Number(row.esat),
});

const transformLead = (row: any): Lead => ({
  id: row.id,
  companyName: row.company_name,
  projectName: row.project_name,
  contactPerson: row.contact_person,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  estimatedValue: Number(row.estimated_value),
  probability: row.probability,
  stage: row.stage as LeadStage,
  source: row.source as LeadSource,
  proposalDate: row.proposal_date,
  expectedCloseDate: row.expected_close_date,
  closedDate: row.closed_date,
  lossReason: row.loss_reason,
  lossDetails: row.loss_details,
  winFactors: row.win_factors,
  competitor: row.competitor,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformLeadHistory = (row: any): LeadHistory => ({
  id: row.id,
  leadId: row.lead_id,
  previousStage: row.previous_stage,
  newStage: row.new_stage,
  changedBy: row.changed_by,
  notes: row.notes,
  createdAt: row.created_at,
});

const transformTeamMember = (row: any): TeamMember => ({
  id: row.id,
  name: row.name,
  email: row.email,
  position: row.position,
  squad: row.squad,
  supervisor: row.supervisor,
  employmentStatus: row.employment_status,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformDailyTask = (row: any): DailyTask => ({
  id: row.id,
  teamMemberId: row.team_member_id,
  taskDate: row.task_date,
  taskName: row.task_name,
  projectId: row.project_id,
  duration: Number(row.duration) || 0,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformProjectRevenue = (row: any): ProjectRevenue => ({
  id: row.id,
  projectId: row.project_id,
  amount: Number(row.amount),
  date: row.date,
  note: row.note,
  createdAt: row.created_at,
});

const transformProjectAllocation = (row: any): ProjectTeamAllocation => ({
  id: row.id,
  projectId: row.project_id,
  teamMemberId: row.team_member_id,
  month: row.month,
  allocationPercentage: row.allocation_percentage,
  roleInProject: row.role_in_project,
  costType: row.cost_type,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformTeamMemberEsat = (row: any): TeamMemberEsat => ({
  id: row.id,
  teamMemberId: row.team_member_id,
  month: row.month,
  esatScore: Number(row.esat_score),
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useDatabase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectAllocations, setProjectAllocations] = useState<ProjectTeamAllocation[]>([]);
  const [teamMemberEsat, setTeamMemberEsat] = useState<TeamMemberEsat[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [projectRevenues, setProjectRevenues] = useState<ProjectRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsRes, monthlyRes, surveyRes, leadsRes, historyRes, teamRes, allocRes, esatRes, tasksRes, revenuesRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('monthly_data').select('*'),
        supabase.from('survey_data').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('lead_history').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*'),
        supabase.from('project_team_allocations').select('*'),
        supabase.from('team_member_esat').select('*'),
        supabase.from('daily_tasks').select('*'),
        supabase.from('project_revenues' as any).select('*'),
      ]);

      setProjects(projectsRes.data ? projectsRes.data.map(transformProject) : []);
      setMonthlyData(monthlyRes.data ? monthlyRes.data.map(transformMonthlyData) : []);
      setSurveyData(surveyRes.data ? surveyRes.data.map(transformSurveyData) : []);
      setLeads(leadsRes.data ? leadsRes.data.map(transformLead) : []);
      setLeadHistory(historyRes.data ? historyRes.data.map(transformLeadHistory) : []);
      setTeamMembers(teamRes.data ? teamRes.data.map(transformTeamMember) : []);
      setProjectAllocations(allocRes.data ? allocRes.data.map(transformProjectAllocation) : []);
      setTeamMemberEsat(esatRes.data ? esatRes.data.map(transformTeamMemberEsat) : []);
      setDailyTasks(tasksRes.data ? tasksRes.data.map(transformDailyTask) : []);
      setProjectRevenues(revenuesRes.data ? revenuesRes.data.map(transformProjectRevenue) : []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = fetchData;

  // Project CRUD with validation
  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    // Validate input
    const validated = projectSchema.parse(project);
    
    const dbProject = {
      name: validated.name,
      budget: validated.budget,
      actual_cost: validated.actualCost,
      cogs: validated.cogs,
      status: validated.status.toLowerCase().replace(' ', '-'),
    };
    
    const { data, error } = await supabase.from('projects').insert(dbProject).select().single();
    if (error) throw error;
    if (data) setProjects(prev => [...prev, transformProject(data)]);
    return data;
  }, []);

  const updateProject = useCallback(async (id: string, project: Partial<Project>) => {
    // Partial validation for update
    const partialSchema = projectSchema.partial();
    const validated = partialSchema.parse(project);
    
    const dbProject: any = {};
    if (validated.name !== undefined) dbProject.name = validated.name;
    if (validated.budget !== undefined) dbProject.budget = validated.budget;
    if (validated.actualCost !== undefined) dbProject.actual_cost = validated.actualCost;
    if (validated.cogs !== undefined) dbProject.cogs = validated.cogs;
    if (validated.status !== undefined) dbProject.status = validated.status.toLowerCase().replace(' ', '-');
    
    const { data, error } = await supabase.from('projects').update(dbProject).eq('id', id).select().single();
    if (error) throw error;
    if (data) setProjects(prev => prev.map(p => p.id === id ? transformProject(data) : p));
    return data;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // MonthlyData CRUD with validation
  const addMonthlyData = useCallback(async (data: Omit<MonthlyData, 'id'>) => {
    // Validate input
    const validated = monthlyDataSchema.parse(data);
    
    const dbData = {
      month: `${validated.month} ${validated.year}`,
      revenue: validated.revenue,
      opex: validated.opex,
      cogs: validated.cogs,
    };
    
    const { data: result, error } = await supabase.from('monthly_data').insert(dbData).select().single();
    if (error) throw error;
    if (result) setMonthlyData(prev => [...prev, transformMonthlyData(result)]);
    return result;
  }, []);

  const updateMonthlyData = useCallback(async (id: string, data: Partial<MonthlyData>) => {
    const partialSchema = monthlyDataSchema.partial();
    const validated = partialSchema.parse(data);
    
    const dbData: any = {};
    if (validated.month !== undefined && validated.year !== undefined) dbData.month = `${validated.month} ${validated.year}`;
    if (validated.revenue !== undefined) dbData.revenue = validated.revenue;
    if (validated.opex !== undefined) dbData.opex = validated.opex;
    if (validated.cogs !== undefined) dbData.cogs = validated.cogs;
    
    const { data: result, error } = await supabase.from('monthly_data').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    if (result) setMonthlyData(prev => prev.map(d => d.id === id ? transformMonthlyData(result) : d));
    return result;
  }, []);

  const deleteMonthlyData = useCallback(async (id: string) => {
    const { error } = await supabase.from('monthly_data').delete().eq('id', id);
    if (error) throw error;
    setMonthlyData(prev => prev.filter(d => d.id !== id));
  }, []);

  // SurveyData CRUD with validation
  const addSurveyData = useCallback(async (data: Omit<SurveyData, 'id'>) => {
    // Validate input
    const validated = surveyDataSchema.parse(data);
    
    const dbData = {
      date: validated.date,
      csat: validated.csat,
      esat: validated.esat,
    };
    
    const { data: result, error } = await supabase.from('survey_data').insert(dbData).select().single();
    if (error) throw error;
    if (result) setSurveyData(prev => [...prev, transformSurveyData(result)]);
    return result;
  }, []);

  const updateSurveyData = useCallback(async (id: string, data: Partial<SurveyData>) => {
    const partialSchema = surveyDataSchema.partial();
    const validated = partialSchema.parse(data);
    
    const dbData: any = {};
    if (validated.date !== undefined) dbData.date = validated.date;
    if (validated.csat !== undefined) dbData.csat = validated.csat;
    if (validated.esat !== undefined) dbData.esat = validated.esat;
    
    const { data: result, error } = await supabase.from('survey_data').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    if (result) setSurveyData(prev => prev.map(d => d.id === id ? transformSurveyData(result) : d));
    return result;
  }, []);

  const deleteSurveyData = useCallback(async (id: string) => {
    const { error } = await supabase.from('survey_data').delete().eq('id', id);
    if (error) throw error;
    setSurveyData(prev => prev.filter(d => d.id !== id));
  }, []);

  // Lead CRUD with validation
  const addLead = useCallback(async (lead: Omit<Lead, 'id'>, changedBy?: string) => {
    // Validate input
    const validated = leadSchema.parse(lead);
    
    const dbLead = {
      company_name: validated.companyName,
      project_name: validated.projectName,
      contact_person: validated.contactPerson || null,
      contact_email: validated.contactEmail || null,
      contact_phone: validated.contactPhone || null,
      estimated_value: validated.estimatedValue,
      probability: validated.probability,
      stage: validated.stage,
      source: validated.source,
      proposal_date: validated.proposalDate || null,
      expected_close_date: validated.expectedCloseDate || null,
      closed_date: validated.closedDate || null,
      loss_reason: validated.lossReason || null,
      loss_details: validated.lossDetails || null,
      win_factors: validated.winFactors || null,
      competitor: validated.competitor || null,
      notes: validated.notes || null,
    };
    
    const { data, error } = await supabase.from('leads').insert(dbLead as any).select().single();
    if (error) throw error;
    if (data) {
      setLeads(prev => [...prev, transformLead(data)]);
      // Add initial history entry
      if (changedBy) {
        await addLeadHistory({
          leadId: data.id,
          newStage: validated.stage,
          changedBy,
          notes: 'Lead created',
        });
      }
    }
    return data;
  }, []);

  const updateLead = useCallback(async (id: string, lead: Partial<Lead>, changedBy?: string, previousStage?: string, notes?: string) => {
    const partialSchema = leadSchema.partial();
    const validated = partialSchema.parse(lead);
    
    const dbLead: any = {};
    if (validated.companyName !== undefined) dbLead.company_name = validated.companyName;
    if (validated.projectName !== undefined) dbLead.project_name = validated.projectName;
    if (validated.contactPerson !== undefined) dbLead.contact_person = validated.contactPerson || null;
    if (validated.contactEmail !== undefined) dbLead.contact_email = validated.contactEmail || null;
    if (validated.contactPhone !== undefined) dbLead.contact_phone = validated.contactPhone || null;
    if (validated.estimatedValue !== undefined) dbLead.estimated_value = validated.estimatedValue;
    if (validated.probability !== undefined) dbLead.probability = validated.probability;
    if (validated.stage !== undefined) dbLead.stage = validated.stage;
    if (validated.source !== undefined) dbLead.source = validated.source;
    if (validated.proposalDate !== undefined) dbLead.proposal_date = validated.proposalDate || null;
    if (validated.expectedCloseDate !== undefined) dbLead.expected_close_date = validated.expectedCloseDate || null;
    if (validated.closedDate !== undefined) dbLead.closed_date = validated.closedDate || null;
    if (validated.lossReason !== undefined) dbLead.loss_reason = validated.lossReason || null;
    if (validated.lossDetails !== undefined) dbLead.loss_details = validated.lossDetails || null;
    if (validated.winFactors !== undefined) dbLead.win_factors = validated.winFactors || null;
    if (validated.competitor !== undefined) dbLead.competitor = validated.competitor || null;
    if (validated.notes !== undefined) dbLead.notes = validated.notes || null;
    
    const { data, error } = await supabase.from('leads').update(dbLead as any).eq('id', id).select().single();
    if (error) throw error;
    if (data) {
      setLeads(prev => prev.map(l => l.id === id ? transformLead(data) : l));
      // Add history entry if stage changed
      if (changedBy && validated.stage && previousStage && validated.stage !== previousStage) {
        await addLeadHistory({
          leadId: id,
          previousStage,
          newStage: validated.stage,
          changedBy,
          notes: notes || undefined,
        });
      }
    }
    return data;
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  // Lead History CRUD with validation
  const addLeadHistory = useCallback(async (history: Omit<LeadHistory, 'id' | 'createdAt'>) => {
    // Validate input
    const validated = leadHistorySchema.parse(history);
    
    const dbHistory = {
      lead_id: validated.leadId,
      previous_stage: validated.previousStage || null,
      new_stage: validated.newStage,
      changed_by: validated.changedBy,
      notes: validated.notes || null,
    };
    
    const { data, error } = await supabase.from('lead_history').insert(dbHistory).select().single();
    if (error) throw error;
    if (data) setLeadHistory(prev => [transformLeadHistory(data), ...prev]);
    return data;
  }, []);

  const getLeadHistory = useCallback((leadId: string) => {
    return leadHistory.filter(h => h.leadId === leadId);
  }, [leadHistory]);

  // Team Member CRUD with validation
  const addTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const validated = teamMemberSchema.parse(member);
    
    const dbMember = {
      name: validated.name,
      email: validated.email || null,
      position: validated.position || null,
      squad: validated.squad || null,
      supervisor: validated.supervisor || null,
      employment_status: validated.employmentStatus || null,
      is_active: validated.isActive,
    };
    
    const { data, error } = await supabase.from('team_members').insert(dbMember).select().single();
    if (error) throw error;
    if (data) setTeamMembers(prev => [...prev, transformTeamMember(data)]);
    return data;
  }, []);

  const updateTeamMember = useCallback(async (id: string, member: Partial<TeamMember>) => {
    const partialSchema = teamMemberSchema.partial();
    const validated = partialSchema.parse(member);
    
    const dbMember: any = {};
    if (validated.name !== undefined) dbMember.name = validated.name;
    if (validated.email !== undefined) dbMember.email = validated.email || null;
    if (validated.position !== undefined) dbMember.position = validated.position || null;
    if (validated.squad !== undefined) dbMember.squad = validated.squad || null;
    if (validated.supervisor !== undefined) dbMember.supervisor = validated.supervisor || null;
    if (validated.employmentStatus !== undefined) dbMember.employment_status = validated.employmentStatus || null;
    if (validated.isActive !== undefined) dbMember.is_active = validated.isActive;
    
    const { data, error } = await supabase.from('team_members').update(dbMember).eq('id', id).select().single();
    if (error) throw error;
    if (data) setTeamMembers(prev => prev.map(m => m.id === id ? transformTeamMember(data) : m));
    return data;
  }, []);

  const deleteTeamMember = useCallback(async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  // Project Team Allocation CRUD with validation
  const addProjectAllocation = useCallback(async (allocation: Omit<ProjectTeamAllocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const validated = projectAllocationSchema.parse(allocation);
    
    // Check for existing allocation with same team member, month, and cost type
    const { data: existingAllocations, error: checkError } = await supabase
      .from('project_team_allocations')
      .select('*')
      .eq('team_member_id', validated.teamMemberId)
      .eq('month', validated.month)
      .eq('cost_type', validated.costType || 'hpp');
    
    if (checkError) throw checkError;
    
    const dbAllocation = {
      project_id: validated.projectId || null,
      team_member_id: validated.teamMemberId,
      month: validated.month,
      allocation_percentage: validated.allocationPercentage,
      role_in_project: validated.roleInProject || null,
      cost_type: validated.costType || 'hpp',
      notes: validated.notes || null,
    };
    
    // If exists and project is different, update the existing one
    if (existingAllocations && existingAllocations.length > 0) {
      const existing = existingAllocations[0];
      
      // Update the existing allocation
      const { data, error } = await supabase
        .from('project_team_allocations')
        .update(dbAllocation)
        .eq('id', existing.id)
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        setProjectAllocations(prev => 
          prev.map(a => a.id === existing.id ? transformProjectAllocation(data) : a)
        );
      }
      return data;
    } else {
      // Insert new allocation
      const { data, error } = await supabase.from('project_team_allocations').insert(dbAllocation).select().single();
      if (error) throw error;
      if (data) setProjectAllocations(prev => [...prev, transformProjectAllocation(data)]);
      return data;
    }
  }, []);

  const updateProjectAllocation = useCallback(async (id: string, allocation: Partial<ProjectTeamAllocation>) => {
    const partialSchema = projectAllocationSchema.partial();
    const validated = partialSchema.parse(allocation);
    
    const dbAllocation: any = {};
    if (validated.projectId !== undefined) dbAllocation.project_id = validated.projectId || null;
    if (validated.teamMemberId !== undefined) dbAllocation.team_member_id = validated.teamMemberId;
    if (validated.month !== undefined) dbAllocation.month = validated.month;
    if (validated.allocationPercentage !== undefined) dbAllocation.allocation_percentage = validated.allocationPercentage;
    if (validated.roleInProject !== undefined) dbAllocation.role_in_project = validated.roleInProject || null;
    if (validated.costType !== undefined) dbAllocation.cost_type = validated.costType || 'hpp';
    if (validated.notes !== undefined) dbAllocation.notes = validated.notes || null;
    
    const { data, error } = await supabase.from('project_team_allocations').update(dbAllocation).eq('id', id).select().single();
    if (error) throw error;
    if (data) setProjectAllocations(prev => prev.map(a => a.id === id ? transformProjectAllocation(data) : a));
    return data;
  }, []);

  const deleteProjectAllocation = useCallback(async (id: string) => {
    const { error } = await supabase.from('project_team_allocations').delete().eq('id', id);
    if (error) throw error;
    setProjectAllocations(prev => prev.filter(a => a.id !== id));
  }, []);

  // Team Member ESAT CRUD with validation
  const addTeamMemberEsat = useCallback(async (esat: Omit<TeamMemberEsat, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const validated = teamMemberEsatSchema.parse(esat);
    
    const dbEsat = {
      team_member_id: validated.teamMemberId,
      month: validated.month,
      esat_score: validated.esatScore,
      notes: validated.notes || null,
    };
    
    const { data, error } = await supabase.from('team_member_esat').insert(dbEsat).select().single();
    if (error) throw error;
    if (data) setTeamMemberEsat(prev => [...prev, transformTeamMemberEsat(data)]);
    return data;
  }, []);

  const updateTeamMemberEsat = useCallback(async (id: string, esat: Partial<TeamMemberEsat>) => {
    const partialSchema = teamMemberEsatSchema.partial();
    const validated = partialSchema.parse(esat);
    
    const dbEsat: any = {};
    if (validated.teamMemberId !== undefined) dbEsat.team_member_id = validated.teamMemberId;
    if (validated.month !== undefined) dbEsat.month = validated.month;
    if (validated.esatScore !== undefined) dbEsat.esat_score = validated.esatScore;
    if (validated.notes !== undefined) dbEsat.notes = validated.notes || null;
    
    const { data, error } = await supabase.from('team_member_esat').update(dbEsat).eq('id', id).select().single();
    if (error) throw error;
    if (data) setTeamMemberEsat(prev => prev.map(e => e.id === id ? transformTeamMemberEsat(data) : e));
    return data;
  }, []);

  const deleteTeamMemberEsat = useCallback(async (id: string) => {
    const { error } = await supabase.from('team_member_esat').delete().eq('id', id);
    if (error) throw error;
    setTeamMemberEsat(prev => prev.filter(e => e.id !== id));
  }, []);

  // Daily Task CRUD with validation
  const addDailyTask = useCallback(async (task: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const validated = dailyTaskSchema.parse(task);
    
    const dbTask = {
      team_member_id: validated.teamMemberId,
      task_date: validated.taskDate,
      task_name: validated.taskName,
      project_id: validated.projectId || null,
      duration: validated.duration,
      notes: validated.notes || null,
    };
    
    const { data, error } = await supabase.from('daily_tasks').insert(dbTask).select().single();
    if (error) throw error;
    if (data) setDailyTasks(prev => [...prev, transformDailyTask(data)]);
    return data;
  }, []);

  const updateDailyTask = useCallback(async (id: string, task: Partial<DailyTask>) => {
    const partialSchema = dailyTaskSchema.partial();
    const validated = partialSchema.parse(task);
    
    const dbTask: any = {};
    if (validated.teamMemberId !== undefined) dbTask.team_member_id = validated.teamMemberId;
    if (validated.taskDate !== undefined) dbTask.task_date = validated.taskDate;
    if (validated.taskName !== undefined) dbTask.task_name = validated.taskName;
    if (validated.projectId !== undefined) dbTask.project_id = validated.projectId || null;
    if (validated.duration !== undefined) dbTask.duration = validated.duration;
    if (validated.notes !== undefined) dbTask.notes = validated.notes || null;
    
    const { data, error } = await supabase.from('daily_tasks').update(dbTask).eq('id', id).select().single();
    if (error) throw error;
    if (data) setDailyTasks(prev => prev.map(t => t.id === id ? transformDailyTask(data) : t));
    return data;
  }, []);

  const deleteDailyTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
    if (error) throw error;
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Project Revenue CRUD
  const addProjectRevenue = useCallback(async (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => {
    const validated = projectRevenueSchema.parse(revenue);
    const dbRevenue = {
      project_id: validated.projectId,
      amount: validated.amount,
      date: validated.date,
      note: validated.note || null,
    };
    const { data, error } = await (supabase.from('project_revenues' as any) as any).insert(dbRevenue).select().single();
    if (error) throw error;
    if (data) setProjectRevenues(prev => [...prev, transformProjectRevenue(data)]);
    return data;
  }, []);

  const deleteProjectRevenue = useCallback(async (id: string) => {
    const { error } = await supabase.from('project_revenues' as any).delete().eq('id', id);
    if (error) throw error;
    setProjectRevenues(prev => prev.filter(r => r.id !== id));
  }, []);

  // ============================================
  // ESAT Survey Management
  // ============================================
  
  const [esatSurveys, setEsatSurveys] = useState<ESATSurvey[]>([]);
  const [esatResponses, setEsatResponses] = useState<ESATResponse[]>([]);
  const [esatAnswers, setEsatAnswers] = useState<ESATAnswer[]>([]);

  // Transform functions
  const transformESATSurvey = (row: any): ESATSurvey => ({
    id: row.id,
    title: row.title,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    accessToken: row.access_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  const transformESATResponse = (row: any): ESATResponse => ({
    id: row.id,
    surveyId: row.survey_id,
    respondentName: row.respondent_name,
    respondentPosition: row.respondent_position,
    respondentSquad: row.respondent_squad,
    submittedAt: row.submitted_at,
    isComplete: row.is_complete,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  const transformESATAnswer = (row: any): ESATAnswer => ({
    id: row.id,
    responseId: row.response_id,
    questionCode: row.question_code,
    category: row.category,
    answerValue: row.answer_value,
    answerText: row.answer_text,
    createdAt: row.created_at,
  });

  // Fetch ESAT data
  useEffect(() => {
    const fetchESATData = async () => {
      const [surveysRes, responsesRes, answersRes] = await Promise.all([
        supabase.from('esat_surveys').select('*').order('created_at', { ascending: false }),
        supabase.from('esat_responses').select('*'),
        supabase.from('esat_answers').select('*'),
      ]);

      if (surveysRes.data) setEsatSurveys(surveysRes.data.map(transformESATSurvey));
      if (responsesRes.data) setEsatResponses(responsesRes.data.map(transformESATResponse));
      if (answersRes.data) setEsatAnswers(answersRes.data.map(transformESATAnswer));
    };

    fetchESATData();
  }, []);

  // ESAT Survey CRUD
  const addESATSurvey = useCallback(async (survey: Omit<ESATSurvey, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('esat_surveys')
      .insert({
        title: survey.title,
        period: survey.period,
        start_date: survey.startDate,
        end_date: survey.endDate,
        status: survey.status,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const newSurvey = transformESATSurvey(data);
      setEsatSurveys(prev => [newSurvey, ...prev]);
      return newSurvey;
    }
  }, []);

  const updateESATSurvey = useCallback(async (id: string, updates: Partial<ESATSurvey>) => {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.period) dbUpdates.period = updates.period;
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('esat_surveys')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const updated = transformESATSurvey(data);
      setEsatSurveys(prev => prev.map(s => s.id === id ? updated : s));
    }
  }, []);

  const deleteESATSurvey = useCallback(async (id: string) => {
    const { error } = await supabase.from('esat_surveys').delete().eq('id', id);
    if (error) throw error;
    setEsatSurveys(prev => prev.filter(s => s.id !== id));
  }, []);

  // ESAT Response CRUD (Public Survey - No Auth)
  const createESATResponse = useCallback(async (
    surveyId: string,
    respondentName: string,
    respondentPosition?: string,
    respondentSquad?: string
  ) => {
    const { data, error } = await supabase
      .from('esat_responses')
      .insert({
        survey_id: surveyId,
        respondent_name: respondentName,
        respondent_position: respondentPosition || null,
        respondent_squad: respondentSquad || null,
        is_complete: false,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const newResponse = transformESATResponse(data);
      setEsatResponses(prev => [...prev, newResponse]);
      return newResponse;
    }
  }, []);

  const submitESATResponse = useCallback(async (responseId: string) => {
    const { data, error } = await supabase
      .from('esat_responses')
      .update({
        is_complete: true,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const updated = transformESATResponse(data);
      setEsatResponses(prev => prev.map(r => r.id === responseId ? updated : r));
    }
  }, []);

  // ESAT Answer CRUD
  const saveESATAnswer = useCallback(async (answer: Omit<ESATAnswer, 'id' | 'createdAt'>) => {
    // Check if answer already exists for this question
    const { data: existing } = await supabase
      .from('esat_answers')
      .select('*')
      .eq('response_id', answer.responseId)
      .eq('question_code', answer.questionCode)
      .single();

    if (existing) {
      // Update existing answer
      const { data, error } = await supabase
        .from('esat_answers')
        .update({
          answer_value: answer.answerValue,
          answer_text: answer.answerText,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const updated = transformESATAnswer(data);
        setEsatAnswers(prev => prev.map(a => a.id === existing.id ? updated : a));
      }
    } else {
      // Insert new answer
      const { data, error } = await supabase
        .from('esat_answers')
        .insert({
          response_id: answer.responseId,
          question_code: answer.questionCode,
          category: answer.category,
          answer_value: answer.answerValue,
          answer_text: answer.answerText,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newAnswer = transformESATAnswer(data);
        setEsatAnswers(prev => [...prev, newAnswer]);
      }
    }
  }, []);

  const getESATAnswersForResponse = useCallback((responseId: string) => {
    return esatAnswers.filter(a => a.responseId === responseId);
  }, [esatAnswers]);

  const getESATResponsesForSurvey = useCallback((surveyId: string) => {
    return esatResponses.filter(r => r.surveyId === surveyId);
  }, [esatResponses]);


  return {
    projects,
    monthlyData,
    surveyData,
    leads,
    leadHistory,
    teamMembers,
    projectAllocations,
    teamMemberEsat,
    dailyTasks,
    projectRevenues,
    esatSurveys,
    esatResponses,
    esatAnswers,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    addMonthlyData,
    updateMonthlyData,
    deleteMonthlyData,
    addSurveyData,
    updateSurveyData,
    deleteSurveyData,
    addLead,
    updateLead,
    deleteLead,
    addLeadHistory,
    getLeadHistory,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addProjectAllocation,
    updateProjectAllocation,
    deleteProjectAllocation,
    addTeamMemberEsat,
    updateTeamMemberEsat,
    deleteTeamMemberEsat,
    addDailyTask,
    updateDailyTask,
    deleteDailyTask,
    addProjectRevenue,
    deleteProjectRevenue,
    addESATSurvey,
    updateESATSurvey,
    deleteESATSurvey,
    createESATResponse,
    submitESATResponse,
    saveESATAnswer,
    getESATAnswersForResponse,
    getESATResponsesForSurvey,
    refreshData,
  };
}
