const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to replace the block
code = code.replace(
  /const imageColorsMap: Record<string, string> = {[\s\S]*?const rawFiltered = dbInstructors[\s\S]*?return matched \? { \.\.\.inst, color: matched } : inst;\n\s*\}\);/,
  'const rawFiltered = dbInstructors;'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully");
