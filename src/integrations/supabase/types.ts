export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_inputs: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          indicator_id: string
          input_type: string
          rationale: string | null
          value: number
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          indicator_id: string
          input_type: string
          rationale?: string | null
          value: number
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          indicator_id?: string
          input_type?: string
          rationale?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_inputs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_inputs_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      domains: {
        Row: {
          domain_id: string
          indicator_id: string | null
          level: number
          name: string
          parent_id: string | null
        }
        Insert: {
          domain_id?: string
          indicator_id?: string | null
          level: number
          name: string
          parent_id?: string | null
        }
        Update: {
          domain_id?: string
          indicator_id?: string | null
          level?: number
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "domains_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["domain_id"]
          },
        ]
      }
      flagged_responses: {
        Row: {
          created_at: string | null
          flag_reason: string
          id: string
          rep_id: string | null
          response_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag_reason: string
          id?: string
          rep_id?: string | null
          response_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag_reason?: string
          id?: string
          rep_id?: string | null
          response_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flagged_responses_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_responses_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "relationship_user_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "flagged_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_trends: {
        Row: {
          created_at: string | null
          indicator_id: string
          trend_id: string
          value: number
          year: number
        }
        Insert: {
          created_at?: string | null
          indicator_id: string
          trend_id?: string
          value: number
          year: number
        }
        Update: {
          created_at?: string | null
          indicator_id?: string
          trend_id?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "historical_trends_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      indicator_values: {
        Row: {
          created_at: string
          indicator_id: string
          location_id: string
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          created_at?: string
          indicator_id: string
          location_id: string
          updated_at?: string
          value: number
          year: number
        }
        Update: {
          created_at?: string
          indicator_id?: string
          location_id?: string
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicator_values_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "indicator_values_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
          },
        ]
      }
      indicators: {
        Row: {
          category: string
          code: number | null
          created_at: string | null
          current_value: number
          description: string | null
          indicator_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          code?: number | null
          created_at?: string | null
          current_value: number
          description?: string | null
          indicator_id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: number | null
          created_at?: string | null
          current_value?: number
          description?: string | null
          indicator_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          location_id: string
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          location_id?: string
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          location_id?: string
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          has_completed_onboarding: boolean | null
          id: string
          location_id: string | null
          phone_number: string | null
          profile_photo: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          has_completed_onboarding?: boolean | null
          id: string
          location_id?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          has_completed_onboarding?: boolean | null
          id?: string
          location_id?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
          },
        ]
      }
      qualitative_stories: {
        Row: {
          author: string
          child_id: string
          created_at: string
          location: string | null
          parent_id: string
          photo: string | null
          story_id: string
          story_text: string
        }
        Insert: {
          author: string
          child_id: string
          created_at?: string
          location?: string | null
          parent_id: string
          photo?: string | null
          story_id?: string
          story_text: string
        }
        Update: {
          author?: string
          child_id?: string
          created_at?: string
          location?: string | null
          parent_id?: string
          photo?: string | null
          story_id?: string
          story_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualitative_stories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "qualitative_stories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      relationship_domains: {
        Row: {
          domain_id: string
          relationship_id: string
        }
        Insert: {
          domain_id: string
          relationship_id: string
        }
        Update: {
          domain_id?: string
          relationship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_domains_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["domain_id"]
          },
          {
            foreignKeyName: "relationship_domains_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["relationship_id"]
          },
        ]
      }
      relationship_user_responses: {
        Row: {
          additional_indicator_ids: string[] | null
          child_id: string
          created_at: string | null
          direction: string
          domain: string
          notes_file_url: string | null
          parent_id: string
          response_id: string
          strength_score: number
          user_id: string
        }
        Insert: {
          additional_indicator_ids?: string[] | null
          child_id: string
          created_at?: string | null
          direction: string
          domain: string
          notes_file_url?: string | null
          parent_id: string
          response_id?: string
          strength_score: number
          user_id: string
        }
        Update: {
          additional_indicator_ids?: string[] | null
          child_id?: string
          created_at?: string | null
          direction?: string
          domain?: string
          notes_file_url?: string | null
          parent_id?: string
          response_id?: string
          strength_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_user_responses_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "relationship_user_responses_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      relationships: {
        Row: {
          child_id: string
          child_to_parent_weight: number | null
          created_at: string | null
          influence_score: number
          influence_weight: number
          parent_id: string
          relationship_id: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          child_to_parent_weight?: number | null
          created_at?: string | null
          influence_score?: number
          influence_weight: number
          parent_id: string
          relationship_id?: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          child_to_parent_weight?: number | null
          created_at?: string | null
          influence_score?: number
          influence_weight?: number
          parent_id?: string
          relationship_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationships_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      rep_tasks: {
        Row: {
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          rep_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          rep_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          rep_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rep_tasks_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      researcher_credits: {
        Row: {
          action_type: string
          created_at: string | null
          credits: number
          description: string | null
          id: string
          researcher_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          credits?: number
          description?: string | null
          id?: string
          researcher_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          credits?: number
          description?: string | null
          id?: string
          researcher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "researcher_credits_researcher_id_fkey"
            columns: ["researcher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_changes: {
        Row: {
          change_id: string
          created_at: string | null
          indicator_id: string
          new_value: number
          previous_value: number
          simulation_id: string
        }
        Insert: {
          change_id?: string
          created_at?: string | null
          indicator_id: string
          new_value: number
          previous_value: number
          simulation_id: string
        }
        Update: {
          change_id?: string
          created_at?: string | null
          indicator_id?: string
          new_value?: number
          previous_value?: number
          simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_changes_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "simulation_changes_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulation_profiles"
            referencedColumns: ["simulation_id"]
          },
        ]
      }
      simulation_profiles: {
        Row: {
          created_at: string | null
          description: string | null
          name: string
          simulation_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          name: string
          simulation_id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          name?: string
          simulation_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      survey_control: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          survey_id: string
          target_locations: string[] | null
          target_roles: string[]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          survey_id: string
          target_locations?: string[] | null
          target_roles: string[]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          survey_id?: string
          target_locations?: string[] | null
          target_roles?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "survey_control_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_control_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["survey_id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          allow_additional_indicator: boolean | null
          allow_file_upload: boolean | null
          branching_condition: string | null
          child_indicator_id: string
          created_at: string | null
          input_type: string | null
          is_required: boolean | null
          parent_indicator_id: string
          prompt: string
          question_id: string
          survey_id: string
        }
        Insert: {
          allow_additional_indicator?: boolean | null
          allow_file_upload?: boolean | null
          branching_condition?: string | null
          child_indicator_id: string
          created_at?: string | null
          input_type?: string | null
          is_required?: boolean | null
          parent_indicator_id: string
          prompt: string
          question_id?: string
          survey_id: string
        }
        Update: {
          allow_additional_indicator?: boolean | null
          allow_file_upload?: boolean | null
          branching_condition?: string | null
          child_indicator_id?: string
          created_at?: string | null
          input_type?: string | null
          is_required?: boolean | null
          parent_indicator_id?: string
          prompt?: string
          question_id?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_child_indicator_id_fkey"
            columns: ["child_indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "survey_questions_parent_indicator_id_fkey"
            columns: ["parent_indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["survey_id"]
          },
        ]
      }
      surveys: {
        Row: {
          applicable_roles: string[] | null
          created_at: string | null
          created_by: string | null
          domain: string
          is_compulsory: boolean | null
          status: string | null
          survey_id: string
          title: string
        }
        Insert: {
          applicable_roles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          domain: string
          is_compulsory?: boolean | null
          status?: string | null
          survey_id?: string
          title: string
        }
        Update: {
          applicable_roles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          domain?: string
          is_compulsory?: boolean | null
          status?: string | null
          survey_id?: string
          title?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_type: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_type: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          points_awarded: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      user_vouchers: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_redeemed: boolean | null
          partner_name: string
          user_id: string
          value: string
          voucher_code: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean | null
          partner_name: string
          user_id: string
          value: string
          voucher_code: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_redeemed?: boolean | null
          partner_name?: string
          user_id?: string
          value?: string
          voucher_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_location_children: {
        Args: { parent_location_id?: string }
        Returns: {
          location_id: string
          name: string
          type: string
          parent_id: string
        }[]
      }
      get_location_path: {
        Args: { target_location_id: string }
        Returns: {
          location_id: string
          name: string
          type: string
          depth: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
