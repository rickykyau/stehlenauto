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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          state: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          state: string
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          state?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          message_count: number
          started_at: string
          status: string
          total_tokens: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number
          started_at?: string
          status?: string
          total_tokens?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number
          started_at?: string
          status?: string
          total_tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          action_data: Json | null
          action_type: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          products_referenced: Json | null
          role: string
        }
        Insert: {
          action_data?: Json | null
          action_type?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          products_referenced?: Json | null
          role?: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          products_referenced?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_content: {
        Row: {
          content: Json
          display_order: number
          id: string
          is_active: boolean
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          display_order?: number
          id?: string
          is_active?: boolean
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          display_order?: number
          id?: string
          is_active?: boolean
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      inventory_alerts: {
        Row: {
          alert_status: string
          created_at: string
          current_quantity: number
          id: string
          product_id: string
          threshold: number
          variant_id: string
          variant_title: string | null
        }
        Insert: {
          alert_status?: string
          created_at?: string
          current_quantity?: number
          id?: string
          product_id: string
          threshold?: number
          variant_id: string
          variant_title?: string | null
        }
        Update: {
          alert_status?: string
          created_at?: string
          current_quantity?: number
          id?: string
          product_id?: string
          threshold?: number
          variant_id?: string
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency_code: string
          customer_name: string | null
          discount_amount: number
          email: string | null
          financial_status: string
          fulfillment_status: string
          id: string
          line_items: Json
          order_number: string
          promo_code_used: string | null
          shipping_address: Json | null
          shopify_order_id: string
          subtotal_price: number
          synced_at: string
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string
          customer_name?: string | null
          discount_amount?: number
          email?: string | null
          financial_status?: string
          fulfillment_status?: string
          id?: string
          line_items?: Json
          order_number: string
          promo_code_used?: string | null
          shipping_address?: Json | null
          shopify_order_id: string
          subtotal_price?: number
          synced_at?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          customer_name?: string | null
          discount_amount?: number
          email?: string | null
          financial_status?: string
          fulfillment_status?: string
          id?: string
          line_items?: Json
          order_number?: string
          promo_code_used?: string | null
          shipping_address?: Json | null
          shopify_order_id?: string
          subtotal_price?: number
          synced_at?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_variation_groups: {
        Row: {
          category: string
          created_at: string
          family_name: string
          id: string
          member_count: number
          option_name: string
          ymm_base: string
        }
        Insert: {
          category: string
          created_at?: string
          family_name: string
          id?: string
          member_count?: number
          option_name?: string
          ymm_base: string
        }
        Update: {
          category?: string
          created_at?: string
          family_name?: string
          id?: string
          member_count?: number
          option_name?: string
          ymm_base?: string
        }
        Relationships: []
      }
      product_variation_members: {
        Row: {
          available_for_sale: boolean
          bed_length: string | null
          cab_type: string | null
          created_at: string
          display_order: number
          fitment_scope: string
          group_id: string
          id: string
          image_url: string | null
          option_label: string | null
          price: number | null
          product_handle: string
          product_title: string
          shopify_product_gid: string
          shopify_product_id: string
          trim_level: string | null
        }
        Insert: {
          available_for_sale?: boolean
          bed_length?: string | null
          cab_type?: string | null
          created_at?: string
          display_order?: number
          fitment_scope?: string
          group_id: string
          id?: string
          image_url?: string | null
          option_label?: string | null
          price?: number | null
          product_handle: string
          product_title: string
          shopify_product_gid: string
          shopify_product_id: string
          trim_level?: string | null
        }
        Update: {
          available_for_sale?: boolean
          bed_length?: string | null
          cab_type?: string | null
          created_at?: string
          display_order?: number
          fitment_scope?: string
          group_id?: string
          id?: string
          image_url?: string | null
          option_label?: string | null
          price?: number | null
          product_handle?: string
          product_title?: string
          shopify_product_gid?: string
          shopify_product_id?: string
          trim_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variation_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_variation_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      products_cache: {
        Row: {
          cb_item_name: string | null
          created_at: string
          fitment_notes: string | null
          fitment_subattributes: Json | null
          fitment_vehicles: Json
          handle: string | null
          id: string
          images: Json
          last_synced_at: string
          metafields: Json | null
          part_number: string | null
          product_type: string | null
          shopify_product_id: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          variants: Json
          vendor: string | null
        }
        Insert: {
          cb_item_name?: string | null
          created_at?: string
          fitment_notes?: string | null
          fitment_subattributes?: Json | null
          fitment_vehicles?: Json
          handle?: string | null
          id?: string
          images?: Json
          last_synced_at?: string
          metafields?: Json | null
          part_number?: string | null
          product_type?: string | null
          shopify_product_id: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          variants?: Json
          vendor?: string | null
        }
        Update: {
          cb_item_name?: string | null
          created_at?: string
          fitment_notes?: string | null
          fitment_subattributes?: Json | null
          fitment_vehicles?: Json
          handle?: string | null
          id?: string
          images?: Json
          last_synced_at?: string
          metafields?: Json | null
          part_number?: string | null
          product_type?: string | null
          shopify_product_id?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          variants?: Json
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_code_usage: {
        Row: {
          discount_applied: number
          id: string
          order_id: string | null
          promo_code_id: string
          used_at: string
          user_id: string | null
        }
        Insert: {
          discount_applied?: number
          id?: string
          order_id?: string | null
          promo_code_id: string
          used_at?: string
          user_id?: string | null
        }
        Update: {
          discount_applied?: number
          id?: string
          order_id?: string | null
          promo_code_id?: string
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applies_to: Database["public"]["Enums"]["applies_to_type"]
          code: string
          collection_ids: string[] | null
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          max_uses_per_user: number | null
          minimum_order_amount: number | null
          product_ids: string[] | null
          starts_at: string
          updated_at: string
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["applies_to_type"]
          code: string
          collection_ids?: string[] | null
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          minimum_order_amount?: number | null
          product_ids?: string[] | null
          starts_at?: string
          updated_at?: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["applies_to_type"]
          code?: string
          collection_ids?: string[] | null
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          minimum_order_amount?: number | null
          product_ids?: string[] | null
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          internal_notes: string | null
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_status: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          progress: number
          started_at: string | null
          status: string
          sync_type: string
          total: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number
          started_at?: string | null
          status?: string
          sync_type: string
          total?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number
          started_at?: string | null
          status?: string
          sync_type?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_vehicles: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          make: string
          model: string
          updated_at: string
          user_id: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          make: string
          model: string
          updated_at?: string
          user_id: string
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          make?: string
          model?: string
          updated_at?: string
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      ymm_config: {
        Row: {
          id: number
          make_collection_map: Json
          makes: Json
          models: Json
          updated_at: string
          years: Json
        }
        Insert: {
          id?: number
          make_collection_map?: Json
          makes?: Json
          models?: Json
          updated_at?: string
          years?: Json
        }
        Update: {
          id?: number
          make_collection_map?: Json
          makes?: Json
          models?: Json
          updated_at?: string
          years?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "owner" | "staff"
      applies_to_type: "all" | "specific_products" | "specific_collections"
      discount_type: "percentage" | "fixed_amount"
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
      admin_role: ["owner", "staff"],
      applies_to_type: ["all", "specific_products", "specific_collections"],
      discount_type: ["percentage", "fixed_amount"],
    },
  },
} as const
