# JWT Token-Based RBAC Testing Guide

## Token Structure
Your JWT token contains:
```json
{
  "userId": "688d4045f66bbb693aa0faf3",
  "role": "factory",
  "userName": "factory1",  // This is the role identifier
  "iat": 1754252272,
  "exp": 1754338672
}
```

## Role Mapping
The `userName` field in the token determines access:

| userName | Access | Hidden Components |
|----------|--------|-------------------|
| `admin` | All sections | None |
| `factory1` | البلينا للتجارة والحسابات | البلينا معرض الجمهورية الدولي |
| `factory2` | جرجا للتجارة والحسابات | جرجا معرض مول العرب |
| `factory3` | سنتر دلع الهوانم للحسابات | سنتر دلع الهوانم |
| `factory4` | سنتر سيما للحسابات | سنتر سيما |
| `factory5` | سنتر غزة للحسابات | سنتر غزة |

## Testing Instructions

### 1. Using Browser Console
1. Open browser console (F12)
2. Paste the `rbac-test-script.js` content
3. Test different roles:
   ```javascript
   setUserRole("factory1");  // Test factory1 access
   setUserRole("factory2");  // Test factory2 access
   setUserRole("admin");     // Test admin access
   ```
4. Refresh page after each role change
5. Check what sections appear in dashboard

### 2. Using Quick Test
1. Paste `quick-test.js` content in console
2. Run tests:
   ```javascript
   quickTest();        // Test all role mappings
   testCurrentUser();  // Test current token
   getCurrentRole();   // Show current token info
   ```

### 3. Real Token Testing
If you have a real JWT token, you can set it directly:
```javascript
document.cookie = "accessToken=your_real_jwt_token_here; path=/; max-age=86400";
```

## Expected Behavior

### Factory1 User (`userName: "factory1"`)
- ✅ Sees: البلينا للتجارة والحسابات section
- ✅ Can access: حسابات تجار البلينا, حساب عمال البلينا, etc.
- ❌ Hidden: البلينا معرض الجمهورية الدولي
- ❌ Cannot: Edit or delete records
- ❌ Cannot: See other sections (جرجا, سنتر دلع الهوانم, etc.)

### Factory3 User (`userName: "factory3"`)
- ✅ Sees: سنتر دلع الهوانم للحسابات section
- ✅ Can access: حسابات تجار سنتر دلع الهوانم, حسابات عمال سنتر دلع الهوانم, etc.
- ❌ Hidden: سنتر دلع الهوانم
- ❌ Cannot: Edit or delete records
- ❌ Cannot: See other sections

### Admin User (`userName: "admin"`)
- ✅ Sees: All sections
- ✅ Can access: All components
- ✅ Can: Edit and delete records
- ✅ No restrictions

## Troubleshooting

### Issue: Still getting "غير مصرح لك" message
1. Check token is properly set: `getCurrentRole()`
2. Verify userName in token matches expected role
3. Make sure to refresh page after setting token
4. Check browser console for any decode errors

### Issue: Edit/Delete buttons still showing for factory users
1. Verify component is using `getRolePermissions()` correctly
2. Check that permissions.canEdit and permissions.canDelete are both false
3. Make sure component name matches exactly in roleAccess mapping

### Issue: Wrong sections showing
1. Verify Dashboard section filtering is working
2. Check that getFilteredSections() uses correct role mapping
3. Ensure subsection filtering removes restricted items

## Component Implementation Checklist

For each component, ensure:
- [ ] Imports `getRolePermissions` from `@/utils/roleUtils`
- [ ] Uses correct component name (from role mapping)
- [ ] Access check: `if (isOpen && !permissions.canAccess)`
- [ ] Edit/Delete buttons: `{permissions.canEdit && permissions.canDelete ? ... : "غير مسموح"}`

## Files Updated
- ✅ `src/utils/roleUtils.ts` - Token decoding and role extraction
- ✅ `src/pages/Dashboard.tsx` - Token-based authentication
- ✅ `src/components/CenterDelaaHawanemMerchants.tsx` - RBAC implementation
- ✅ `src/components/CenterGazaMerchants.tsx` - RBAC implementation
- ✅ `rbac-test-script.js` - Token-based testing script
- ✅ `quick-test.js` - Updated for token testing
