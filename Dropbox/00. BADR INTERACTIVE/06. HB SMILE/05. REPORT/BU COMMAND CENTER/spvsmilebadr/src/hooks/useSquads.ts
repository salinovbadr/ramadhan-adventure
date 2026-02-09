import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Squad {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const transformSquad = (row: any): Squad => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSquads = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSquads(data ? data.map(transformSquad) : []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching squads:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const addSquad = useCallback(async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('squads')
        .insert({ name, description: description || null })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast.error('Squad dengan nama tersebut sudah ada');
          return null;
        }
        throw error;
      }
      
      if (data) {
        setSquads(prev => [...prev, transformSquad(data)].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Squad berhasil ditambahkan');
        return transformSquad(data);
      }
      return null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error adding squad:', error);
      }
      toast.error('Gagal menambahkan squad');
      return null;
    }
  }, []);

  const updateSquad = useCallback(async (id: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('squads')
        .update({ name, description: description || null })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast.error('Squad dengan nama tersebut sudah ada');
          return null;
        }
        throw error;
      }
      
      if (data) {
        setSquads(prev => 
          prev.map(s => s.id === id ? transformSquad(data) : s)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success('Squad berhasil diperbarui');
        return transformSquad(data);
      }
      return null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating squad:', error);
      }
      toast.error('Gagal memperbarui squad');
      return null;
    }
  }, []);

  const deleteSquad = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('squads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSquads(prev => prev.filter(s => s.id !== id));
      toast.success('Squad berhasil dihapus');
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting squad:', error);
      }
      toast.error('Gagal menghapus squad');
      return false;
    }
  }, []);

  return {
    squads,
    isLoading,
    fetchSquads,
    addSquad,
    updateSquad,
    deleteSquad,
  };
}
