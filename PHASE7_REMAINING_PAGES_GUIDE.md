# Phase 7: Remaining Pages Integration Guide

**Quick Reference for Completing the Last 5 Pages**

---

## 📋 PATTERN TO FOLLOW

All remaining pages should follow this pattern:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function PageName() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Load data
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const result = await api.someMethod(token!);
      setData(result);
    } catch (error: any) {
      showToast('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      const result = await api.someMethod(token!, formData);
      showToast('Success!', 'success');
      await loadData(); // Refresh data
    } catch (error: any) {
      showToast('Failed: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div>
      {/* Header */}
      {/* Content with loading states */}
      {/* Forms with validation */}
      {/* Error handling */}
    </div>
  );
}
```

---

## 📄 PAGE 8: Analytics Page

**File:** `frontend/app/analytics/page.tsx`

### What to Add:
1. Load usage trends with error handling
2. Load cost analysis with error handling
3. Add loading states for charts
4. Add export functionality with toast
5. Handle empty data gracefully

### API Methods to Use:
```typescript
api.getUsageTrends(token, period)
api.getCostAnalysis(token)
api.exportData(token, format)
```

### Key Features:
- [ ] Period selector (day/week/month)
- [ ] Loading skeleton for charts
- [ ] Export button with toast
- [ ] Error handling for data fetch
- [ ] Empty state message

---

## 👤 PAGE 9: Account Page

**File:** `frontend/app/account/page.tsx`

### What to Add:
1. Load account profile
2. Add password change form with validation
3. Add 2FA enable/disable
4. Add security info display
5. Add account deletion with confirmation

### API Methods to Use:
```typescript
api.getSecurityInfo(token)
api.changePassword(token, oldPassword, newPassword)
api.enable2FA(token)
api.deleteAccount(token)
```

### Key Features:
- [ ] Profile display with loading
- [ ] Password change form with validation
- [ ] 2FA toggle with confirmation
- [ ] Security info display
- [ ] Delete account with confirmation dialog
- [ ] All operations show toasts

### Form Validation:
```typescript
// Password validation
- Old password required
- New password required
- New password min 6 chars
- Passwords don't match error
```

---

## 🤝 PAGE 10: Referrals Page

**File:** `frontend/app/referrals/page.tsx`

### What to Add:
1. Load referral code
2. Add copy-to-clipboard functionality
3. Load referral history
4. Add claim payout button
5. Display referral stats

### API Methods to Use:
```typescript
api.getReferralCode(token)
api.getReferralHistory(token)
api.claimPayout(token)
```

### Key Features:
- [ ] Display referral code
- [ ] Copy button with toast feedback
- [ ] Referral history table
- [ ] Claim payout button
- [ ] Loading states
- [ ] Error handling

### Copy to Clipboard:
```typescript
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!', 'success');
};
```

---

## ⚙️ PAGE 11: Proxy Settings Page

**File:** `frontend/app/proxy-settings/page.tsx`

### What to Add:
1. Load proxy settings
2. Add form for updating settings
3. Add validation for settings
4. Add save functionality
5. Add error handling

### API Methods to Use:
```typescript
api.getProxyStatus(token)
// Add new API methods if needed
```

### Key Features:
- [ ] Settings form with validation
- [ ] Save button with loading state
- [ ] Success/error toasts
- [ ] Form validation
- [ ] Error handling

---

## 🆘 PAGE 12: Support Page

**File:** `frontend/app/support/page.tsx`

### What to Add:
1. Add support request form
2. Add form validation
3. Add submit functionality
4. Add success/error handling
5. Add loading state

### API Methods to Use:
```typescript
// May need to create new API method
api.submitSupportRequest(token, data)
```

### Key Features:
- [ ] Support form with validation
- [ ] Submit button with loading state
- [ ] Success/error toasts
- [ ] Form validation
- [ ] Error handling

### Form Fields:
- Subject (required)
- Category (select)
- Message (required, min 10 chars)
- Priority (select)

---

## 🧪 TESTING CHECKLIST

For each page, test:

### Loading States
- [ ] Page shows loading while fetching data
- [ ] Buttons show loading state while submitting
- [ ] Spinners/skeletons appear

### Error Handling
- [ ] Network errors show toast
- [ ] 401 errors show session expired
- [ ] 429 errors show rate limit
- [ ] Generic errors show friendly message

### Success Handling
- [ ] Success operations show toast
- [ ] Data refreshes after operation
- [ ] User gets feedback

### Form Validation
- [ ] Required fields validated
- [ ] Format validation works
- [ ] Error messages appear
- [ ] Submit disabled until valid

### User Experience
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation)
- [ ] Smooth animations

---

## 🔧 COMMON PATTERNS

### Loading State
```typescript
{loadingData ? (
  <div className="text-center py-8 text-gray-500">Loading...</div>
) : (
  // Content here
)}
```

### Error Toast
```typescript
catch (error: any) {
  showToast('Failed: ' + error.message, 'error');
}
```

### Success Toast
```typescript
showToast('Operation successful!', 'success');
```

### Form Validation
```typescript
if (!email || !password) {
  showToast('Please fill in all fields', 'warning');
  return;
}
```

### Button Loading State
```typescript
<button disabled={submitting}>
  {submitting ? 'Saving...' : 'Save'}
</button>
```

---

## ⏱️ TIME ESTIMATE

- Analytics Page: 1.5-2 hours
- Account Page: 1.5-2 hours
- Referrals Page: 1-1.5 hours
- Proxy Settings: 1-1.5 hours
- Support Page: 0.5-1 hour

**Total: 5-8 hours**

---

## 📝 COMPLETION CHECKLIST

- [ ] All 5 pages updated
- [ ] All pages have error handling
- [ ] All pages have loading states
- [ ] All pages have form validation
- [ ] All pages have toast notifications
- [ ] All API calls use retry logic
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] End-to-end testing passed
- [ ] Ready for Phase 8

---

## 🚀 NEXT PHASE

Once all pages are complete:
1. Run full end-to-end testing
2. Test all error scenarios
3. Test on mobile devices
4. Check accessibility
5. Proceed to Phase 8: Deployment & DevOps

---

**Use this guide to quickly complete the remaining pages!** 🎯
