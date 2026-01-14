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
      coach_intake_forms: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          form_data: Json
          id: string
          notes: string | null
          reviewed_at: string | null
          specialty: Database["public"]["Enums"]["coach_specialty"]
          status: Database["public"]["Enums"]["form_status"]
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          form_data?: Json
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          specialty: Database["public"]["Enums"]["coach_specialty"]
          status?: Database["public"]["Enums"]["form_status"]
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          form_data?: Json
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          specialty?: Database["public"]["Enums"]["coach_specialty"]
          status?: Database["public"]["Enums"]["form_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_analytics_snapshots: {
        Row: {
          active_members: number | null
          churned_members: number | null
          created_at: string
          customers_count: number | null
          id: string
          leads_count: number | null
          mrr: number | null
          new_clients: number | null
          prospects_count: number | null
          snapshot_date: string
          total_clients: number | null
          total_revenue: number | null
          vip_count: number | null
        }
        Insert: {
          active_members?: number | null
          churned_members?: number | null
          created_at?: string
          customers_count?: number | null
          id?: string
          leads_count?: number | null
          mrr?: number | null
          new_clients?: number | null
          prospects_count?: number | null
          snapshot_date?: string
          total_clients?: number | null
          total_revenue?: number | null
          vip_count?: number | null
        }
        Update: {
          active_members?: number | null
          churned_members?: number | null
          created_at?: string
          customers_count?: number | null
          id?: string
          leads_count?: number | null
          mrr?: number | null
          new_clients?: number | null
          prospects_count?: number | null
          snapshot_date?: string
          total_clients?: number | null
          total_revenue?: number | null
          vip_count?: number | null
        }
        Relationships: []
      }
      crm_campaign_enrollments: {
        Row: {
          campaign_id: string
          client_id: string
          conversion_date: string | null
          enrolled_at: string
          id: string
          last_interaction: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          client_id: string
          conversion_date?: string | null
          enrolled_at?: string
          id?: string
          last_interaction?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          client_id?: string
          conversion_date?: string | null
          enrolled_at?: string
          id?: string
          last_interaction?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaign_enrollments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_campaign_enrollments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_client_notes: {
        Row: {
          author_id: string | null
          client_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          note_type: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          client_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          health_goals: string | null
          id: string
          lead_source: string | null
          marketing_status:
            | Database["public"]["Enums"]["marketing_status"]
            | null
          notes: string | null
          phone: string | null
          referral_source: string | null
          state: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          health_goals?: string | null
          id?: string
          lead_source?: string | null
          marketing_status?:
            | Database["public"]["Enums"]["marketing_status"]
            | null
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          health_goals?: string | null
          id?: string
          lead_source?: string | null
          marketing_status?:
            | Database["public"]["Enums"]["marketing_status"]
            | null
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      crm_communication_logs: {
        Row: {
          client_id: string
          communication_type: string
          content: string
          created_at: string
          direction: string
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          outcome: string | null
          staff_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          communication_type: string
          content: string
          created_at?: string
          direction: string
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          outcome?: string | null
          staff_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          communication_type?: string
          content?: string
          created_at?: string
          direction?: string
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          outcome?: string | null
          staff_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_documents: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          shared_with_client: boolean | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          shared_with_client?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          shared_with_client?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_logs: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          client_id: string | null
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          sent_at: string
          status: string | null
          subject: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          sent_at?: string
          status?: string | null
          subject: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_marketing_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_segment: string | null
          updated_at: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_segment?: string | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_segment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_memberships: {
        Row: {
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          monthly_price: number | null
          notes: string | null
          renewal_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_price?: number | null
          notes?: string | null
          renewal_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_price?: number | null
          notes?: string | null
          renewal_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_purchases: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          product_name: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          purchased_at: string
          status: string | null
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          product_name: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          purchased_at?: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          product_name?: string
          purchase_type?: Database["public"]["Enums"]["purchase_type"]
          purchased_at?: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_saved_views: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      form_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          form_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          form_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          form_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_activity_log_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "coach_intake_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "health_architect" | "coach" | "client"
      coach_specialty:
        | "nutrition"
        | "performance"
        | "wellness_recovery"
        | "mental_performance"
      document_type:
        | "contract"
        | "lab_results"
        | "health_record"
        | "invoice"
        | "other"
      form_status:
        | "pending"
        | "in_review"
        | "assigned"
        | "completed"
        | "archived"
      marketing_status: "lead" | "prospect" | "customer" | "churned" | "vip"
      membership_status: "active" | "paused" | "cancelled" | "expired"
      membership_tier: "free" | "essential" | "premium" | "elite"
      purchase_type: "subscription" | "one_time" | "supplement" | "service"
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
      app_role: ["admin", "health_architect", "coach", "client"],
      coach_specialty: [
        "nutrition",
        "performance",
        "wellness_recovery",
        "mental_performance",
      ],
      document_type: [
        "contract",
        "lab_results",
        "health_record",
        "invoice",
        "other",
      ],
      form_status: [
        "pending",
        "in_review",
        "assigned",
        "completed",
        "archived",
      ],
      marketing_status: ["lead", "prospect", "customer", "churned", "vip"],
      membership_status: ["active", "paused", "cancelled", "expired"],
      membership_tier: ["free", "essential", "premium", "elite"],
      purchase_type: ["subscription", "one_time", "supplement", "service"],
    },
  },
} as const
