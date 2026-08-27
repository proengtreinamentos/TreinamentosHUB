const fs = require('fs');

['src/components/InstructorsManagement.tsx', 'src/components/LocationsManagement.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Make root flex column full height
  code = code.replace(
    '<div className="p-4 sm:p-6 w-full max-w-none space-y-6">',
    '<div className="flex flex-col h-full w-full max-w-none p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">'
  );
  
  fs.writeFileSync(file, code);
});
