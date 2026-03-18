import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lvhpjfgmqlehdqcqvbft.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aHBqZmdtcWxlaGRxY3F2YmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjgyMzUsImV4cCI6MjA4OTQ0NDIzNX0.XLu-J3PqZpNW2aXB9E6Kq65nDM4xg248Xi_7MU4J6Io'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)