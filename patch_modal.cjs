const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace setActiveModal calls with startTransition
code = code.replace(
  /setActiveModal\((.*?)\);/g,
  `React.startTransition(() => { setActiveModal($1); });`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully");
