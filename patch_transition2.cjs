const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleToggleStatus = \(status: TrainingStatus\) => {\n    setSelectedStatuses\(\(prev\) =>\n      prev\.includes\(status\) \? prev\.filter\(\(s\) => s !== status\) : \[\.\.\.prev, status\]\n    \);\n  };/g,
  `const handleToggleStatus = (status: TrainingStatus) => {
    React.startTransition(() => {
      setSelectedStatuses((prev) =>
        prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
      );
    });
  };`
);

code = code.replace(
  /const handleToggleInstructor = \(id: string\) => {\n    setSelectedInstructorIds\(\(prev\) =>\n      prev\.includes\(id\) \? prev\.filter\(\(i\) => i !== id\) : \[\.\.\.prev, id\]\n    \);\n  };/g,
  `const handleToggleInstructor = (id: string) => {
    React.startTransition(() => {
      setSelectedInstructorIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    });
  };`
);

code = code.replace(
  /const handleToggleLocation = \(id: string\) => {\n    setSelectedLocationIds\(\(prev\) =>\n      prev\.includes\(id\) \? prev\.filter\(\(l\) => l !== id\) : \[\.\.\.prev, id\]\n    \);\n  };/g,
  `const handleToggleLocation = (id: string) => {
    React.startTransition(() => {
      setSelectedLocationIds((prev) =>
        prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
      );
    });
  };`
);

fs.writeFileSync('src/App.tsx', code);
