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
        Relationships: []
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
          created_at: string | null
          description: string | null
          id: string
          indicator_id: string | null
          level: number
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          indicator_id?: string | null
          level: number
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          indicator_id?: string | null
          level?: number
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_domains_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_domains_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
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
        Relationships: []
      }
      indicator_relationships: {
        Row: {
          calculated_at: string | null
          child_indicator_id: string
          correlation_coefficient: number | null
          parent_indicator_id: string
          sample_size: number | null
        }
        Insert: {
          calculated_at?: string | null
          child_indicator_id: string
          correlation_coefficient?: number | null
          parent_indicator_id: string
          sample_size?: number | null
        }
        Update: {
          calculated_at?: string | null
          child_indicator_id?: string
          correlation_coefficient?: number | null
          parent_indicator_id?: string
          sample_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "new_indicator_relationships_child_indicator_id_fkey"
            columns: ["child_indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_indicator_relationships_parent_indicator_id_fkey"
            columns: ["parent_indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
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
          code: string
          created_at: string | null
          description: string | null
          id: string
          measurement_type: string
          name: string
          scale_config: Json
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_type: string
          name: string
          scale_config?: Json
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_type?: string
          name?: string
          scale_config?: Json
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
          day_number: number
          description: string | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          node_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          day_number: number
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          node_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          day_number?: number
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          node_type?: string
          title?: string
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
            foreignKeyName: "local_measurements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
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
      profiles: {
        Row: {
          age: number | null
          age_group: string | null
          avatar_data: string | null
          avatar_type: string | null
          created_at: string | null
          daily_goal: number | null
          email: string
          exploration_preferences: Json | null
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
          preferred_domains: string[] | null
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
          exploration_preferences?: Json | null
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
          preferred_domains?: string[] | null
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
          exploration_preferences?: Json | null
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
          preferred_domains?: string[] | null
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
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualitative_stories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
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
        Relationships: []
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
      story_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "qualitative_stories"
            referencedColumns: ["story_id"]
          },
          {
            foreignKeyName: "story_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          completion_count: number | null
          cooldown_until: string | null
          domain_id: string
          is_unlocked: boolean | null
          last_completed_at: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          completion_count?: number | null
          cooldown_until?: string | null
          domain_id: string
          is_unlocked?: boolean | null
          last_completed_at?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          completion_count?: number | null
          cooldown_until?: string | null
          domain_id?: string
          is_unlocked?: boolean | null
          last_completed_at?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_domain_progress_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_domain_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exploration_history: {
        Row: {
          created_at: string | null
          day_completed: number
          domain_path: string[]
          final_indicator_id: string
          id: string
          node_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_completed: number
          domain_path: string[]
          final_indicator_id: string
          id?: string
          node_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_completed?: number
          domain_path?: string[]
          final_indicator_id?: string
          id?: string
          node_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exploration_history_final_indicator_id_fkey"
            columns: ["final_indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exploration_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_node_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          insights_earned: number | null
          node_id: string | null
          response_data: Json | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          insights_earned?: number | null
          node_id?: string | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          insights_earned?: number | null
          node_id?: string | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_user_node_progress_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_user_node_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      get_recent_exploration_indicators: {
        Args: { days_back?: number; p_user_id: string }
        Returns: string[]
      }
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
      unlock_next_domains: {
        Args: { completed_domain_id: string; p_user_id: string }
        Returns: undefined
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
