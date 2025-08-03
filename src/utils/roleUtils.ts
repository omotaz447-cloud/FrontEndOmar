import Cookies from 'js-cookie';

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAccess: boolean;
}

// Decode JWT token to extract user information
export const decodeToken = (token: string) => {
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
};

// Get user role from the JWT token's userName field
export const getUserRole = (): string => {
  const token = Cookies.get('accessToken');
  if (!token) {
    return '';
  }
  
  const decoded = decodeToken(token);
  if (decoded && decoded.userName) {
    return decoded.userName; // This will be "factory1", "factory2", etc.
  }
  
  // Fallback to the old method if token doesn't have userName
  return Cookies.get('userRole') || '';
};

export const hasEditDeletePermission = (): boolean => {
  const userRole = getUserRole();
  return userRole === 'admin';
};

export const getRolePermissions = (componentName?: string): RolePermissions => {
  const userRole = getUserRole();
  
  // Admin has full access to everything
  if (userRole === 'admin') {
    return {
      canEdit: true,
      canDelete: true,
      canAccess: true,
    };
  }

  // Define access rules for each factory role
  const roleAccess: Record<string, string[]> = {
    factory1: [
      'البلينا للتجارة والحسابات',
      'حساب عمال البلينا',
      'حسابات تجار البلينا',
      'مبيعات البلينا معرض الجمهورية'
    ], // Can access البلينا but not البلينا معرض الجمهورية الدولي
    factory2: [
      'جرجا للتجارة والحسابات',
      'حساب تجار جرجا معرض مول العرب',
      'حسابات عمال جرجا معرض مول العرب',
      'مبيعات جرجا مول العرب'
    ], // Can access جرجا but not جرجا معرض مول العرب
    factory3: [
      'سنتر دلع الهوانم للحسابات',
      'حسابات عمال سنتر دلع الهوانم',
      'حسابات تجار سنتر دلع الهوانم',
      'مبيعات سنتر دلع الهوانم'
    ], // Can access سنتر دلع الهوانم accounts but not سنتر دلع الهوانم
    factory4: [
      'سنتر سيما للحسابات',
      'حسابات عمال سنتر سيما',
      'مبيعات سنتر سيما',
      'حساب تجار سنتر سيما'
    ], // Can access سنتر سيما accounts but not سنتر سيما
    factory5: [
      'سنتر غزة للحسابات',
      'مبيعات سنتر غزة',
      'حساب تجار سنتر غزة',
      'حسابات عمال سنتر غزة'
    ], // Can access سنتر غزة accounts but not سنتر غزة
  };

  const allowedComponents = roleAccess[userRole] || [];
  const canAccess = componentName ? allowedComponents.includes(componentName) : false;

  return {
    canEdit: false, // Factory users cannot edit
    canDelete: false, // Factory users cannot delete
    canAccess,
  };
};

export const getRestrictedComponents = (): string[] => {
  const userRole = getUserRole();
  
  // Components that should be hidden based on user role
  const restrictedComponents: Record<string, string[]> = {
    factory1: ['البلينا معرض الجمهورية الدولي'],
    factory2: ['جرجا معرض مول العرب'],
    factory3: ['سنتر دلع الهوانم'],
    factory4: ['سنتر سيما'],
    factory5: ['سنتر غزة'],
  };

  return restrictedComponents[userRole] || [];
};

export const shouldShowComponent = (componentName: string): boolean => {
  const userRole = getUserRole();
  
  // Admin can see everything
  if (userRole === 'admin') {
    return true;
  }

  const restrictedComponents = getRestrictedComponents();
  return !restrictedComponents.includes(componentName);
};
