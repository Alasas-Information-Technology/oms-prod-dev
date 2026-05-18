import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zrznxercdywewhvrybjo.supabase.co'
const supabaseAnonKey = 'sb_publishable_DWhtVlqWnB50N5iZ-T_OJQ_qQMDHXvx'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkExistingData() {
  const { data, error } = await supabase.from('requisitions').select('funding_category').limit(5)
  if (error) {
    console.error('Error fetching requisitions:', error)
  } else {
    console.log('Existing funding_category values:', data)
  }
}

checkExistingData()
