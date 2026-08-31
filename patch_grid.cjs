const fs = require('fs');
let code = fs.readFileSync('src/components/InteractiveCalendarView.tsx', 'utf8');

code = code.replace(/<div className="flex-1 grid grid-cols-7 auto-rows-\[minmax\(140px,auto\)\] min-h-0 bg-slate-300 gap-\[1px\] overflow-y-auto custom-scrollbar">/,
  '<div className="flex-1 grid grid-cols-7 min-h-0 bg-slate-300 gap-[1px] overflow-y-auto custom-scrollbar" style={{ gridAutoRows: "minmax(140px, auto)" }}>');

fs.writeFileSync('src/components/InteractiveCalendarView.tsx', code);
console.log("Patched Grid");
