import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zrznxercdywewhvrybjo.supabase.co'
const supabaseAnonKey = 'sb_publishable_DWhtVlqWnB50N5iZ-T_OJQ_qQMDHXvx'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
  } else {
    console.log('Existing buckets:', data)
  }
}

listBuckets()
