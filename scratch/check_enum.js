import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zrznxercdywewhvrybjo.supabase.co'
const supabaseAnonKey = 'sb_publishable_DWhtVlqWnB50N5iZ-T_OJQ_qQMDHXvx'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getEnumValues() {
  const { data, error } = await supabase.rpc('get_enum_values', { enum_type: 'funding_type' })
  if (error) {
    // If RPC doesn't exist, try querying pg_catalog via SQL (if enabled for anon role)
    const { data: enumData, error: enumError } = await supabase
      .from('pg_type')
      .select('typname, pg_enum(enumlabel)')
      .eq('typname', 'funding_type')
      .single()
    
    if (enumError) {
      console.error('Error fetching enum via REST:', enumError)
      // fallback: try to find any existing requisition to see its value
      const { data: sample } = await supabase.from('requisitions').select('funding_category').limit(1)
      console.log('Sample requisition funding_category:', sample)
    } else {
      console.log('Enum values:', enumData)
    }
  } else {
    console.log('Enum values (via RPC):', data)
  }
}

getEnumValues()
