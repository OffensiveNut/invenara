// TypeScript types generated from Supabase schema
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
      components: {
        Row: {
          id: string
          part_number: string
          manufacturer: string
          type: string
          description: string | null
          package: string | null
          packaging: string | null
          stock: number
          min_stock: number
          location: string | null
          datasheet_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          part_number: string
          manufacturer: string
          type: string
          description?: string | null
          package?: string | null
          packaging?: string | null
          stock?: number
          min_stock?: number
          location?: string | null
          datasheet_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          part_number?: string
          manufacturer?: string
          type?: string
          description?: string | null
          package?: string | null
          packaging?: string | null
          stock?: number
          min_stock?: number
          location?: string | null
          datasheet_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      component_specifications: {
        Row: {
          id: string
          component_id: string
          spec_name: string
          spec_value: string
          created_at: string
        }
        Insert: {
          id?: string
          component_id: string
          spec_name: string
          spec_value: string
          created_at?: string
        }
        Update: {
          id?: string
          component_id?: string
          spec_name?: string
          spec_value?: string
          created_at?: string
        }
      }
      picking_lists: {
        Row: {
          id: string
          project_name: string
          project_number: number
          status: string
          total_items: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_name: string
          project_number: number
          status?: string
          total_items?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_name?: string
          project_number?: number
          status?: string
          total_items?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      picking_list_items: {
        Row: {
          id: string
          picking_list_id: string
          component_id: string
          part_number: string
          manufacturer: string
          required_quantity: number
          available_quantity: number
          location: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          picking_list_id: string
          component_id: string
          part_number: string
          manufacturer: string
          required_quantity: number
          available_quantity: number
          location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          picking_list_id?: string
          component_id?: string
          part_number?: string
          manufacturer?: string
          required_quantity?: number
          available_quantity?: number
          location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      stock_transactions: {
        Row: {
          id: string
          component_id: string
          transaction_type: string
          quantity_change: number
          quantity_before: number
          quantity_after: number
          picking_list_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          component_id: string
          transaction_type: string
          quantity_change: number
          quantity_before: number
          quantity_after: number
          picking_list_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          component_id?: string
          transaction_type?: string
          quantity_change?: number
          quantity_before?: number
          quantity_after?: number
          picking_list_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      low_stock_components: {
        Row: {
          id: string
          part_number: string
          manufacturer: string
          type: string
          stock: number
          min_stock: number
          location: string | null
          shortage_quantity: number | null
        }
      }
      picking_list_summary: {
        Row: {
          id: string
          project_name: string
          project_number: number
          status: string
          total_items: number | null
          completed_at: string | null
          created_at: string
          item_count: number | null
          picked_count: number | null
          insufficient_count: number | null
          total_quantity_required: number | null
        }
      }
      component_stock_history: {
        Row: {
          id: string
          created_at: string
          part_number: string
          manufacturer: string
          transaction_type: string
          quantity_change: number
          quantity_before: number
          quantity_after: number
          project_name: string | null
          notes: string | null
        }
      }
    }
    Functions: {
      confirm_component_pickup: {
        Args: { p_picking_list_id: string }
        Returns: Json
      }
      get_next_project_number: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
