const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      const dbInstructors = await dbGetInstructors(INITIAL_INSTRUCTORS);
      
      // Map exact colors from image by instructor name
      const imageColorsMap: Record<string, string> = {
        'admir ventura': '#f24e1e',
        'alexandre rivellino': '#0b41cd',
        'jaqueline daiane': '#008b8b',
        'leandro manha': '#6b21a8',
        'naiara cristina': '#e5a000',
        'thiago anjos': '#18181b',
      };

      const rawFiltered = dbInstructors
        .map((inst) => {
          const matched = imageColorsMap[inst.name.trim().toLowerCase()];
          return matched ? { ...inst, color: matched } : inst;
        });

      // Deduplicate strictly by normalized instructor name
      const uniqueNameMap = new Map<string, Instructor>();
      rawFiltered.forEach((inst) => {
        const normName = inst.name.trim().toLowerCase();
        if (!uniqueNameMap.has(normName)) {
          uniqueNameMap.set(normName, inst);
        }
      });
      const updatedInstructors = Array.from(uniqueNameMap.values());

      setInstructors(updatedInstructors);
      localStorage.setItem('tr_instructors', JSON.stringify(updatedInstructors));`;

const replacement = `      const dbInstructors = await dbGetInstructors(INITIAL_INSTRUCTORS);
      
      // Deduplicate strictly by normalized instructor name
      const uniqueNameMap = new Map<string, Instructor>();
      dbInstructors.forEach((inst) => {
        const normName = inst.name.trim().toLowerCase();
        if (!uniqueNameMap.has(normName)) {
          uniqueNameMap.set(normName, inst);
        }
      });
      const updatedInstructors = Array.from(uniqueNameMap.values());

      setInstructors(updatedInstructors);
      localStorage.setItem('tr_instructors', JSON.stringify(updatedInstructors));`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
