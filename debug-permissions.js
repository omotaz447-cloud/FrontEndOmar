// Debug script to test role permissions
// Run this in browser console after setting the role

function debugRolePermissions() {
  console.log('🔍 Debugging Role Permissions');
  console.log('=====================================');
  
  // Get current role from cookies
  const userRole = document.cookie
    .split('; ')
    .find(row => row.startsWith('userRole='))
    ?.split('=')[1];
    
  console.log(`📋 Current userRole: ${userRole || 'Not set'}`);
  
  if (!userRole) {
    console.log('❌ No user role found in cookies');
    return;
  }
  
  // Test component access for different components
  const componentTests = [
    // Factory1 (البلينا) components
    'البلينا للتجارة والحسابات',
    'حساب عمال البلينا',
    'حسابات تجار البلينا',
    'مبيعات البلينا معرض الجمهورية',
    'البلينا معرض الجمهورية الدولي',
    
    // Factory2 (جرجا) components
    'جرجا للتجارة والحسابات',
    'حساب تجار جرجا معرض مول العرب',
    'حسابات عمال جرجا معرض مول العرب',
    'مبيعات جرجا مول العرب',
    'جرجا معرض مول العرب',
    
    // Factory3 (دلع الهوانم) components
    'سنتر دلع الهوانم للحسابات',
    'حسابات عمال سنتر دلع الهوانم',
    'حسابات تجار سنتر دلع الهوانم',
    'مبيعات سنتر دلع الهوانم',
    'سنتر دلع الهوانم',
    
    // Factory4 (سيما) components
    'سنتر سيما للحسابات',
    'حسابات عمال سنتر سيما',
    'مبيعات سنتر سيما',
    'حساب تجار سنتر سيما',
    'سنتر سيما',
    
    // Factory5 (غزة) components
    'سنتر غزة للحسابات',
    'مبيعات سنتر غزة',
    'حساب تجار سنتر غزة',
    'حسابات عمال سنتر غزة',
    'سنتر غزة',
  ];
  
  console.log(`\n🧪 Testing access for role: ${userRole}`);
  console.log('=====================================');
  
  // Mock the getRolePermissions function logic
  const roleAccess = {
    factory1: [
      'البلينا للتجارة والحسابات',
      'حساب عمال البلينا',
      'حسابات تجار البلينا',
      'مبيعات البلينا معرض الجمهورية'
    ],
    factory2: [
      'جرجا للتجارة والحسابات',
      'حساب تجار جرجا معرض مول العرب',
      'حسابات عمال جرجا معرض مول العرب',
      'مبيعات جرجا مول العرب'
    ],
    factory3: [
      'سنتر دلع الهوانم للحسابات',
      'حسابات عمال سنتر دلع الهوانم',
      'حسابات تجار سنتر دلع الهوانم',
      'مبيعات سنتر دلع الهوانم'
    ],
    factory4: [
      'سنتر سيما للحسابات',
      'حسابات عمال سنتر سيما',
      'مبيعات سنتر سيما',
      'حساب تجار سنتر سيما'
    ],
    factory5: [
      'سنتر غزة للحسابات',
      'مبيعات سنتر غزة',
      'حساب تجار سنتر غزة',
      'حسابات عمال سنتر غزة'
    ]
  };
  
  const allowedComponents = roleAccess[userRole] || [];
  
  componentTests.forEach(componentName => {
    const canAccess = userRole === 'admin' || allowedComponents.includes(componentName);
    const status = canAccess ? '✅ ALLOWED' : '❌ BLOCKED';
    console.log(`   ${status}: ${componentName}`);
  });
  
  console.log('\n🔧 Specific component checks:');
  console.log('=====================================');
  
  // Test specific components that might be causing issues
  const specificTests = [
    'حسابات تجار سنتر دلع الهوانم',  // CenterDelaaHawanemMerchants
    'حساب تجار سنتر غزة',           // CenterGazaMerchants
  ];
  
  specificTests.forEach(componentName => {
    const canAccess = userRole === 'admin' || allowedComponents.includes(componentName);
    const canEdit = userRole === 'admin';
    const canDelete = userRole === 'admin';
    
    console.log(`\n📄 Component: ${componentName}`);
    console.log(`   canAccess: ${canAccess}`);
    console.log(`   canEdit: ${canEdit}`);
    console.log(`   canDelete: ${canDelete}`);
    console.log(`   Should show error: ${!canAccess}`);
  });
}

// Make function available globally
window.debugRolePermissions = debugRolePermissions;

console.log('🔧 Debug function loaded! Run debugRolePermissions() to test');
