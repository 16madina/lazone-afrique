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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notes: string | null
          owner_user_id: string
          requested_date: string
          status: string
          updated_at: string
          visit_type: string
          visitor_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          owner_user_id: string
          requested_date: string
          status?: string
          updated_at?: string
          visit_type?: string
          visitor_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          owner_user_id?: string
          requested_date?: string
          status?: string
          updated_at?: string
          visit_type?: string
          visitor_user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_participants_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_participants_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          property_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_listings"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          id: string
          lead_id: string
          scheduled_date: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          lead_id: string
          scheduled_date?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          scheduled_date?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          agent_id: string
          assigned_to: string | null
          budget: number | null
          created_at: string
          email: string
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          priority: string
          property_interest: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_to?: string | null
          budget?: number | null
          created_at?: string
          email: string
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          priority?: string
          property_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_to?: string | null
          budget?: number | null
          created_at?: string
          email?: string
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: string
          property_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          provider_response: Json | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          provider_response?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          provider_response?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          created_at: string
          frequency: string
          id: string
          locations: string[] | null
          market_reports: boolean
          max_price: number | null
          min_price: number | null
          new_listings: boolean
          new_messages: boolean
          price_changes: boolean
          property_matches: boolean
          property_types: string[] | null
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          locations?: string[] | null
          market_reports?: boolean
          max_price?: number | null
          min_price?: number | null
          new_listings?: boolean
          new_messages?: boolean
          price_changes?: boolean
          property_matches?: boolean
          property_types?: string[] | null
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          locations?: string[] | null
          market_reports?: boolean
          max_price?: number | null
          min_price?: number | null
          new_listings?: boolean
          new_messages?: boolean
          price_changes?: boolean
          property_matches?: boolean
          property_types?: string[] | null
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_favorites_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_limits_config: {
        Row: {
          created_at: string
          currency: string
          free_listings_per_month: number
          id: string
          is_active: boolean
          price_per_extra_listing: number
          unlimited_monthly_price: number
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          currency?: string
          free_listings_per_month?: number
          id?: string
          is_active?: boolean
          price_per_extra_listing?: number
          unlimited_monthly_price?: number
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          currency?: string
          free_listings_per_month?: number
          id?: string
          is_active?: boolean
          price_per_extra_listing?: number
          unlimited_monthly_price?: number
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      listing_payments: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string
          id: string
          listing_id: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          payment_transaction_id: string | null
          payment_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string
          id?: string
          listing_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          payment_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string
          id?: string
          listing_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          payment_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_payments_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          city: string
          country_code: string
          created_at: string
          currency_code: string
          description: string | null
          features: string[] | null
          floor_number: string | null
          id: string
          image: string | null
          is_negotiable: boolean | null
          is_sponsored: boolean | null
          land_shape: string | null
          land_type: string | null
          lat: number
          lng: number
          neighborhood: string | null
          photos: string[] | null
          price: number
          price_currency: string
          property_documents: string[] | null
          property_type: string | null
          sponsor_amount: number | null
          sponsored_at: string | null
          sponsored_until: string | null
          status: string
          surface_area: number | null
          title: string
          transaction_type: string | null
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          country_code?: string
          created_at?: string
          currency_code?: string
          description?: string | null
          features?: string[] | null
          floor_number?: string | null
          id?: string
          image?: string | null
          is_negotiable?: boolean | null
          is_sponsored?: boolean | null
          land_shape?: string | null
          land_type?: string | null
          lat: number
          lng: number
          neighborhood?: string | null
          photos?: string[] | null
          price: number
          price_currency?: string
          property_documents?: string[] | null
          property_type?: string | null
          sponsor_amount?: number | null
          sponsored_at?: string | null
          sponsored_until?: string | null
          status?: string
          surface_area?: number | null
          title: string
          transaction_type?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          country_code?: string
          created_at?: string
          currency_code?: string
          description?: string | null
          features?: string[] | null
          floor_number?: string | null
          id?: string
          image?: string | null
          is_negotiable?: boolean | null
          is_sponsored?: boolean | null
          land_shape?: string | null
          land_type?: string | null
          lat?: number
          lng?: number
          neighborhood?: string | null
          photos?: string[] | null
          price?: number
          price_currency?: string
          property_documents?: string[] | null
          property_type?: string | null
          sponsor_amount?: number | null
          sponsored_at?: string | null
          sponsored_until?: string | null
          status?: string
          surface_area?: number | null
          title?: string
          transaction_type?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_listing_usage: {
        Row: {
          created_at: string
          free_listings_used: number
          id: string
          month: number
          paid_listings_used: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          free_listings_used?: number
          id?: string
          month: number
          paid_listings_used?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          free_listings_used?: number
          id?: string
          month?: number
          paid_listings_used?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          package_id: string | null
          payment_method: string
          payment_type: string
          payment_url: string | null
          phone_number: string | null
          provider: string
          provider_response: Json | null
          provider_transaction_id: string | null
          related_id: string | null
          status: string
          subscription_type: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id: string
          package_id?: string | null
          payment_method: string
          payment_type: string
          payment_url?: string | null
          phone_number?: string | null
          provider?: string
          provider_response?: Json | null
          provider_transaction_id?: string | null
          related_id?: string | null
          status?: string
          subscription_type?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          package_id?: string | null
          payment_method?: string
          payment_type?: string
          payment_url?: string | null
          phone_number?: string | null
          provider?: string
          provider_response?: Json | null
          provider_transaction_id?: string | null
          related_id?: string | null
          status?: string
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          viewed_user_id: string
          viewer_ip: unknown
          viewer_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          viewed_user_id: string
          viewer_ip?: unknown
          viewer_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          viewed_user_id?: string
          viewer_ip?: unknown
          viewer_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned: boolean | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          license_number: string | null
          neighborhood: string | null
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          neighborhood?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          neighborhood?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      sponsorship_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price_usd: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      sponsorship_transactions: {
        Row: {
          admin_notes: string | null
          amount_paid: number
          approval_date: string | null
          approval_status: string
          approved_by: string | null
          created_at: string
          id: string
          listing_id: string
          package_id: string
          payment_method: string | null
          payment_status: string
          payment_transaction_id: string | null
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_paid: number
          approval_date?: string | null
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          listing_id: string
          package_id: string
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          transaction_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number
          approval_date?: string | null
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          package_id?: string
          payment_method?: string | null
          payment_status?: string
          payment_transaction_id?: string | null
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsorship_transactions_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sponsorship_transactions_package_id"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorship_transactions_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          message: string | null
          reason: string | null
          target_listing_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          message?: string | null
          reason?: string | null
          target_listing_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reason?: string | null
          target_listing_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_actions_target_listing_id"
            columns: ["target_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string | null
          rated_user_id: string
          rater_user_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rated_user_id: string
          rater_user_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rated_user_id?: string
          rater_user_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          payment_transaction_id: string | null
          starts_at: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_transaction_id?: string | null
          starts_at?: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_transaction_id?: string | null
          starts_at?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_tours: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          listing_id: string
          title: string | null
          tour_data: Json
          tour_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          listing_id: string
          title?: string | null
          tour_data?: Json
          tour_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          listing_id?: string
          title?: string | null
          tour_data?: Json
          tour_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_listing: {
        Args: { target_user_id?: string }
        Returns: boolean
      }
      can_user_add_participant: {
        Args: { target_conversation_id: string; target_user_id: string }
        Returns: boolean
      }
      can_user_view_participants: {
        Args: { target_conversation_id: string }
        Returns: boolean
      }
      create_admin_notification: {
        Args: {
          notification_message: string
          notification_title: string
          notification_type: string
          related_transaction_id?: string
        }
        Returns: string
      }
      get_current_month_usage: {
        Args: { target_user_id?: string }
        Returns: {
          free_listings_remaining: number
          free_listings_used: number
          paid_listings_used: number
        }[]
      }
      get_listing_owner_profile: {
        Args: { owner_user_id: string }
        Returns: Json
      }
      get_payment_status: {
        Args: { transaction_id: string }
        Returns: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_type: string
          status: string
        }[]
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          city: string
          company_name: string
          country: string
          created_at: string
          first_name: string
          full_name: string
          id: string
          last_name: string
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      get_public_profile_safe: {
        Args: { profile_user_id: string }
        Returns: Json
      }
      get_user_average_rating: {
        Args: { target_user_id: string }
        Returns: {
          average_rating: number
          total_ratings: number
        }[]
      }
      get_user_profile_views_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid?: string }; Returns: boolean }
      is_listing_sponsored: { Args: { listing_id: string }; Returns: boolean }
      record_profile_view: {
        Args: { target_user_id: string; viewer_ip?: unknown }
        Returns: undefined
      }
      save_push_token: {
        Args: { p_platform: string; p_token: string; p_user_id: string }
        Returns: boolean
      }
      search_listings_by_location: {
        Args: {
          max_price?: number
          min_price?: number
          property_types?: string[]
          radius_km?: number
          search_lat: number
          search_lng: number
          transaction_type_filter?: string
        }
        Returns: {
          bathrooms: number
          bedrooms: number
          city: string
          distance_km: number
          id: string
          lat: number
          lng: number
          photos: string[]
          price: number
          property_type: string
          title: string
          transaction_type: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_type: "proprietaire" | "demarcheur" | "agence"
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
      app_role: ["admin", "moderator", "user"],
      user_type: ["proprietaire", "demarcheur", "agence"],
    },
  },
} as const
