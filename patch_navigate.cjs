const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(calendarView === 'month'\) {\n\s*newDate\.setMonth\(currentDate\.getMonth\(\) \+ offset\);\n\s*\}/g,
  `if (calendarView === 'month') {\n      newDate.setDate(1); // Set to 1st to prevent month skipping\n      newDate.setMonth(currentDate.getMonth() + offset);\n    }`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully");
