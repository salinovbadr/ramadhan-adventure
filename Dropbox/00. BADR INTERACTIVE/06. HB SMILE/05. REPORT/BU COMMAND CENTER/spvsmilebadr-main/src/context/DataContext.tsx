import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import type {
  Project, MonthlyData, SurveyData, Lead, LeadHistory,
  TeamMember, ProjectTeamAllocation, TeamMemberEsat, DailyTask, ProjectRevenue,
  ESATSurvey, ESATResponse, ESATAnswer
} from '@/lib/mockData';

interface DataContextType {
  projects: Project[];
  monthlyData: MonthlyData[];
  surveyData: SurveyData[];
  leads: Lead[];
  leadHistory: LeadHistory[];
  teamMembers: TeamMember[];
  projectAllocations: ProjectTeamAllocation[];
  teamMemberEsat: TeamMemberEsat[];
  dailyTasks: DailyTask[];
  projectRevenues: ProjectRevenue[];
  esatSurveys: ESATSurvey[];
  esatResponses: ESATResponse[];
  esatAnswers: ESATAnswer[];
  isLoading: boolean;
  addProject: (project: Omit<Project, 'id'>) => Promise<any>;
  updateProject: (id: string, project: Partial<Project>) => Promise<any>;
  deleteProject: (id: string) => Promise<void>;
  addMonthlyData: (data: Omit<MonthlyData, 'id'>) => Promise<any>;
  updateMonthlyData: (id: string, data: Partial<MonthlyData>) => Promise<any>;
  deleteMonthlyData: (id: string) => Promise<void>;
  addSurveyData: (data: Omit<SurveyData, 'id'>) => Promise<any>;
  updateSurveyData: (id: string, data: Partial<SurveyData>) => Promise<any>;
  deleteSurveyData: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id'>, changedBy?: string) => Promise<any>;
  updateLead: (id: string, lead: Partial<Lead>, changedBy?: string, previousStage?: string) => Promise<any>;
  deleteLead: (id: string) => Promise<void>;
  addLeadHistory: (history: Omit<LeadHistory, 'id' | 'createdAt'>) => Promise<any>;
  getLeadHistory: (leadId: string) => LeadHistory[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<any>;
  deleteTeamMember: (id: string) => Promise<void>;
  addProjectAllocation: (allocation: Omit<ProjectTeamAllocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateProjectAllocation: (id: string, allocation: Partial<ProjectTeamAllocation>) => Promise<any>;
  deleteProjectAllocation: (id: string) => Promise<void>;
  addTeamMemberEsat: (esat: Omit<TeamMemberEsat, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateTeamMemberEsat: (id: string, esat: Partial<TeamMemberEsat>) => Promise<any>;
  deleteTeamMemberEsat: (id: string) => Promise<void>;
  addDailyTask: (task: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateDailyTask: (id: string, task: Partial<DailyTask>) => Promise<any>;
  deleteDailyTask: (id: string) => Promise<void>;
  addProjectRevenue: (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => Promise<any>;
  deleteProjectRevenue: (id: string) => Promise<void>;
  addESATSurvey: (survey: Omit<ESATSurvey, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateESATSurvey: (id: string, survey: Partial<ESATSurvey>) => Promise<any>;
  deleteESATSurvey: (id: string) => Promise<void>;
  createESATResponse: (surveyId: string, respondentName: string, respondentPosition?: string, respondentSquad?: string) => Promise<any>;
  submitESATResponse: (responseId: string) => Promise<any>;
  saveESATAnswer: (answer: Omit<ESATAnswer, 'id' | 'createdAt'>) => Promise<void>;
  getESATAnswersForResponse: (responseId: string) => ESATAnswer[];
  getESATResponsesForSurvey: (surveyId: string) => ESATResponse[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const database = useDatabase();

  return (
    <DataContext.Provider value={database}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
