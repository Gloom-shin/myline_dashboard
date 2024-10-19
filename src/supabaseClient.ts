// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트에서 얻은 URL과 공개 API 키 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
