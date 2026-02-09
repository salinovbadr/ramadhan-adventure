export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      csat_responses: {
        Row: {
          csat_score: number
          esat_score: number | null
          feedback: string | null
          id: string
          submitted_at: string
          survey_id: string
        }
        Insert: {
          csat_score: number
          esat_score?: number | null
          feedback?: string | null
          id?: string
          submitted_at?: string
          survey_id: string
        }
        Update: {
          csat_score?: number
          esat_score?: number | null
          feedback?: string | null
          id?: string
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "csat_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "csat_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      csat_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          project_id: string | null
          public_token: string
          reviewer_name: string
          reviewer_role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
          public_token?: string
          reviewer_name: string
          reviewer_role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
          public_token?: string
          reviewer_name?: string
          reviewer_role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "csat_surveys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      csat_data: {
        Row: {
          created_at: string
          csat_score: number
          date: string
          id: string
          notes: string | null
          project_id: string | null
          reviewer_company: string | null
          reviewer_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          csat_score?: number
          date: string
          id?: string
          notes?: string | null
          project_id?: string | null
          reviewer_company?: string | null
          reviewer_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          csat_score?: number
          date?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          reviewer_company?: string | null
          reviewer_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "csat_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          task_date: string
          task_name: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          task_date: string
          task_name: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          task_date?: string
          task_name?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      document_faqs: {
        Row: {
          answer: string
          created_at: string
          document_id: string
          id: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          document_id: string
          id?: string
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          document_id?: string
          id?: string
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_faqs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_notes: string | null
          content: string | null
          created_at: string
          document_id: string
          edited_by: string | null
          edited_by_email: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          content?: string | null
          created_at?: string
          document_id: string
          edited_by?: string | null
          edited_by_email?: string | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          change_notes?: string | null
          content?: string | null
          created_at?: string
          document_id?: string
          edited_by?: string | null
          edited_by_email?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          attachments: Json | null
          category: Database["public"]["Enums"]["document_category"]
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_public: boolean
          public_slug: string | null
          status: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          category?: Database["public"]["Enums"]["document_category"]
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          public_slug?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          category?: Database["public"]["Enums"]["document_category"]
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          public_slug?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          lead_id: string
          new_stage: string
          notes: string | null
          previous_stage: string | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          lead_id: string
          new_stage: string
          notes?: string | null
          previous_stage?: string | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          lead_id?: string
          new_stage?: string
          notes?: string | null
          previous_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          closed_date: string | null
          company_name: string
          competitor: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          estimated_value: number
          expected_close_date: string | null
          id: string
          loss_details: string | null
          loss_reason: string | null
          notes: string | null
          probability: number
          project_name: string
          proposal_date: string | null
          source: Database["public"]["Enums"]["lead_source"]
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
          win_factors: string | null
        }
        Insert: {
          closed_date?: string | null
          company_name: string
          competitor?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          estimated_value?: number
          expected_close_date?: string | null
          id?: string
          loss_details?: string | null
          loss_reason?: string | null
          notes?: string | null
          probability?: number
          project_name: string
          proposal_date?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          win_factors?: string | null
        }
        Update: {
          closed_date?: string | null
          company_name?: string
          competitor?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          estimated_value?: number
          expected_close_date?: string | null
          id?: string
          loss_details?: string | null
          loss_reason?: string | null
          notes?: string | null
          probability?: number
          project_name?: string
          proposal_date?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          win_factors?: string | null
        }
        Relationships: []
      }
      monthly_data: {
        Row: {
          cogs: number
          created_at: string
          id: string
          month: string
          opex: number
          revenue: number
          updated_at: string
        }
        Insert: {
          cogs?: number
          created_at?: string
          id?: string
          month: string
          opex?: number
          revenue?: number
          updated_at?: string
        }
        Update: {
          cogs?: number
          created_at?: string
          id?: string
          month?: string
          opex?: number
          revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      opex_budget: {
        Row: {
          account: string | null
          apr: number
          aug: number
          created_at: string
          dec: number
          description: string
          feb: number
          id: string
          jan: number
          jul: number
          jun: number
          kpi: string | null
          mar: number
          may: number
          nov: number
          oct: number
          okr: string | null
          sep: number
          squad: string | null
          updated_at: string
          year: number
        }
        Insert: {
          account?: string | null
          apr?: number
          aug?: number
          created_at?: string
          dec?: number
          description: string
          feb?: number
          id?: string
          jan?: number
          jul?: number
          jun?: number
          kpi?: string | null
          mar?: number
          may?: number
          nov?: number
          oct?: number
          okr?: string | null
          sep?: number
          squad?: string | null
          updated_at?: string
          year?: number
        }
        Update: {
          account?: string | null
          apr?: number
          aug?: number
          created_at?: string
          dec?: number
          description?: string
          feb?: number
          id?: string
          jan?: number
          jul?: number
          jun?: number
          kpi?: string | null
          mar?: number
          may?: number
          nov?: number
          oct?: number
          okr?: string | null
          sep?: number
          squad?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      opex_consumption: {
        Row: {
          allocation_description: string
          amount: number
          created_at: string
          id: string
          opex_budget_id: string | null
          quarter: string
          updated_at: string
          usage_description: string | null
          year: number
        }
        Insert: {
          allocation_description: string
          amount?: number
          created_at?: string
          id?: string
          opex_budget_id?: string | null
          quarter: string
          updated_at?: string
          usage_description?: string | null
          year?: number
        }
        Update: {
          allocation_description?: string
          amount?: number
          created_at?: string
          id?: string
          opex_budget_id?: string | null
          quarter?: string
          updated_at?: string
          usage_description?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "opex_consumption_opex_budget_id_fkey"
            columns: ["opex_budget_id"]
            isOneToOne: false
            referencedRelation: "opex_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_team_allocations: {
        Row: {
          allocation_percentage: number
          cost_type: string | null
          created_at: string
          id: string
          month: string
          notes: string | null
          project_id: string
          role_in_project: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number
          cost_type?: string | null
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          project_id: string
          role_in_project?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number
          cost_type?: string | null
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          project_id?: string
          role_in_project?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_allocations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number
          budget: number
          cogs: number
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number
          budget?: number
          cogs?: number
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number
          budget?: number
          cogs?: number
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      squads: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      survey_data: {
        Row: {
          created_at: string
          csat: number
          date: string
          esat: number
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          csat?: number
          date: string
          esat?: number
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          csat?: number
          date?: string
          esat?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_member_esat: {
        Row: {
          created_at: string
          esat_score: number
          id: string
          month: string
          notes: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          esat_score?: number
          id?: string
          month: string
          notes?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          esat_score?: number
          id?: string
          month?: string
          notes?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_esat_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          position: string | null
          squad: string | null
          supervisor: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          position?: string | null
          squad?: string | null
          supervisor?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          position?: string | null
          squad?: string | null
          supervisor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_public_slug: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_category: "sop" | "aturan" | "keputusan" | "panduan" | "lainnya"
      document_status: "draft" | "published" | "archived"
      lead_source:
        | "referral"
        | "website"
        | "cold_call"
        | "event"
        | "social_media"
        | "other"
      lead_stage: "proposal" | "negotiation" | "review" | "won" | "lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      document_category: ["sop", "aturan", "keputusan", "panduan", "lainnya"],
      document_status: ["draft", "published", "archived"],
      lead_source: [
        "referral",
        "website",
        "cold_call",
        "event",
        "social_media",
        "other",
      ],
      lead_stage: ["proposal", "negotiation", "review", "won", "lost"],
    },
  },
} as const
