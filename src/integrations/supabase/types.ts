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
      community_actions: {
        Row: {
          action_template: string | null
          action_type: string
          created_at: string | null
          description: string
          difficulty_level: number | null
          dynamic_fields: Json | null
          id: string
          impact_potential: number | null
          indicator_id: string | null
          insights_reward: number | null
          location_type: string | null
          target_demographic: Json | null
          time_requirement: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_template?: string | null
          action_type: string
          created_at?: string | null
          description: string
          difficulty_level?: number | null
          dynamic_fields?: Json | null
          id?: string
          impact_potential?: number | null
          indicator_id?: string | null
          insights_reward?: number | null
          location_type?: string | null
          target_demographic?: Json | null
          time_requirement?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_template?: string | null
          action_type?: string
          created_at?: string | null
          description?: string
          difficulty_level?: number | null
          dynamic_fields?: Json | null
          id?: string
          impact_potential?: number | null
          indicator_id?: string | null
          insights_reward?: number | null
          location_type?: string | null
          target_demographic?: Json | null
          time_requirement?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          badge_reward: string | null
          created_at: string | null
          description: string
          id: string
          insights_reward: number | null
          is_daily: boolean | null
          is_weekly: boolean | null
          quest_type: string
          target_value: number
          title: string
        }
        Insert: {
          badge_reward?: string | null
          created_at?: string | null
          description: string
          id?: string
          insights_reward?: number | null
          is_daily?: boolean | null
          is_weekly?: boolean | null
          quest_type: string
          target_value: number
          title: string
        }
        Update: {
          badge_reward?: string | null
          created_at?: string | null
          description?: string
          id?: string
          insights_reward?: number | null
          is_daily?: boolean | null
          is_weekly?: boolean | null
          quest_type?: string
          target_value?: number
          title?: string
        }
        Relationships: []
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
      learning_achievements: {
        Row: {
          achievement_type: string
          badge_granted: string | null
          created_at: string | null
          description: string
          icon_name: string | null
          id: string
          insights_reward: number | null
          title: string
          unlock_condition: Json
        }
        Insert: {
          achievement_type: string
          badge_granted?: string | null
          created_at?: string | null
          description: string
          icon_name?: string | null
          id?: string
          insights_reward?: number | null
          title: string
          unlock_condition: Json
        }
        Update: {
          achievement_type?: string
          badge_granted?: string | null
          created_at?: string | null
          description?: string
          icon_name?: string | null
          id?: string
          insights_reward?: number | null
          title?: string
          unlock_condition?: Json
        }
        Relationships: []
      }
      learning_nodes: {
        Row: {
          created_at: string | null
          day_in_week: number | null
          description: string | null
          difficulty_level: string | null
          estimated_minutes: number | null
          id: string
          node_type: string
          sequence_day: number
          title: string
          unlock_requirements: Json | null
          week_number: number | null
        }
        Insert: {
          created_at?: string | null
          day_in_week?: number | null
          description?: string | null
          difficulty_level?: string | null
          estimated_minutes?: number | null
          id?: string
          node_type: string
          sequence_day: number
          title: string
          unlock_requirements?: Json | null
          week_number?: number | null
        }
        Update: {
          created_at?: string | null
          day_in_week?: number | null
          description?: string | null
          difficulty_level?: string | null
          estimated_minutes?: number | null
          id?: string
          node_type?: string
          sequence_day?: number
          title?: string
          unlock_requirements?: Json | null
          week_number?: number | null
        }
        Relationships: []
      }
      local_context: {
        Row: {
          address: string | null
          contact_info: Json | null
          context_type: string | null
          current_status: string | null
          data_source: string | null
          description: string | null
          id: string
          last_updated: string | null
          location_id: string | null
          name: string
          operating_hours: Json | null
          relevant_indicators: string[] | null
          tags: string[] | null
        }
        Insert: {
          address?: string | null
          contact_info?: Json | null
          context_type?: string | null
          current_status?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          location_id?: string | null
          name: string
          operating_hours?: Json | null
          relevant_indicators?: string[] | null
          tags?: string[] | null
        }
        Update: {
          address?: string | null
          contact_info?: Json | null
          context_type?: string | null
          current_status?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          location_id?: string | null
          name?: string
          operating_hours?: Json | null
          relevant_indicators?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      local_measurements: {
        Row: {
          community_confidence: number | null
          created_at: string | null
          current_state_rating: number
          id: string
          improvement_suggestions: string | null
          indicator_id: string | null
          location_id: string | null
          node_id: string | null
          personal_confidence: number
          qualitative_notes: string | null
          response_time_seconds: number | null
          trend_direction: number
          user_id: string | null
        }
        Insert: {
          community_confidence?: number | null
          created_at?: string | null
          current_state_rating: number
          id?: string
          improvement_suggestions?: string | null
          indicator_id?: string | null
          location_id?: string | null
          node_id?: string | null
          personal_confidence: number
          qualitative_notes?: string | null
          response_time_seconds?: number | null
          trend_direction: number
          user_id?: string | null
        }
        Update: {
          community_confidence?: number | null
          created_at?: string | null
          current_state_rating?: number
          id?: string
          improvement_suggestions?: string | null
          indicator_id?: string | null
          location_id?: string | null
          node_id?: string | null
          personal_confidence?: number
          qualitative_notes?: string | null
          response_time_seconds?: number | null
          trend_direction?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_measurements_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "local_measurements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "local_measurements_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      notification_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          time_hour: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          time_hour?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          time_hour?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      path_content_templates: {
        Row: {
          content_rules: Json
          created_at: string | null
          description_template: string
          difficulty_level: string
          id: string
          node_type: string
          prerequisites: Json | null
          title_template: string
        }
        Insert: {
          content_rules: Json
          created_at?: string | null
          description_template: string
          difficulty_level: string
          id?: string
          node_type: string
          prerequisites?: Json | null
          title_template: string
        }
        Update: {
          content_rules?: Json
          created_at?: string | null
          description_template?: string
          difficulty_level?: string
          id?: string
          node_type?: string
          prerequisites?: Json | null
          title_template?: string
        }
        Relationships: []
      }
      path_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          insights_earned: number | null
          status: string | null
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          insights_earned?: number | null
          status?: string | null
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          insights_earned?: number | null
          status?: string | null
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_results: {
        Row: {
          concept_score: number | null
          confidence_score: number | null
          created_at: string | null
          domain: string
          id: string
          total_score: number | null
          understanding_score: number | null
          unlocked_to_unit: number | null
          user_id: string
        }
        Insert: {
          concept_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          domain: string
          id?: string
          total_score?: number | null
          understanding_score?: number | null
          unlocked_to_unit?: number | null
          user_id: string
        }
        Update: {
          concept_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          domain?: string
          id?: string
          total_score?: number | null
          understanding_score?: number | null
          unlocked_to_unit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          age_group: string | null
          avatar_data: string | null
          avatar_type: string | null
          created_at: string | null
          daily_goal: number | null
          email: string
          family_status: string | null
          first_name: string
          gender: string | null
          has_completed_onboarding: boolean | null
          hearts: number | null
          id: string
          insights: number | null
          interests: string[] | null
          knowledge_level: number | null
          last_session: string | null
          location_id: string | null
          mobility_level: string | null
          occupation_sector: string | null
          phone_number: string | null
          profile_photo: string | null
          role: string
          selected_domain: string | null
          streak: number | null
          time_availability: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          age_group?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          created_at?: string | null
          daily_goal?: number | null
          email: string
          family_status?: string | null
          first_name: string
          gender?: string | null
          has_completed_onboarding?: boolean | null
          hearts?: number | null
          id: string
          insights?: number | null
          interests?: string[] | null
          knowledge_level?: number | null
          last_session?: string | null
          location_id?: string | null
          mobility_level?: string | null
          occupation_sector?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          role?: string
          selected_domain?: string | null
          streak?: number | null
          time_availability?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          age_group?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          created_at?: string | null
          daily_goal?: number | null
          email?: string
          family_status?: string | null
          first_name?: string
          gender?: string | null
          has_completed_onboarding?: boolean | null
          hearts?: number | null
          id?: string
          insights?: number | null
          interests?: string[] | null
          knowledge_level?: number | null
          last_session?: string | null
          location_id?: string | null
          mobility_level?: string | null
          occupation_sector?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          role?: string
          selected_domain?: string | null
          streak?: number | null
          time_availability?: string | null
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
          confidence_score: number | null
          created_at: string | null
          direction: string
          domain: string
          node_id: string | null
          notes_file_url: string | null
          parent_id: string
          response_id: string
          strength_score: number
          user_id: string
        }
        Insert: {
          additional_indicator_ids?: string[] | null
          child_id: string
          confidence_score?: number | null
          created_at?: string | null
          direction: string
          domain: string
          node_id?: string | null
          notes_file_url?: string | null
          parent_id: string
          response_id?: string
          strength_score: number
          user_id: string
        }
        Update: {
          additional_indicator_ids?: string[] | null
          child_id?: string
          confidence_score?: number | null
          created_at?: string | null
          direction?: string
          domain?: string
          node_id?: string | null
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
            foreignKeyName: "relationship_user_responses_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_nodes"
            referencedColumns: ["id"]
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
      story_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "qualitative_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          learning_context: Json | null
          node_id: string | null
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
          learning_context?: Json | null
          node_id?: string | null
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
          learning_context?: Json | null
          node_id?: string | null
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
            foreignKeyName: "survey_responses_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_nodes"
            referencedColumns: ["id"]
          },
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
      user_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          progress_data: Json | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "learning_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
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
      user_community_actions: {
        Row: {
          action_id: string | null
          completed_date: string | null
          completion_notes: string | null
          created_at: string | null
          id: string
          impact_rating: number | null
          insights_earned: number | null
          recommended_date: string | null
          user_id: string | null
        }
        Insert: {
          action_id?: string | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          impact_rating?: number | null
          insights_earned?: number | null
          recommended_date?: string | null
          user_id?: string | null
        }
        Update: {
          action_id?: string | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          impact_rating?: number | null
          insights_earned?: number | null
          recommended_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_community_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "community_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_community_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_quests: {
        Row: {
          assigned_date: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          insights_earned: number | null
          quest_id: string | null
          target_progress: number
          user_id: string | null
        }
        Insert: {
          assigned_date?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          insights_earned?: number | null
          quest_id?: string | null
          target_progress: number
          user_id?: string | null
        }
        Update: {
          assigned_date?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          insights_earned?: number | null
          quest_id?: string | null
          target_progress?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_domain_progress: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          domain_id: string | null
          domain_level: number
          id: string
          last_explored_day: number | null
          proficiency_score: number | null
          times_explored: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          domain_id?: string | null
          domain_level: number
          id?: string
          last_explored_day?: number | null
          proficiency_score?: number | null
          times_explored?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          domain_id?: string | null
          domain_level?: number
          id?: string
          last_explored_day?: number | null
          proficiency_score?: number | null
          times_explored?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_domain_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_indicator_history: {
        Row: {
          cooldown_until_day: number
          created_at: string | null
          domain_context: string | null
          id: string
          indicator_id: string | null
          usage_day: number
          usage_type: string
          user_id: string | null
        }
        Insert: {
          cooldown_until_day: number
          created_at?: string | null
          domain_context?: string | null
          id?: string
          indicator_id?: string | null
          usage_day: number
          usage_type: string
          user_id?: string | null
        }
        Update: {
          cooldown_until_day?: number
          created_at?: string | null
          domain_context?: string | null
          id?: string
          indicator_id?: string | null
          usage_day?: number
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_indicator_history_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "user_indicator_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_preferences: {
        Row: {
          avg_session_length_minutes: number | null
          challenge_level: string | null
          consistency_pattern: Json | null
          created_at: string | null
          difficulty_progression_rate: number | null
          enjoys_comparisons: boolean | null
          likes_qualitative: boolean | null
          likes_quantitative: boolean | null
          optimal_session_length: number | null
          prefers_daily_consistency: boolean | null
          prefers_deep_dive: boolean | null
          prefers_local_focus: boolean | null
          prefers_variety: boolean | null
          updated_at: string | null
          user_id: string
          weekend_activity_level: string | null
        }
        Insert: {
          avg_session_length_minutes?: number | null
          challenge_level?: string | null
          consistency_pattern?: Json | null
          created_at?: string | null
          difficulty_progression_rate?: number | null
          enjoys_comparisons?: boolean | null
          likes_qualitative?: boolean | null
          likes_quantitative?: boolean | null
          optimal_session_length?: number | null
          prefers_daily_consistency?: boolean | null
          prefers_deep_dive?: boolean | null
          prefers_local_focus?: boolean | null
          prefers_variety?: boolean | null
          updated_at?: string | null
          user_id: string
          weekend_activity_level?: string | null
        }
        Update: {
          avg_session_length_minutes?: number | null
          challenge_level?: string | null
          consistency_pattern?: Json | null
          created_at?: string | null
          difficulty_progression_rate?: number | null
          enjoys_comparisons?: boolean | null
          likes_qualitative?: boolean | null
          likes_quantitative?: boolean | null
          optimal_session_length?: number | null
          prefers_daily_consistency?: boolean | null
          prefers_deep_dive?: boolean | null
          prefers_local_focus?: boolean | null
          prefers_variety?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekend_activity_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_node_progress: {
        Row: {
          completed_at: string | null
          completion_data: Json | null
          created_at: string | null
          hearts_spent: number | null
          id: string
          insights_earned: number | null
          is_practice_mode: boolean | null
          node_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          hearts_spent?: number | null
          id?: string
          insights_earned?: number | null
          is_practice_mode?: boolean | null
          node_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          hearts_spent?: number | null
          id?: string
          insights_earned?: number | null
          is_practice_mode?: boolean | null
          node_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_node_progress_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_node_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_path_state: {
        Row: {
          created_at: string | null
          current_day: number
          current_streak: number | null
          exploration_domains: string[] | null
          furthest_unlocked_day: number
          last_session_date: string | null
          longest_streak: number | null
          preferred_domains: string[] | null
          total_days_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_day?: number
          current_streak?: number | null
          exploration_domains?: string[] | null
          furthest_unlocked_day?: number
          last_session_date?: string | null
          longest_streak?: number | null
          preferred_domains?: string[] | null
          total_days_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_day?: number
          current_streak?: number | null
          exploration_domains?: string[] | null
          furthest_unlocked_day?: number
          last_session_date?: string | null
          longest_streak?: number | null
          preferred_domains?: string[] | null
          total_days_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_path_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      get_leaderboard_data: {
        Args: { p_location_id?: string }
        Returns: {
          badge_count: number
          current_streak: number
          first_name: string
          league_tier: string
          rank_position: number
          survey_count: number
          total_points: number
          user_id: string
        }[]
      }
      get_location_children: {
        Args: { parent_location_id?: string }
        Returns: {
          location_id: string
          name: string
          parent_id: string
          type: string
        }[]
      }
      get_location_path: {
        Args: { target_location_id: string }
        Returns: {
          depth: number
          location_id: string
          name: string
          type: string
        }[]
      }
      get_node_for_day: { Args: { day: number }; Returns: string }
      get_survey_target_users: {
        Args: { location_id_param: string; survey_id_param: string }
        Returns: {
          age_group: string
          gender: string
          phone_number: string
          user_id: string
        }[]
      }
      increment_insights: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      update_quest_progress: {
        Args: {
          p_date: string
          p_increment: number
          p_quest_type: string
          p_user_id: string
        }
        Returns: undefined
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
