import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';

const SUPABASE_URL = "https://zyzgebbdsqlispmpgvev.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5emdlYmJkc3FsaXNwbXBndmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDA3MTksImV4cCI6MjA3NzU3NjcxOX0.ahUH6L7XrKjs9ZZ0OLLzrD53si9_g69Oy1FaiDqWXko";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
