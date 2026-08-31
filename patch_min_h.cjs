const fs = require('fs');
let code = fs.readFileSync('src/components/InteractiveCalendarView.tsx', 'utf8');

code = code.replace(
  'className={`flex-1 flex flex-col bg-[#030e21]',
  'className={`flex-1 flex flex-col min-h-0 bg-[#030e21]'
);

code = code.replace(
  '<div className="relative z-10 flex-1 flex flex-col md:flex-row gap-5">',
  '<div className="relative z-10 flex-1 flex flex-col md:flex-row gap-5 min-h-0">'
);

code = code.replace(
  '<div className="flex-1 flex flex-col bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-2xl">',
  '<div className="flex-1 flex flex-col min-h-0 bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-2xl">'
);

code = code.replace(
  '<div className="flex-1 grid grid-cols-7 auto-rows-[minmax(140px,1fr)] bg-slate-300 gap-[1px] overflow-y-auto custom-scrollbar">',
  '<div className="flex-1 grid grid-cols-7 auto-rows-[minmax(140px,1fr)] min-h-0 bg-slate-300 gap-[1px] overflow-y-auto custom-scrollbar">'
);

fs.writeFileSync('src/components/InteractiveCalendarView.tsx', code);
