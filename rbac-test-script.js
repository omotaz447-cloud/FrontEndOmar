// Test Script for Role-Based Access Control (Token-based)
// Copy and paste this in your browser console to test different roles

// Decode JWT token
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

// Create a mock JWT token for testing
function createMockToken(userName, role = 'factory') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: '688d4045f66bbb693aa0faf3',
    role: role,
    userName: userName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  };
  
  // Simple base64 encoding (for testing only, not secure)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const mockSignature = 'mock_signature_for_testing';
  
  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

// Test function to set user role via mock token
function setUserRole(userName) {
  const mockToken = createMockToken(userName);
  document.cookie = `accessToken=${mockToken}; path=/; max-age=86400`;
  console.log(`✅ Set user role to: ${userName}`);
  console.log(`🎫 Created mock token with userName: ${userName}`);
  console.log('🔄 Please refresh the page to see changes');
}

// Test function to clear token
function clearUserRole() {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  console.log('🗑️ Cleared access token');
  console.log('🔄 Please refresh the page to see changes');
}

// Test function to check current role from token
function getCurrentRole() {
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
    
  console.log('📋 Current cookies:');
  console.log(`   accessToken: ${accessToken ? 'Set' : 'Not set'}`);
  
  if (accessToken) {
    const decoded = decodeToken(accessToken);
    if (decoded) {
      console.log('🎫 Decoded token:');
      console.log(`   userId: ${decoded.userId}`);
      console.log(`   role: ${decoded.role}`);
      console.log(`   userName: ${decoded.userName}`);
      console.log(`   iat: ${decoded.iat} (${new Date(decoded.iat * 1000).toLocaleString()})`);
      console.log(`   exp: ${decoded.exp} (${new Date(decoded.exp * 1000).toLocaleString()})`);
      return decoded.userName;
    }
  }
  
  return null;
}

// Available test commands
console.log('🧪 RBAC Testing Commands Available:');
console.log('');
console.log('👑 Admin (full access):');
console.log('   setUserRole("admin")');
console.log('');
console.log('🏭 Factory Roles (read-only access):');
console.log('   setUserRole("factory1")  // البلينا للتجارة والحسابات');
console.log('   setUserRole("factory2")  // جرجا للتجارة والحسابات');
console.log('   setUserRole("factory3")  // سنتر دلع الهوانم للحسابات');
console.log('   setUserRole("factory4")  // سنتر سيما للحسابات');
console.log('   setUserRole("factory5")  // سنتر غزة للحسابات');
console.log('');
console.log('🔧 Utility commands:');
console.log('   getCurrentRole()    // Check current role');
console.log('   clearUserRole()     // Clear all cookies');
console.log('');

// Show current status
getCurrentRole();

// Test scenarios
function runAllTests() {
  console.log('🧪 Running all role tests...');
  
  const roles = ['admin', 'factory1', 'factory2', 'factory3', 'factory4', 'factory5'];
  
  roles.forEach((role, index) => {
    setTimeout(() => {
      console.log(`\n🔄 Testing role: ${role}`);
      setUserRole(role);
      
      // Expected behavior for each role
      const expectedBehavior = {
        admin: '✅ Should see all sections and have edit/delete access',
        factory1: '✅ Should only see البلينا للتجارة sections, no edit/delete, البلينا معرض الجمهورية الدولي hidden',
        factory2: '✅ Should only see جرجا للتجارة sections, no edit/delete, جرجا معرض مول العرب hidden',
        factory3: '✅ Should only see سنتر دلع الهوانم sections, no edit/delete, سنتر دلع الهوانم hidden',
        factory4: '✅ Should only see سنتر سيما sections, no edit/delete, سنتر سيما hidden',
        factory5: '✅ Should only see سنتر غزة sections, no edit/delete, سنتر غزة hidden'
      };
      
      console.log(`   Expected: ${expectedBehavior[role]}`);
      
      if (index === roles.length - 1) {
        console.log('\n✨ All tests complete! Refresh page after each role change to see effects.');
      }
    }, index * 1000);
  });
}

// Auto-run example
console.log('💡 Tip: Run runAllTests() to test all roles automatically');
console.log('💡 Or manually test each role with setUserRole("role_name")');

// Make functions available globally
window.setUserRole = setUserRole;
window.clearUserRole = clearUserRole;
window.getCurrentRole = getCurrentRole;
window.runAllTests = runAllTests;
