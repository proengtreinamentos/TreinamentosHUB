const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace chart container backgrounds to have subtle gradients
code = code.replace(/bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1/g, "bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex-1");
code = code.replace(/bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:col-span-2/g, "bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 lg:col-span-2");
code = code.replace(/bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1 flex flex-col/g, "bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex-1 flex flex-col");
code = code.replace(/bg-white rounded-2xl shadow-lg border border-slate-200 p-6/g, "bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6");

// Replace top metric cards
code = code.replace(/bg-white rounded-2xl shadow-lg border border-slate-200 p-6/g, "bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6");

// Give title a subtle gradient text
code = code.replace(/text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase/, "text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight uppercase");

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched dash 2");
