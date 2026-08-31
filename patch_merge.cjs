const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(
  /const remoteList = \(data \|\| \[\]\)\.map\(normalizeTrainingRow\);/g,
  `const rawRemoteList = (data || []).map(normalizeTrainingRow);
    const localMap = new Map(localList.map(t => [t.id, t]));
    
    // Soft merge: Preserve attendeeCount and customColor from local if remote dropped them (due to old schema)
    const remoteList = rawRemoteList.map(remote => {
      const local = localMap.get(remote.id);
      if (local) {
        if (remote.attendeeCount === undefined && local.attendeeCount !== undefined) {
          remote.attendeeCount = local.attendeeCount;
        }
        if (remote.customColor === undefined && local.customColor !== undefined) {
          remote.customColor = local.customColor;
        }
      }
      return remote;
    });`
);

fs.writeFileSync('src/lib/supabase.ts', code);
