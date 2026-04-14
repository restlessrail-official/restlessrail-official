import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cuegceiqmewzceolksrp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZWdjZWlxbWV3emNlb2xksrp.supabase.co'; // Using provided key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
