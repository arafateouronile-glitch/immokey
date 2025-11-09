/**
 * Types pour la base de données Supabase
 * Généré automatiquement depuis le schéma Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string
          listing_id: string
          name: string
          email: string
          phone: string | null
          message: string
          status: 'new' | 'read' | 'replied' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          name: string
          email: string
          phone?: string | null
          message: string
          status?: 'new' | 'read' | 'replied' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          status?: 'new' | 'read' | 'replied' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: 'location' | 'vente'
          property_type: string
          price: number
          city: string
          neighborhood: string
          address: string
          latitude: number | null
          longitude: number | null
          rooms: number
          bathrooms: number
          surface_area: number
          amenities: string[]
          images: string[]
          status: 'active' | 'pending' | 'inactive'
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: 'location' | 'vente'
          property_type: string
          price: number
          city: string
          neighborhood: string
          address: string
          latitude?: number | null
          longitude?: number | null
          rooms: number
          bathrooms: number
          surface_area: number
          amenities?: string[]
          images?: string[]
          status?: 'active' | 'pending' | 'inactive'
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: 'location' | 'vente'
          property_type?: string
          price?: number
          city?: string
          neighborhood?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          rooms?: number
          bathrooms?: number
          surface_area?: number
          amenities?: string[]
          images?: string[]
          status?: 'active' | 'pending' | 'inactive'
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

