const fs = require('fs');
let code = fs.readFileSync('src/components/TrainingsManagement.tsx', 'utf8');

// Fix the end tags. The original return had 2 closing divs: </div></div>);
// We added one wrapper level. So we need 3 closing divs: </div></div></div>);
// Currently there are 4 closing divs.

code = code.replace(
  '</div>\n    </div>\n      </div>\n    </div>\n  );\n}',
  '</div>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/components/TrainingsManagement.tsx', code);
