import { createClient } from '@supabase/supabase-js';

// Define database types
type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          salon_id: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['services']['Row']>;
      };
      staff: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          salon_id: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['staff']['Row']>;
      };
      bookings: {
        Row: {
          id: string;
          salon_id: string;
          service_id: string;
          staff_id: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string;
          notes: string | null;
          status: string;
        };
      };
    };
  };
};

type SupabaseClient = ReturnType<typeof createClient<Database>>;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be defined');
    }
    
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// For backward compatibility - lazy initialized
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});
