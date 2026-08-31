const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Update metric cards to look more premium
code = code.replace(/bg-white rounded-2xl shadow-xl shadow-slate-200\/40 border border-slate-100 p-5 flex flex-col relative overflow-hidden group/g, "bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow");

// Update top header
code = code.replace(/border-b border-slate-200 pb-5/, ""); // Remove underline to make it cleaner

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched dashboard design");
