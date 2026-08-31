const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Import LabelList
code = code.replace(/PieChart, Pie, Cell, AreaChart, Area,/, "PieChart, Pie, Cell, AreaChart, Area, LabelList,");

// Add LabelList to Area
code = code.replace(/<Area\s+type="monotone"\s+dataKey="count"[^>]+>/, `$&
                    <LabelList dataKey="count" position="top" fill="#2563eb" fontSize={11} fontWeight="bold" formatter={(value) => value > 0 ? value : ''} />
`);

// Add LabelList to Bar
code = code.replace(/<Bar\s+dataKey="count"\s+radius=\{[^}]+\}[^>]*>/, `$&
                    <LabelList dataKey="count" position="right" fill="#64748b" fontSize={11} fontWeight="bold" />
`);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched Dashboard");
