const fs = require('fs');
const path = require('path');

const files = [
  'app/(auth)/forgot-password/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(auth)/register/page.tsx',
  'app/(auth)/reset-password/page.tsx',
  'app/(main)/admin/AdminDashboardClient.tsx',
  'app/(main)/api-docs/page.tsx',
  'app/(main)/works/[workId]/edit/page.tsx',
  'app/(main)/works/[workId]/page.tsx'
];

const rootDir = path.resolve(__dirname, '..');

files.forEach(fileRelPath => {
  const filePath = path.join(rootDir, fileRelPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace invalid slate-955 with slate-950
    content = content.replace(/slate-955/g, 'slate-950');
    
    // Replace transparent card backgrounds with solid card backgrounds
    content = content.replace(/dark:bg-slate-900\/30/g, 'dark:bg-slate-900');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Applied color and opacity fixes in: ${fileRelPath}`);
  } else {
    console.log(`✗ File not found: ${fileRelPath}`);
  }
});
