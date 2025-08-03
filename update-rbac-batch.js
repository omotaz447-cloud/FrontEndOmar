const fs = require('fs');
const path = require('path');

// Component mappings for RBAC
const componentMappings = [
  {
    file: 'src/components/CenterSeimaMerchantAccount.tsx',
    componentName: 'حساب تجار سنتر سيما',
    displayName: 'حساب تجار سنتر سيما'
  },
  {
    file: 'src/components/CenterSeimaSales.tsx', 
    componentName: 'مبيعات سنتر سيما',
    displayName: 'مبيعات سنتر سيما'
  },
  {
    file: 'src/components/WorkerCenterSeimaAccount.tsx',
    componentName: 'حسابات عمال سنتر سيما', 
    displayName: 'حسابات عمال سنتر سيما'
  },
  {
    file: 'src/components/NewCenterGazaSales.tsx',
    componentName: 'مبيعات سنتر غزة',
    displayName: 'مبيعات سنتر غزة'
  },
  {
    file: 'src/components/CenterGazaWorkers.tsx',
    componentName: 'حسابات عمال سنتر غزة',
    displayName: 'حسابات عمال سنتر غزة'
  }
];

componentMappings.forEach(({ file, componentName, displayName }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not exists
  if (!content.includes("import { getRolePermissions }")) {
    content = content.replace(
      /import React.*?from 'react';\s*\n/,
      `import React, { useState, useEffect, useCallback } from 'react';
import { getRolePermissions } from '@/utils/roleUtils';
`
    );
  }
  
  console.log(`Updated ${file} with RBAC import`);
  
  fs.writeFileSync(filePath, content);
});

console.log('Batch RBAC import update completed');
