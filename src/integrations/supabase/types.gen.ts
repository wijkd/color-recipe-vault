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
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'contributor' | 'consumer'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'contributor' | 'consumer'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'contributor' | 'consumer'
          created_at?: string
        }
      }
      color_profiles: {
        Row: {
          id: string
          name: string
          description: string | null
          contributor_id: string
          created_at: string
          average_rating: number | null
          total_ratings: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          contributor_id: string
          created_at?: string
          average_rating?: number | null
          total_ratings?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          contributor_id?: string
          created_at?: string
          average_rating?: number | null
          total_ratings?: number
        }
      }
      profile_images: {
        Row: {
          id: string
          color_profile_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          color_profile_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          color_profile_id?: string
          image_url?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          color_profile_id: string
          user_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          color_profile_id: string
          user_id: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          color_profile_id?: string
          user_id?: string
          rating?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          color_profile_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          color_profile_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          color_profile_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: 'admin' | 'contributor' | 'consumer'
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'admin' | 'contributor' | 'consumer'
    }
  }
}
