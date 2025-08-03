# Role-Based Access Control Implementation Guide

## Overview
This document explains how to implement role-based access control (RBAC) across all components in the system.

## User Roles and Permissions

### Admin (`userRole === 'admin'`)
- **Full access** to all pages and components
- **Can edit and delete** all records
- **Sees all dropdown options** in navigation

### Factory Roles

#### Factory1 (`userRole === 'factory1'`)
- **Access to**: البلينا للتجارة والحسابات
- **Hidden**: البلينا معرض الجمهورية الدولي
- **Cannot**: Edit or delete records (read-only)

#### Factory2 (`userRole === 'factory2'`)
- **Access to**: جرجا للتجارة والحسابات
- **Hidden**: جرجا معرض مول العرب
- **Cannot**: Edit or delete records (read-only)

#### Factory3 (`userRole === 'factory3'`)
- **Access to**: سنتر دلع الهوانم للحسابات
- **Hidden**: سنتر دلع الهوانم
- **Cannot**: Edit or delete records (read-only)

#### Factory4 (`userRole === 'factory4'`)
- **Access to**: سنتر سيما للحسابات
- **Hidden**: سنتر سيما
- **Cannot**: Edit or delete records (read-only)

#### Factory5 (`userRole === 'factory5'`)
- **Access to**: سنتر غزة للحسابات
- **Hidden**: سنتر غزة
- **Cannot**: Edit or delete records (read-only)

## Implementation Steps

### 1. Utility Functions (`src/utils/roleUtils.ts`)
Already created with the following functions:
- `getUserRole()`: Gets user role from cookies
- `hasEditDeletePermission()`: Checks if user can edit/delete
- `getRolePermissions(componentName)`: Gets permissions for specific component
- `getRestrictedComponents()`: Gets list of restricted components for current user
- `shouldShowComponent(componentName)`: Checks if component should be visible

### 2. Component-Level Implementation

#### Step 1: Import the utility
```tsx
import { getRolePermissions } from '@/utils/roleUtils';
```

#### Step 2: Get permissions at component start
```tsx
const ComponentName: React.FC<Props> = ({ isOpen, onClose }) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('Component Display Name');

  // Check if user can access this component
  useEffect(() => {
    if (isOpen && !permissions.canAccess && !permissions.canEdit) {
      toast.error('غير مخول للوصول إلى هذه الصفحة');
      onClose();
      return;
    }
  }, [isOpen, permissions.canAccess, permissions.canEdit, onClose]);
```

#### Step 3: Conditionally show edit/delete buttons
```tsx
<TableCell className="text-center">
  {permissions.canEdit && permissions.canDelete ? (
    <div className="flex justify-center space-x-1 space-x-reverse">
      <Button onClick={() => handleEdit(item)}>
        <Edit className="w-3 h-3" />
      </Button>
      <Button onClick={() => setDeleteItem(item)}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  ) : (
    <span className="text-gray-500 text-xs">غير مسموح</span>
  )}
</TableCell>
```

**Important:** Make sure to use the correct component names when calling `getRolePermissions()`. The component names must match exactly with the names defined in the role access mapping.

### 🔧 **Common Issues and Solutions:**

#### Issue 1: Getting "غير مخول للوصول" even for allowed users
**Cause:** Wrong component name passed to `getRolePermissions()`
**Solution:** Use the exact component name from the role mapping:

```tsx
// ❌ Wrong - using section title
const permissions = getRolePermissions('سنتر دلع الهوانم للحسابات');

// ✅ Correct - using actual component name
const permissions = getRolePermissions('حسابات تجار سنتر دلع الهوانم');
```

#### Issue 2: Access check logic is wrong
**Cause:** Using `!permissions.canAccess && !permissions.canEdit`
**Solution:** Use only `!permissions.canAccess`:

```tsx
// ❌ Wrong logic
if (isOpen && !permissions.canAccess && !permissions.canEdit) {

// ✅ Correct logic
if (isOpen && !permissions.canAccess) {
```

### 3. Dashboard-Level Implementation

The Dashboard (`src/pages/Dashboard.tsx`) already implements:
- **Section filtering**: Shows only allowed sections for each role
- **Subsection filtering**: Hides restricted subsections (like معرض options)
- **Role-specific content**: Different titles and greetings for each role

## Component Mapping

### Correct Component Names for getRolePermissions():

#### البلينا للتجارة والحسابات (factory1)
- ✅ WorkerAccount - `'حساب عمال البلينا'`
- ✅ MerchantAccount - `'حسابات تجار البلينا'`
- ✅ ExhibitionSales - `'مبيعات البلينا معرض الجمهورية'`
- ❌ RepublicExhibitionAccounts - `'البلينا معرض الجمهورية الدولي'` (HIDDEN)

#### جرجا للتجارة والحسابات (factory2)
- ✅ MerchantGargaAccount - `'حساب تجار جرجا معرض مول العرب'`
- ✅ WorkerGargaAccount - `'حسابات عمال جرجا معرض مول العرب'`
- ✅ ExhibitionGargaSales - `'مبيعات جرجا مول العرب'`
- ❌ GargaMallAccounts - `'جرجا معرض مول العرب'` (HIDDEN)

#### سنتر دلع الهوانم للحسابات (factory3)
- ✅ CenterDelaaHawanemWorkers - `'حسابات عمال سنتر دلع الهوانم'`
- ✅ CenterDelaaHawanemMerchants - `'حسابات تجار سنتر دلع الهوانم'` (IMPLEMENTED)
- ✅ CenterDelaaHawanemSales - `'مبيعات سنتر دلع الهوانم'`
- ❌ CenterDelaaHawanemCenter - `'سنتر دلع الهوانم'` (HIDDEN)

#### سنتر سيما للحسابات (factory4)
- ✅ WorkerCenterSeimaAccount - `'حسابات عمال سنتر سيما'`
- ✅ CenterSeimaMerchantAccount - `'حساب تجار سنتر سيما'`
- ✅ CenterSeimaSales - `'مبيعات سنتر سيما'`
- ❌ CenterSeimaAccounts - `'سنتر سيما'` (HIDDEN)

#### سنتر غزة للحسابات (factory5)
- ✅ NewCenterGazaSales - `'مبيعات سنتر غزة'`
- ✅ CenterGazaMerchants - `'حساب تجار سنتر غزة'` (IMPLEMENTED)
- ✅ CenterGazaWorkers - `'حسابات عمال سنتر غزة'`
- ❌ CenterGazaAccounts - `'سنتر غزة'` (HIDDEN)

## Testing the Implementation

1. **Set userRole in cookies**:
   ```javascript
   // In browser console
   document.cookie = "userRole=factory1; path=/";
   document.cookie = "accessToken=your_token; path=/";
   ```

2. **Test scenarios**:
   - Login as admin → Should see everything with edit/delete
   - Login as factory1 → Should only see البلينا components, no edit/delete
   - Login as factory2 → Should only see جرجا components, no edit/delete
   - etc.

## Next Steps

Apply the same pattern to all remaining components:
1. Import `getRolePermissions`
2. Add permission check in component
3. Add access control useEffect
4. Conditionally render edit/delete buttons

This ensures consistent role-based access control across the entire application.
