import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type CsatSurvey = Database['public']['Tables']['csat_surveys']['Row'] & {
  project?: { name: string } | null;
  responses: Database['public']['Tables']['csat_responses']['Row'][];
  latest_response?: Database['public']['Tables']['csat_responses']['Row'] | null;
};

export function useCsat() {
  const queryClient = useQueryClient();

  const { data: surveys, isLoading } = useQuery({
    queryKey: ['csat_surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csat_surveys')
        .select(`
          *,
          project:projects(name),
          responses:csat_responses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(survey => {
        // Sort responses by submitted_at desc
        const sortedResponses = (survey.responses || []).sort((a, b) => 
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
        
        return {
          ...survey,
          responses: sortedResponses,
          latest_response: sortedResponses[0] || null
        };
      }) as CsatSurvey[];
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (newSurvey: Database['public']['Tables']['csat_surveys']['Insert']) => {
      const { data, error } = await supabase
        .from('csat_surveys')
        .insert(newSurvey)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csat_surveys'] });
    },
  });

  const createBulkSurveys = useMutation({
    mutationFn: async (newSurveys: Database['public']['Tables']['csat_surveys']['Insert'][]) => {
      const { data, error } = await supabase
        .from('csat_surveys')
        .insert(newSurveys)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csat_surveys'] });
    },
  });

  return {
    surveys,
    isLoading,
    createSurvey,
    createBulkSurveys,
  };
}
