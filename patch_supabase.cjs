const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(/row\.customColor \|\| row\.custom_color \|\| undefined/g, "row.customColor ?? row.custom_color ?? undefined");
code = code.replace(/row\.attendeeCount \|\| row\.attendee_count \|\| undefined/g, "row.attendeeCount ?? row.attendee_count ?? undefined");

code = code.replace(/attendeeCount: training\.attendeeCount \|\| null/g, "attendeeCount: training.attendeeCount ?? null");
code = code.replace(/attendee_count: training\.attendeeCount \|\| null/g, "attendee_count: training.attendeeCount ?? null");

fs.writeFileSync('src/lib/supabase.ts', code);
console.log("Patched supabase.ts successfully");
