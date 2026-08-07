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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      course_holes: {
        Row: {
          course_name: string
          hole_number: number
          par: number
          stroke_index: number
          yards_blue: number | null
          yards_white: number | null
        }
        Insert: {
          course_name: string
          hole_number: number
          par: number
          stroke_index: number
          yards_blue?: number | null
          yards_white?: number | null
        }
        Update: {
          course_name?: string
          hole_number?: number
          par?: number
          stroke_index?: number
          yards_blue?: number | null
          yards_white?: number | null
        }
        Relationships: []
      }
      handicap_settings: {
        Row: {
          best_count: number
          id: boolean
          lookback_rounds: number
          minimum_rounds: number
          percentage_factor: number
          updated_at: string
        }
        Insert: {
          best_count?: number
          id?: boolean
          lookback_rounds?: number
          minimum_rounds?: number
          percentage_factor?: number
          updated_at?: string
        }
        Update: {
          best_count?: number
          id?: boolean
          lookback_rounds?: number
          minimum_rounds?: number
          percentage_factor?: number
          updated_at?: string
        }
        Relationships: []
      }
      match_players: {
        Row: {
          handicap: number
          id: string
          is_substitute: boolean
          match_id: string
          player_id: string
          role: string
          team_id: string
        }
        Insert: {
          handicap: number
          id?: string
          is_substitute?: boolean
          match_id: string
          player_id: string
          role: string
          team_id: string
        }
        Update: {
          handicap?: number
          id?: string
          is_substitute?: boolean
          match_id?: string
          player_id?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_hole_points"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_team_totals"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_handicaps"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "match_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          round_id: string
          team_a_id: string
          team_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_id: string
          team_a_id: string
          team_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_id?: string
          team_a_id?: string
          team_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          approved: boolean
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          is_guest: boolean
          name: string
          team_id: string | null
        }
        Insert: {
          approved?: boolean
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          is_guest?: boolean
          name: string
          team_id?: string | null
        }
        Update: {
          approved?: boolean
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          is_guest?: boolean
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          course_name: string
          created_at: string
          date: string
          id: string
          status: Database["public"]["Enums"]["round_status"]
          tee_time: string | null
        }
        Insert: {
          course_name: string
          created_at?: string
          date: string
          id?: string
          status?: Database["public"]["Enums"]["round_status"]
          tee_time?: string | null
        }
        Update: {
          course_name?: string
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["round_status"]
          tee_time?: string | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          hole_number: number
          id: string
          player_id: string
          round_id: string
          strokes: number | null
          updated_at: string
        }
        Insert: {
          hole_number: number
          id?: string
          player_id: string
          round_id: string
          strokes?: number | null
          updated_at?: string
        }
        Update: {
          hole_number?: number
          id?: string
          player_id?: string
          round_id?: string
          strokes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_handicaps"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      match_hole_points: {
        Row: {
          hole_number: number | null
          match_id: string | null
          par: number | null
          role: string | null
          stroke_index: number | null
          team_a_gross: number | null
          team_a_hole_points: number | null
          team_a_net: number | null
          team_a_player_id: string | null
          team_a_strokes_received: number | null
          team_b_gross: number | null
          team_b_hole_points: number | null
          team_b_net: number | null
          team_b_player_id: string | null
          team_b_strokes_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_b_player_id"]
            isOneToOne: false
            referencedRelation: "player_handicaps"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_a_player_id"]
            isOneToOne: false
            referencedRelation: "player_handicaps"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_b_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_a_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_b_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["team_a_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_team_totals: {
        Row: {
          holes_decided: number | null
          match_id: string | null
          round_id: string | null
          team_a_hole_points: number | null
          team_a_id: string | null
          team_a_name: string | null
          team_a_net_points: number | null
          team_a_total_points: number | null
          team_b_hole_points: number | null
          team_b_id: string | null
          team_b_name: string | null
          team_b_net_points: number | null
          team_b_total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "team_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_handicaps: {
        Row: {
          handicap: number | null
          minimum_rounds: number | null
          name: string | null
          player_id: string | null
          rounds_in_window: number | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          handicap: number | null
          match_halves: number | null
          match_losses: number | null
          match_wins: number | null
          name: string | null
          player_id: string | null
          rounds_played: number | null
          scoring_average: number | null
          total_hole_points: number | null
        }
        Relationships: []
      }
      team_standings: {
        Row: {
          losses: number | null
          matches_played: number | null
          name: string | null
          points: number | null
          team_id: string | null
          ties: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_player: { Args: { target_player_id: string }; Returns: undefined }
      current_player_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      set_player_team: {
        Args: { new_team_id: string; target_player_id: string }
        Returns: undefined
      }
    }
    Enums: {
      round_status: "upcoming" | "live" | "completed"
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
      round_status: ["upcoming", "live", "completed"],
    },
  },
} as const
