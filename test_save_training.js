import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.replace('/rest/v1/', '');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  let { error } = await supabase.from('trainings').upsert({
    id: `t-${Date.now()}`,
    title: 'Test Fix Training',
    instructorId: null,
    locationId: null,
    startDate: '2026-08-12T08:00',
    endDate: '2026-08-12T17:00',
    status: 'confirmado',
    description: null,
  });
  console.log('Error:', error);
}
run();
