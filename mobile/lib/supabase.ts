import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://yqngulunfwbecbmbcida.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxbmd1bHVuZndiZWNibWJjaWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzk0NzcsImV4cCI6MjA3Nzg1NTQ3N30.2MRDC8C5a558rfLQf2YMZmjetP6QUt4lPDbRp0QaAYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

