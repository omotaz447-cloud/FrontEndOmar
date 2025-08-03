// Quick verification script - paste in browser console
function quickTest() {
  console.log('🧪 Quick RBAC Test');
  console.log('==================');
  
  // Test the exact component names used in the code
  const testCases = [
    { role: 'factory1', component: 'حسابات تجار البلينا', shouldAccess: true },
    { role: 'factory1', component: 'البلينا معرض الجمهورية الدولي', shouldAccess: false },
    
    { role: 'factory2', component: 'حساب تجار جرجا معرض مول العرب', shouldAccess: true },
    { role: 'factory2', component: 'جرجا معرض مول العرب', shouldAccess: false },
    
    { role: 'factory3', component: 'حسابات تجار سنتر دلع الهوانم', shouldAccess: true },
    { role: 'factory3', component: 'سنتر دلع الهوانم', shouldAccess: false },
    
    { role: 'factory4', component: 'حساب تجار سنتر سيما', shouldAccess: true },
    { role: 'factory4', component: 'سنتر سيما', shouldAccess: false },
    
    { role: 'factory5', component: 'حساب تجار سنتر غزة', shouldAccess: true },
    { role: 'factory5', component: 'سنتر غزة', shouldAccess: false },
  ];
  
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
  
  testCases.forEach(test => {
    const allowedComponents = roleAccess[test.role] || [];
    const actualAccess = allowedComponents.includes(test.component);
    const status = actualAccess === test.shouldAccess ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${status} ${test.role} -> ${test.component}: expected ${test.shouldAccess}, got ${actualAccess}`);
  });
}

// Test current user's access (Token-based)
function testCurrentUser() {
  // Decode token function
  function decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Get token and decode it
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
    
  if (!accessToken) {
    console.log('❌ No access token found. Set with: setUserRole("factory1")');
    return;
  }
  
  const decoded = decodeToken(accessToken);
  if (!decoded || !decoded.userName) {
    console.log('❌ Could not decode token or no userName found');
    return;
  }
  
  const userRole = decoded.userName; // This is where the role comes from now
  
  console.log(`\n👤 Testing current user: ${userRole}`);
  console.log(`🎫 Token info:`, {
    userId: decoded.userId,
    role: decoded.role,
    userName: decoded.userName,
    exp: new Date(decoded.exp * 1000).toLocaleString()
  });
  console.log('=================================');
  
  // Test specific components that are implemented
  const testComponents = [
    'حسابات تجار سنتر دلع الهوانم',  // CenterDelaaHawanemMerchants
    'حساب تجار سنتر غزة',           // CenterGazaMerchants
  ];
  
  const roleAccess = {
    factory1: ['البلينا للتجارة والحسابات', 'حساب عمال البلينا', 'حسابات تجار البلينا', 'مبيعات البلينا معرض الجمهورية'],
    factory2: ['جرجا للتجارة والحسابات', 'حساب تجار جرجا معرض مول العرب', 'حسابات عمال جرجا معرض مول العرب', 'مبيعات جرجا مول العرب'],
    factory3: ['سنتر دلع الهوانم للحسابات', 'حسابات عمال سنتر دلع الهوانم', 'حسابات تجار سنتر دلع الهوانم', 'مبيعات سنتر دلع الهوانم'],
    factory4: ['سنتر سيما للحسابات', 'حسابات عمال سنتر سيما', 'مبيعات سنتر سيما', 'حساب تجار سنتر سيما'],
    factory5: ['سنتر غزة للحسابات', 'مبيعات سنتر غزة', 'حساب تجار سنتر غزة', 'حسابات عمال سنتر غزة']
  };
  
  const allowedComponents = roleAccess[userRole] || [];
  
  testComponents.forEach(component => {
    const canAccess = userRole === 'admin' || allowedComponents.includes(component);
    const status = canAccess ? '✅ CAN ACCESS' : '❌ BLOCKED';
    console.log(`${status}: ${component}`);
  });
}

window.quickTest = quickTest;
window.testCurrentUser = testCurrentUser;

console.log('🔧 Quick test functions loaded!');
console.log('Run quickTest() to test all role mappings');
console.log('Run testCurrentUser() to test current user role');
