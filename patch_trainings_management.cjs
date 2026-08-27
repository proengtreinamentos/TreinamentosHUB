const fs = require('fs');
let code = fs.readFileSync('src/components/TrainingsManagement.tsx', 'utf8');

// Replace root div
code = code.replace(
  '<div className="p-4 sm:p-6 w-full max-w-none space-y-6">',
  '<div className="flex flex-col h-full w-full max-w-none">'
);

// Add top padding wrapper
code = code.replace(
  '{/* View Header */}',
  '<div className="p-4 sm:p-6 pb-2 space-y-6 flex-shrink-0">\n      {/* View Header */}'
);

// Close top wrapper and open bottom wrapper before Floating Bar
code = code.replace(
  '{/* 🚀 FLOATING / STICKY BULK ACTION BAR */}',
  '</div>\n      \n      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-hidden flex flex-col gap-4">\n      {/* 🚀 FLOATING / STICKY BULK ACTION BAR */}'
);

// Close bottom wrapper at the end of return
code = code.replace(
  '</div>\n  );\n}',
  '</div>\n      </div>\n    </div>\n  );\n}'
);

// Make table wrapper scrollable
code = code.replace(
  '<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">',
  '<div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-full">'
);

code = code.replace(
  '<div className="overflow-x-auto">',
  '<div className="overflow-auto h-full custom-scrollbar">'
);

// Make floating bar not sticky, just relative since it's above the scrollable table
code = code.replace(
  'className="sticky top-4 z-30',
  'className="flex-shrink-0 z-30'
);

// Also need to make sure <thead> is sticky inside the table
code = code.replace(
  '<thead',
  '<thead className="sticky top-0 z-20"'
);

fs.writeFileSync('src/components/TrainingsManagement.tsx', code);
