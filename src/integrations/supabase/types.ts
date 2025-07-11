export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      benchmarks: {
        Row: {
          benchmark_type: string
          created_at: string
          description: string | null
          id: string
          indicator_id: string
          target_value: number
          updated_at: string
        }
        Insert: {
          benchmark_type?: string
          created_at?: string
          description?: string | null
          id?: string
          indicator_id: string
          target_value: number
          updated_at?: string
        }
        Update: {
          benchmark_type?: string
          created_at?: string
          description?: string | null
          id?: string
          indicator_id?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benchmarks_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
        ]
      }
      domains: {
        Row: {
          Description: string | null
          domain_id: string
          indicator_id: string | null
          level: number
          name: string
          parent_id: string | null
        }
        Insert: {
          Description?: string | null
          domain_id?: string
          indicator_id?: string | null
          level: number
          name: string
          parent_id?: string | null
        }
        Update: {
          Description?: string | null
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
          age_group: string | null
          created_at: string | null
          email: string
          first_name: string
          gender: string | null
          has_completed_onboarding: boolean | null
          id: string
          location_id: string | null
          phone_number: string | null
          profile_photo: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          email: string
          first_name: string
          gender?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          location_id?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string | null
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
          vote_count: number | null
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
          vote_count?: number | null
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
          vote_count?: number | null
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
      story_votes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_votes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "qualitative_stories"
            referencedColumns: ["story_id"]
          },
        ]
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
      survey_notifications: {
        Row: {
          delivery_status: string | null
          id: string
          message_content: string | null
          notification_type: string
          sent_at: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          delivery_status?: string | null
          id?: string
          message_content?: string | null
          notification_type: string
          sent_at?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          delivery_status?: string | null
          id?: string
          message_content?: string | null
          notification_type?: string
          sent_at?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_notifications_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "survey_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      survey_responses: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string | null
          qualitative_text: string | null
          quantitative_value: number | null
          question_id: string
          raw_transcript: string | null
          response_type: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          qualitative_text?: string | null
          quantitative_value?: number | null
          question_id: string
          raw_transcript?: string | null
          response_type?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          qualitative_text?: string | null
          quantitative_value?: number | null
          question_id?: string
          raw_transcript?: string | null
          response_type?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          applicable_roles: string[] | null
          approved_at: string | null
          approved_by: string | null
          approved_by_rep: string | null
          created_at: string | null
          created_by: string | null
          declined_reason: string | null
          demographic_filters: Json | null
          description: string | null
          domain: string
          estimated_duration_minutes: number | null
          is_compulsory: boolean | null
          is_voice_enabled: boolean | null
          justification: string | null
          status: string | null
          survey_id: string
          target_location: string
          title: string
        }
        Insert: {
          applicable_roles?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_rep?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_reason?: string | null
          demographic_filters?: Json | null
          description?: string | null
          domain: string
          estimated_duration_minutes?: number | null
          is_compulsory?: boolean | null
          is_voice_enabled?: boolean | null
          justification?: string | null
          status?: string | null
          survey_id?: string
          target_location: string
          title: string
        }
        Update: {
          applicable_roles?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_rep?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_reason?: string | null
          demographic_filters?: Json | null
          description?: string | null
          domain?: string
          estimated_duration_minutes?: number | null
          is_compulsory?: boolean | null
          is_voice_enabled?: boolean | null
          justification?: string | null
          status?: string | null
          survey_id?: string
          target_location?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_approved_by_rep_fkey"
            columns: ["approved_by_rep"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      voice_call_attempts: {
        Row: {
          attempted_at: string | null
          call_duration_seconds: number | null
          completed_at: string | null
          created_at: string | null
          failure_reason: string | null
          id: string
          phone_number: string
          reschedule_requested_at: string | null
          scheduled_at: string
          status: string | null
          survey_id: string
          twilio_call_sid: string | null
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          call_duration_seconds?: number | null
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          phone_number: string
          reschedule_requested_at?: string | null
          scheduled_at: string
          status?: string | null
          survey_id: string
          twilio_call_sid?: string | null
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          call_duration_seconds?: number | null
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          phone_number?: string
          reschedule_requested_at?: string | null
          scheduled_at?: string
          status?: string | null
          survey_id?: string
          twilio_call_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_call_attempts_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "voice_call_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_survey_duration: {
        Args: { survey_id_param: string }
        Returns: number
      }
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
      get_survey_target_users: {
        Args: { survey_id_param: string; location_id_param: string }
        Returns: {
          user_id: string
          phone_number: string
          gender: string
          age_group: string
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
    Enums: {},
  },
} as const
