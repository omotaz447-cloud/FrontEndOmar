// Real Token Decoder - Use this to test with your actual JWT tokens
// Paste this in browser console

function decodeRealToken() {
  console.log('🔍 JWT Token Decoder');
  console.log('====================');
  
  // Get current token from cookies
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
    
  if (!accessToken) {
    console.log('❌ No access token found in cookies');
    console.log('💡 Set a token first: document.cookie = "accessToken=your_jwt_token; path=/"');
    return;
  }
  
  console.log('🎫 Found token:', accessToken.substring(0, 50) + '...');
  
  // Decode the token
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    console.log('✅ Successfully decoded token:');
    console.log('==============================');
    console.log(`👤 User ID: ${decoded.userId}`);
    console.log(`🏷️  Role: ${decoded.role}`);
    console.log(`📛 Username: ${decoded.userName}`);
    console.log(`🕐 Issued At: ${new Date(decoded.iat * 1000).toLocaleString()}`);
    console.log(`⏰ Expires At: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('⚠️  TOKEN IS EXPIRED!');
    } else {
      const timeLeft = decoded.exp - now;
      const hoursLeft = Math.floor(timeLeft / 3600);
      const minutesLeft = Math.floor((timeLeft % 3600) / 60);
      console.log(`✅ Token is valid for ${hoursLeft}h ${minutesLeft}m`);
    }
    
    // Show what access this user should have
    console.log('\n🔐 Access Control for this user:');
    console.log('=================================');
    
    const roleAccess = {
      admin: ['All sections and components'],
      factory1: [
        '✅ البلينا للتجارة والحسابات',
        '❌ البلينا معرض الجمهورية الدولي (hidden)'
      ],
      factory2: [
        '✅ جرجا للتجارة والحسابات',
        '❌ جرجا معرض مول العرب (hidden)'
      ],
      factory3: [
        '✅ سنتر دلع الهوانم للحسابات',
        '❌ سنتر دلع الهوانم (hidden)'
      ],
      factory4: [
        '✅ سنتر سيما للحسابات',
        '❌ سنتر سيما (hidden)'
      ],
      factory5: [
        '✅ سنتر غزة للحسابات',
        '❌ سنتر غزة (hidden)'
      ]
    };
    
    const userAccess = roleAccess[decoded.userName] || ['❌ No access defined for this role'];
    userAccess.forEach(access => console.log(`   ${access}`));
    
    // Show edit/delete permissions
    const canEditDelete = decoded.userName === 'admin';
    console.log(`\n✏️  Edit/Delete Permissions: ${canEditDelete ? '✅ Allowed' : '❌ Read-only'}`);
    
    return decoded;
    
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    console.log('💡 Make sure the token is a valid JWT format');
  }
}

// Test with a sample token format like yours
function testWithSampleToken() {
  const samplePayload = {
    "userId": "688d4045f66bbb693aa0faf3",
    "role": "factory",
    "userName": "factory1",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 86400
  };
  
  console.log('🧪 Sample token payload:');
  console.log(JSON.stringify(samplePayload, null, 2));
  
  // Create a mock token (for testing only)
  const header = btoa(JSON.stringify({alg: "HS256", typ: "JWT"}));
  const payload = btoa(JSON.stringify(samplePayload));
  const signature = "mock_signature";
  const mockToken = `${header}.${payload}.${signature}`;
  
  console.log('\n🔧 Setting mock token...');
  document.cookie = `accessToken=${mockToken}; path=/; max-age=86400`;
  
  console.log('✅ Mock token set! Now run decodeRealToken() to test');
}

// Make functions available globally
window.decodeRealToken = decodeRealToken;
window.testWithSampleToken = testWithSampleToken;

console.log('🔧 Real token decoder loaded!');
console.log('📋 Available commands:');
console.log('   decodeRealToken()     - Decode current token in cookies');
console.log('   testWithSampleToken() - Set a sample token for testing');
console.log('');
console.log('💡 To test with your real token:');
console.log('   1. Set your token: document.cookie = "accessToken=your_jwt_here; path=/"');
console.log('   2. Decode it: decodeRealToken()');
console.log('   3. Refresh page to see the changes');
