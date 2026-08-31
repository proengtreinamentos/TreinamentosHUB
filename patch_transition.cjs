const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'setCurrentDate(newDate);',
  'React.startTransition(() => { setCurrentDate(newDate); });'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully");
