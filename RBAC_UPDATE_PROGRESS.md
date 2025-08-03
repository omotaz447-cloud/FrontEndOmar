# RBAC Update Script for All Components

Below are the components that need RBAC implementation and their corresponding permission names:

## Factory1 Components (البلينا للتجارة والحسابات):
- ✅ `WorkerAccount.tsx` - UPDATED ('حساب عمال البلينا')
- ✅ `MerchantAccount.tsx` - UPDATED ('حسابات تجار البلينا') 
- ⏳ `ExhibitionSales.tsx` - NEEDS UPDATE ('مبيعات البلينا معرض الجمهورية')
- ❌ `RepublicExhibitionAccounts.tsx` - HIDDEN ('البلينا معرض الجمهورية الدولي')

## Factory2 Components (جرجا للتجارة والحسابات):
- ⏳ `MerchantGargaAccount.tsx` - NEEDS UPDATE ('حساب تجار جرجا معرض مول العرب')
- ⏳ `WorkerGargaAccount.tsx` - NEEDS UPDATE ('حسابات عمال جرجا معرض مول العرب')
- ⏳ `ExhibitionGargaSales.tsx` - NEEDS UPDATE ('مبيعات جرجا مول العرب')
- ❌ `GargaMallAccounts.tsx` - HIDDEN ('جرجا معرض مول العرب')

## Factory3 Components (سنتر دلع الهوانم للحسابات):
- ⏳ `CenterDelaaHawanemWorkers.tsx` - NEEDS UPDATE ('حسابات عمال سنتر دلع الهوانم')
- ✅ `CenterDelaaHawanemMerchants.tsx` - UPDATED ('حسابات تجار سنتر دلع الهوانم')
- ⏳ `CenterDelaaHawanemSales.tsx` - NEEDS UPDATE ('مبيعات سنتر دلع الهوانم')
- ❌ `CenterDelaaHawanemCenter.tsx` - HIDDEN ('سنتر دلع الهوانم')

## Factory4 Components (سنتر سيما للحسابات):
- ⏳ `WorkerCenterSeimaAccount.tsx` - NEEDS UPDATE ('حسابات عمال سنتر سيما')
- ⏳ `CenterSeimaMerchantAccount.tsx` - NEEDS UPDATE ('حساب تجار سنتر سيما')
- ⏳ `CenterSeimaSales.tsx` - NEEDS UPDATE ('مبيعات سنتر سيما')
- ❌ `CenterSeimaAccounts.tsx` - HIDDEN ('سنتر سيما')

## Factory5 Components (سنتر غزة للحسابات):
- ⏳ `NewCenterGazaSales.tsx` - NEEDS UPDATE ('مبيعات سنتر غزة')
- ✅ `CenterGazaMerchants.tsx` - UPDATED ('حساب تجار سنتر غزة')
- ⏳ `CenterGazaWorkers.tsx` - NEEDS UPDATE ('حسابات عمال سنتر غزة')
- ❌ `CenterGazaAccounts.tsx` - HIDDEN ('سنتر غزة')

## Implementation Pattern

For each component that needs update, follow this pattern:

### 1. Add Import
```tsx
import { getRolePermissions } from '@/utils/roleUtils';
```

### 2. Add Permission Logic (at component start)
```tsx
const ComponentName: React.FC<Props> = ({ isOpen, onClose }) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('Component Display Name');

  // Check if user can access this component
  useEffect(() => {
    if (isOpen && !permissions.canAccess) {
      toast.error('غير مخول للوصول إلى هذه الصفحة');
      onClose();
      return;
    }
  }, [isOpen, permissions.canAccess, onClose]);
```

### 3. Update Edit/Delete Logic
Replace existing role checks with:
```tsx
// If component has isAdminRole() function:
const isAdminRole = () => {
  return permissions.canEdit && permissions.canDelete;
};

// If component has isFactoryRole() function:
const isFactoryRole = () => {
  return !permissions.canEdit && !permissions.canDelete;
};

// If component has direct checks:
{permissions.canEdit && permissions.canDelete ? (
  // Show edit/delete buttons
) : (
  <span className="text-gray-500 text-xs">غير مسموح</span>
)}
```

## Component Display Names Mapping

Use these exact names when calling `getRolePermissions()`:

### Factory1:
- 'حساب عمال البلينا'
- 'حسابات تجار البلينا'
- 'مبيعات البلينا معرض الجمهورية'

### Factory2:
- 'حساب تجار جرجا معرض مول العرب'
- 'حسابات عمال جرجا معرض مول العرب'
- 'مبيعات جرجا مول العرب'

### Factory3:
- 'حسابات عمال سنتر دلع الهوانم'
- 'حسابات تجار سنتر دلع الهوانم'
- 'مبيعات سنتر دلع الهوانم'

### Factory4:
- 'حسابات عمال سنتر سيما'
- 'حساب تجار سنتر سيما'
- 'مبيعات سنتر سيما'

### Factory5:
- 'مبيعات سنتر غزة'
- 'حساب تجار سنتر غزة'
- 'حسابات عمال سنتر غزة'

## Progress Tracking

- ✅ COMPLETED: 4/15 components updated
- ⏳ REMAINING: 11 components need updates
- ❌ HIDDEN: 5 components (correctly hidden from factory users)

Total active components needing RBAC: 15
Total components with RBAC: 4 (26.7% complete)
