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
          created_at: string | null
          current_value: number
          description: string | null
          indicator_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          current_value: number
          description?: string | null
          indicator_id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
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
