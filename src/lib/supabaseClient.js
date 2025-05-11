import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Helper function untuk upload foto
export const uploadPhoto = async (bucket, path, file) => {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, file)

  if (error) throw error
  return data
}

// Helper function untuk mendapatkan URL foto
export const getPhotoUrl = (bucket, path) => {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}