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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          country: string | null
          course: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          institution: string | null
          phone: string | null
          reg_number: string | null
          updated_at: string
          year_of_study: string | null
        }
        Insert: {
          country?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          institution?: string | null
          phone?: string | null
          reg_number?: string | null
          updated_at?: string
          year_of_study?: string | null
        }
        Update: {
          country?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution?: string | null
          phone?: string | null
          reg_number?: string | null
          updated_at?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      request_files: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          path: string
          request_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          name: string
          path: string
          request_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          path?: string
          request_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["request_status"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "request_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          academic_level: string | null
          admin_feedback: string | null
          admin_notes: string | null
          course_unit: string | null
          created_at: string
          currency: string
          deadline: string | null
          description: string
          grade: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          lecturer: string | null
          num_pages: number | null
          num_questions: number | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          preferred_date: string | null
          price: number | null
          ref: string
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          academic_level?: string | null
          admin_feedback?: string | null
          admin_notes?: string | null
          course_unit?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lecturer?: string | null
          num_pages?: number | null
          num_questions?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preferred_date?: string | null
          price?: number | null
          ref?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          academic_level?: string | null
          admin_feedback?: string | null
          admin_notes?: string | null
          course_unit?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lecturer?: string | null
          num_pages?: number | null
          num_questions?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preferred_date?: string | null
          price?: number | null
          ref?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          base_price: number
          created_at: string
          currency: string
          description: string
          id: string
          name: string
          sort: number
          unit: string
        }
        Insert: {
          active?: boolean
          base_price?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          name: string
          sort?: number
          unit?: string
        }
        Update: {
          active?: boolean
          base_price?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          name?: string
          sort?: number
          unit?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          show_prices: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          show_prices?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          show_prices?: boolean
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      payment_status: "unpaid" | "pending" | "paid" | "refunded"
      request_status:
        | "submitted"
        | "under_review"
        | "quoted"
        | "awaiting_payment"
        | "in_progress"
        | "completed"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "student"],
      payment_status: ["unpaid", "pending", "paid", "refunded"],
      request_status: [
        "submitted",
        "under_review",
        "quoted",
        "awaiting_payment",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
