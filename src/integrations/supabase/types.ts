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
      client_mental_interventions: {
        Row: {
          assessment_id: string | null
          assigned_by: string | null
          client_id: string
          compliance_score: number | null
          created_at: string
          effectiveness_rating: number | null
          end_date: string | null
          id: string
          intervention_id: string
          notes: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_by?: string | null
          client_id: string
          compliance_score?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          end_date?: string | null
          id?: string
          intervention_id: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          assigned_by?: string | null
          client_id?: string
          compliance_score?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          end_date?: string | null
          id?: string
          intervention_id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_mental_interventions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "mental_performance_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_mental_interventions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_mental_interventions_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "mental_performance_interventions"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sleep_interventions: {
        Row: {
          assessment_id: string | null
          assigned_by: string | null
          client_id: string
          compliance_score: number | null
          created_at: string
          effectiveness_rating: number | null
          end_date: string | null
          id: string
          intervention_id: string
          notes: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_by?: string | null
          client_id: string
          compliance_score?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          end_date?: string | null
          id?: string
          intervention_id: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          assigned_by?: string | null
          client_id?: string
          compliance_score?: number | null
          created_at?: string
          effectiveness_rating?: number | null
          end_date?: string | null
          id?: string
          intervention_id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sleep_interventions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "sleep_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sleep_interventions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sleep_interventions_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "sleep_interventions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      coach_satisfaction_surveys: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          feedback: string | null
          id: string
          rating: number
          session_date: string | null
          survey_type: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          session_date?: string | null
          survey_type?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          session_date?: string | null
          survey_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_satisfaction_surveys_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      crm_analytics_snapshots: {
        Row: {
          active_members: number | null
          bundle_members: number | null
          bundle_mrr: number | null
          churned_members: number | null
          created_at: string
          customers_count: number | null
          id: string
          leads_count: number | null
          mental_performance_members: number | null
          mental_performance_mrr: number | null
          mrr: number | null
          new_clients: number | null
          prospects_count: number | null
          sleep_members: number | null
          sleep_mrr: number | null
          snapshot_date: string
          total_clients: number | null
          total_revenue: number | null
          vip_count: number | null
          wellness_members: number | null
          wellness_mrr: number | null
        }
        Insert: {
          active_members?: number | null
          bundle_members?: number | null
          bundle_mrr?: number | null
          churned_members?: number | null
          created_at?: string
          customers_count?: number | null
          id?: string
          leads_count?: number | null
          mental_performance_members?: number | null
          mental_performance_mrr?: number | null
          mrr?: number | null
          new_clients?: number | null
          prospects_count?: number | null
          sleep_members?: number | null
          sleep_mrr?: number | null
          snapshot_date?: string
          total_clients?: number | null
          total_revenue?: number | null
          vip_count?: number | null
          wellness_members?: number | null
          wellness_mrr?: number | null
        }
        Update: {
          active_members?: number | null
          bundle_members?: number | null
          bundle_mrr?: number | null
          churned_members?: number | null
          created_at?: string
          customers_count?: number | null
          id?: string
          leads_count?: number | null
          mental_performance_members?: number | null
          mental_performance_mrr?: number | null
          mrr?: number | null
          new_clients?: number | null
          prospects_count?: number | null
          sleep_members?: number | null
          sleep_mrr?: number | null
          snapshot_date?: string
          total_clients?: number | null
          total_revenue?: number | null
          vip_count?: number | null
          wellness_members?: number | null
          wellness_mrr?: number | null
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
          assigned_coach_id: string | null
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
          assigned_coach_id?: string | null
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
          assigned_coach_id?: string | null
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
          bundle_tier:
            | Database["public"]["Enums"]["bundle_membership_tier"]
            | null
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          mental_performance_tier:
            | Database["public"]["Enums"]["mental_performance_membership_tier"]
            | null
          monthly_price: number | null
          notes: string | null
          program_type: Database["public"]["Enums"]["program_type"]
          renewal_date: string | null
          sleep_tier:
            | Database["public"]["Enums"]["sleep_membership_tier"]
            | null
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
        }
        Insert: {
          bundle_tier?:
            | Database["public"]["Enums"]["bundle_membership_tier"]
            | null
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          mental_performance_tier?:
            | Database["public"]["Enums"]["mental_performance_membership_tier"]
            | null
          monthly_price?: number | null
          notes?: string | null
          program_type?: Database["public"]["Enums"]["program_type"]
          renewal_date?: string | null
          sleep_tier?:
            | Database["public"]["Enums"]["sleep_membership_tier"]
            | null
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Update: {
          bundle_tier?:
            | Database["public"]["Enums"]["bundle_membership_tier"]
            | null
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          mental_performance_tier?:
            | Database["public"]["Enums"]["mental_performance_membership_tier"]
            | null
          monthly_price?: number | null
          notes?: string | null
          program_type?: Database["public"]["Enums"]["program_type"]
          renewal_date?: string | null
          sleep_tier?:
            | Database["public"]["Enums"]["sleep_membership_tier"]
            | null
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
      mental_performance_assessments: {
        Row: {
          afternoon_energy_dip: number | null
          anxiety_frequency: number | null
          brain_fog: number | null
          caffeine_dependency: string | null
          client_id: string
          coach_id: string | null
          coach_notes: string | null
          cognitive_demands: string | null
          cognitive_function_score: number | null
          created_at: string
          emotional_resilience: number | null
          exercise_frequency: string | null
          focus_difficulty: number | null
          id: string
          intervention_plan: Json | null
          meditation_practice: boolean | null
          memory_issues: number | null
          mental_energy_score: number | null
          mental_fatigue: number | null
          mood_stability: number | null
          morning_mental_clarity: number | null
          motivation_level: number | null
          nutrition_quality: number | null
          peak_performance_hours: string | null
          phenotype:
            | Database["public"]["Enums"]["mental_performance_phenotype"]
            | null
          primary_mental_goals: string | null
          processing_speed: number | null
          program_tier: Database["public"]["Enums"]["mental_performance_tier"]
          screen_time_hours: number | null
          status: Database["public"]["Enums"]["mental_performance_status"]
          stress_level: number | null
          stress_resilience_score: number | null
          task_completion_ability: number | null
          updated_at: string
          work_type: string | null
        }
        Insert: {
          afternoon_energy_dip?: number | null
          anxiety_frequency?: number | null
          brain_fog?: number | null
          caffeine_dependency?: string | null
          client_id: string
          coach_id?: string | null
          coach_notes?: string | null
          cognitive_demands?: string | null
          cognitive_function_score?: number | null
          created_at?: string
          emotional_resilience?: number | null
          exercise_frequency?: string | null
          focus_difficulty?: number | null
          id?: string
          intervention_plan?: Json | null
          meditation_practice?: boolean | null
          memory_issues?: number | null
          mental_energy_score?: number | null
          mental_fatigue?: number | null
          mood_stability?: number | null
          morning_mental_clarity?: number | null
          motivation_level?: number | null
          nutrition_quality?: number | null
          peak_performance_hours?: string | null
          phenotype?:
            | Database["public"]["Enums"]["mental_performance_phenotype"]
            | null
          primary_mental_goals?: string | null
          processing_speed?: number | null
          program_tier?: Database["public"]["Enums"]["mental_performance_tier"]
          screen_time_hours?: number | null
          status?: Database["public"]["Enums"]["mental_performance_status"]
          stress_level?: number | null
          stress_resilience_score?: number | null
          task_completion_ability?: number | null
          updated_at?: string
          work_type?: string | null
        }
        Update: {
          afternoon_energy_dip?: number | null
          anxiety_frequency?: number | null
          brain_fog?: number | null
          caffeine_dependency?: string | null
          client_id?: string
          coach_id?: string | null
          coach_notes?: string | null
          cognitive_demands?: string | null
          cognitive_function_score?: number | null
          created_at?: string
          emotional_resilience?: number | null
          exercise_frequency?: string | null
          focus_difficulty?: number | null
          id?: string
          intervention_plan?: Json | null
          meditation_practice?: boolean | null
          memory_issues?: number | null
          mental_energy_score?: number | null
          mental_fatigue?: number | null
          mood_stability?: number | null
          morning_mental_clarity?: number | null
          motivation_level?: number | null
          nutrition_quality?: number | null
          peak_performance_hours?: string | null
          phenotype?:
            | Database["public"]["Enums"]["mental_performance_phenotype"]
            | null
          primary_mental_goals?: string | null
          processing_speed?: number | null
          program_tier?: Database["public"]["Enums"]["mental_performance_tier"]
          screen_time_hours?: number | null
          status?: Database["public"]["Enums"]["mental_performance_status"]
          stress_level?: number | null
          stress_resilience_score?: number | null
          task_completion_ability?: number | null
          updated_at?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_performance_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_performance_interventions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          program_tiers:
            | Database["public"]["Enums"]["mental_performance_tier"][]
            | null
          sequence_order: number | null
          target_phenotypes:
            | Database["public"]["Enums"]["mental_performance_phenotype"][]
            | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          program_tiers?:
            | Database["public"]["Enums"]["mental_performance_tier"][]
            | null
          sequence_order?: number | null
          target_phenotypes?:
            | Database["public"]["Enums"]["mental_performance_phenotype"][]
            | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          program_tiers?:
            | Database["public"]["Enums"]["mental_performance_tier"][]
            | null
          sequence_order?: number | null
          target_phenotypes?:
            | Database["public"]["Enums"]["mental_performance_phenotype"][]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      mental_performance_tracking: {
        Row: {
          anxiety_level: number | null
          assessment_id: string | null
          caffeine_intake: number | null
          client_id: string
          created_at: string
          deep_work_hours: number | null
          distractions_count: number | null
          entry_date: string
          exercise_completed: boolean | null
          factors_affecting_cognition: string | null
          focus_rating: number | null
          hrv_score: number | null
          id: string
          meditation_minutes: number | null
          memory_rating: number | null
          mental_clarity_rating: number | null
          mental_energy_rating: number | null
          mood_rating: number | null
          nature_exposure_minutes: number | null
          notes: string | null
          peak_focus_time: string | null
          productivity_rating: number | null
          readiness_score: number | null
          stress_level: number | null
          tasks_completed: number | null
          updated_at: string
        }
        Insert: {
          anxiety_level?: number | null
          assessment_id?: string | null
          caffeine_intake?: number | null
          client_id: string
          created_at?: string
          deep_work_hours?: number | null
          distractions_count?: number | null
          entry_date?: string
          exercise_completed?: boolean | null
          factors_affecting_cognition?: string | null
          focus_rating?: number | null
          hrv_score?: number | null
          id?: string
          meditation_minutes?: number | null
          memory_rating?: number | null
          mental_clarity_rating?: number | null
          mental_energy_rating?: number | null
          mood_rating?: number | null
          nature_exposure_minutes?: number | null
          notes?: string | null
          peak_focus_time?: string | null
          productivity_rating?: number | null
          readiness_score?: number | null
          stress_level?: number | null
          tasks_completed?: number | null
          updated_at?: string
        }
        Update: {
          anxiety_level?: number | null
          assessment_id?: string | null
          caffeine_intake?: number | null
          client_id?: string
          created_at?: string
          deep_work_hours?: number | null
          distractions_count?: number | null
          entry_date?: string
          exercise_completed?: boolean | null
          factors_affecting_cognition?: string | null
          focus_rating?: number | null
          hrv_score?: number | null
          id?: string
          meditation_minutes?: number | null
          memory_rating?: number | null
          mental_clarity_rating?: number | null
          mental_energy_rating?: number | null
          mood_rating?: number | null
          nature_exposure_minutes?: number | null
          notes?: string | null
          peak_focus_time?: string | null
          productivity_rating?: number | null
          readiness_score?: number | null
          stress_level?: number | null
          tasks_completed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mental_performance_tracking_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "mental_performance_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mental_performance_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
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
      sleep_assessments: {
        Row: {
          average_bedtime: string | null
          average_wake_time: string | null
          bedroom_temperature: string | null
          caffeine_intake: string | null
          client_id: string
          coach_id: string | null
          coach_notes: string | null
          created_at: string
          current_sleep_aids: string | null
          difficulty_falling_asleep: number | null
          difficulty_staying_asleep: number | null
          exercise_timing: string | null
          id: string
          intervention_plan: Json | null
          isi_score: number | null
          last_caffeine_time: string | null
          light_exposure: string | null
          medications: string | null
          noise_level: string | null
          phenotype: Database["public"]["Enums"]["sleep_phenotype"] | null
          primary_sleep_goals: string | null
          program_tier: Database["public"]["Enums"]["sleep_program_tier"]
          screen_time_before_bed: number | null
          sleep_distress: number | null
          sleep_environment_notes: string | null
          sleep_interference_daily: number | null
          sleep_quality_score: number | null
          sleep_satisfaction: number | null
          status: Database["public"]["Enums"]["sleep_assessment_status"]
          stress_level: number | null
          updated_at: string
          waking_too_early: number | null
        }
        Insert: {
          average_bedtime?: string | null
          average_wake_time?: string | null
          bedroom_temperature?: string | null
          caffeine_intake?: string | null
          client_id: string
          coach_id?: string | null
          coach_notes?: string | null
          created_at?: string
          current_sleep_aids?: string | null
          difficulty_falling_asleep?: number | null
          difficulty_staying_asleep?: number | null
          exercise_timing?: string | null
          id?: string
          intervention_plan?: Json | null
          isi_score?: number | null
          last_caffeine_time?: string | null
          light_exposure?: string | null
          medications?: string | null
          noise_level?: string | null
          phenotype?: Database["public"]["Enums"]["sleep_phenotype"] | null
          primary_sleep_goals?: string | null
          program_tier?: Database["public"]["Enums"]["sleep_program_tier"]
          screen_time_before_bed?: number | null
          sleep_distress?: number | null
          sleep_environment_notes?: string | null
          sleep_interference_daily?: number | null
          sleep_quality_score?: number | null
          sleep_satisfaction?: number | null
          status?: Database["public"]["Enums"]["sleep_assessment_status"]
          stress_level?: number | null
          updated_at?: string
          waking_too_early?: number | null
        }
        Update: {
          average_bedtime?: string | null
          average_wake_time?: string | null
          bedroom_temperature?: string | null
          caffeine_intake?: string | null
          client_id?: string
          coach_id?: string | null
          coach_notes?: string | null
          created_at?: string
          current_sleep_aids?: string | null
          difficulty_falling_asleep?: number | null
          difficulty_staying_asleep?: number | null
          exercise_timing?: string | null
          id?: string
          intervention_plan?: Json | null
          isi_score?: number | null
          last_caffeine_time?: string | null
          light_exposure?: string | null
          medications?: string | null
          noise_level?: string | null
          phenotype?: Database["public"]["Enums"]["sleep_phenotype"] | null
          primary_sleep_goals?: string | null
          program_tier?: Database["public"]["Enums"]["sleep_program_tier"]
          screen_time_before_bed?: number | null
          sleep_distress?: number | null
          sleep_environment_notes?: string | null
          sleep_interference_daily?: number | null
          sleep_quality_score?: number | null
          sleep_satisfaction?: number | null
          status?: Database["public"]["Enums"]["sleep_assessment_status"]
          stress_level?: number | null
          updated_at?: string
          waking_too_early?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_interventions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          program_tiers:
            | Database["public"]["Enums"]["sleep_program_tier"][]
            | null
          sequence_order: number | null
          target_phenotypes:
            | Database["public"]["Enums"]["sleep_phenotype"][]
            | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          program_tiers?:
            | Database["public"]["Enums"]["sleep_program_tier"][]
            | null
          sequence_order?: number | null
          target_phenotypes?:
            | Database["public"]["Enums"]["sleep_phenotype"][]
            | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          program_tiers?:
            | Database["public"]["Enums"]["sleep_program_tier"][]
            | null
          sequence_order?: number | null
          target_phenotypes?:
            | Database["public"]["Enums"]["sleep_phenotype"][]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      sleep_tracking_entries: {
        Row: {
          assessment_id: string | null
          bedtime: string | null
          client_id: string
          created_at: string
          daytime_focus_rating: number | null
          deep_sleep_hours: number | null
          entry_date: string
          factors_affecting_sleep: string | null
          hrv_score: number | null
          id: string
          light_sleep_hours: number | null
          mood_rating: number | null
          morning_energy_rating: number | null
          night_awakenings: number | null
          notes: string | null
          recovery_score: number | null
          rem_sleep_hours: number | null
          resting_heart_rate: number | null
          sleep_onset_minutes: number | null
          sleep_quality_rating: number | null
          stress_resilience_rating: number | null
          time_awake_minutes: number | null
          total_sleep_hours: number | null
          updated_at: string
          wake_time: string | null
        }
        Insert: {
          assessment_id?: string | null
          bedtime?: string | null
          client_id: string
          created_at?: string
          daytime_focus_rating?: number | null
          deep_sleep_hours?: number | null
          entry_date?: string
          factors_affecting_sleep?: string | null
          hrv_score?: number | null
          id?: string
          light_sleep_hours?: number | null
          mood_rating?: number | null
          morning_energy_rating?: number | null
          night_awakenings?: number | null
          notes?: string | null
          recovery_score?: number | null
          rem_sleep_hours?: number | null
          resting_heart_rate?: number | null
          sleep_onset_minutes?: number | null
          sleep_quality_rating?: number | null
          stress_resilience_rating?: number | null
          time_awake_minutes?: number | null
          total_sleep_hours?: number | null
          updated_at?: string
          wake_time?: string | null
        }
        Update: {
          assessment_id?: string | null
          bedtime?: string | null
          client_id?: string
          created_at?: string
          daytime_focus_rating?: number | null
          deep_sleep_hours?: number | null
          entry_date?: string
          factors_affecting_sleep?: string | null
          hrv_score?: number | null
          id?: string
          light_sleep_hours?: number | null
          mood_rating?: number | null
          morning_energy_rating?: number | null
          night_awakenings?: number | null
          notes?: string | null
          recovery_score?: number | null
          rem_sleep_hours?: number | null
          resting_heart_rate?: number | null
          sleep_onset_minutes?: number | null
          sleep_quality_rating?: number | null
          stress_resilience_rating?: number | null
          time_awake_minutes?: number | null
          total_sleep_hours?: number | null
          updated_at?: string
          wake_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_tracking_entries_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "sleep_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleep_tracking_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
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
      bundle_membership_tier:
        | "essential_recovery"
        | "performance_recovery"
        | "elite_recovery"
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
      mental_performance_membership_tier:
        | "cognitive_foundations"
        | "performance_optimization"
        | "elite_cognition"
      mental_performance_phenotype:
        | "focus_deficit"
        | "memory_challenged"
        | "stress_reactive"
        | "energy_depleted"
        | "mood_fluctuating"
      mental_performance_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "reviewed"
      mental_performance_tier:
        | "cognitive_foundations"
        | "performance_optimization"
        | "elite_cognition"
      program_type: "wellness" | "sleep" | "mental_performance" | "bundle"
      purchase_type:
        | "subscription"
        | "one_time"
        | "supplement"
        | "service"
        | "lab_testing"
      sleep_assessment_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "reviewed"
      sleep_membership_tier: "foundational" | "enhanced" | "premium"
      sleep_phenotype:
        | "stress_dominant"
        | "circadian_shifted"
        | "fragmented"
        | "short_duration"
        | "recovery_deficient"
      sleep_program_tier: "foundational" | "advanced" | "elite"
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
      bundle_membership_tier: [
        "essential_recovery",
        "performance_recovery",
        "elite_recovery",
      ],
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
      mental_performance_membership_tier: [
        "cognitive_foundations",
        "performance_optimization",
        "elite_cognition",
      ],
      mental_performance_phenotype: [
        "focus_deficit",
        "memory_challenged",
        "stress_reactive",
        "energy_depleted",
        "mood_fluctuating",
      ],
      mental_performance_status: [
        "pending",
        "in_progress",
        "completed",
        "reviewed",
      ],
      mental_performance_tier: [
        "cognitive_foundations",
        "performance_optimization",
        "elite_cognition",
      ],
      program_type: ["wellness", "sleep", "mental_performance", "bundle"],
      purchase_type: [
        "subscription",
        "one_time",
        "supplement",
        "service",
        "lab_testing",
      ],
      sleep_assessment_status: [
        "pending",
        "in_progress",
        "completed",
        "reviewed",
      ],
      sleep_membership_tier: ["foundational", "enhanced", "premium"],
      sleep_phenotype: [
        "stress_dominant",
        "circadian_shifted",
        "fragmented",
        "short_duration",
        "recovery_deficient",
      ],
      sleep_program_tier: ["foundational", "advanced", "elite"],
    },
  },
} as const
