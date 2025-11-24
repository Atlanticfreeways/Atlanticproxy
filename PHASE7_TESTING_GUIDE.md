# Phase 7: Testing Guide

**Complete Testing Instructions for Frontend Integration**

---

## 🚀 QUICK START

### 1. Start Backend
```bash
cd backend
./bin/server
# Should see: "Server running on :5000"
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should see: "ready - started server on 0.0.0.0:3000"
```

### 3. Open Browser
```
http://localhost:3000
```

---

## 🧪 TEST SCENARIOS

### Test 1: User Registration

**Steps:**
1. Click "Register" link on login page
2. Enter email: `test-new@example.com`
3. Enter password: `password123`
4. Enter confirm password: `password123`
5. Click "Create Account"

**Expected Results:**
- ✅ Form validates before submission
- ✅ Success toast appears: "Account created successfully!"
- ✅ Redirects to dashboard
- ✅ User email shows in header

**Error Cases:**
- Invalid email → Warning toast
- Short password → Warning toast
- Passwords don't match → Warning toast

---

### Test 2: User Login

**Steps:**
1. Go to login page
2. Enter email: `test@atlanticproxy.com`
3. Enter password: `password123`
4. Click "Sign In"

**Expected Results:**
- ✅ Form validates
- ✅ Loading state shows: "Signing In..."
- ✅ Success toast: "Login successful!"
- ✅ Redirects to dashboard
- ✅ User email shows in header

**Error Cases:**
- Wrong password → Error toast: "Invalid email or password"
- Network error → Error toast with retry message

---

### Test 3: Dashboard - Proxy Connection

**Steps:**
1. Login successfully
2. Click "🚀 Connect to Proxy" button
3. Wait for response

**Expected Results:**
- ✅ Button shows loading: "Connecting..."
- ✅ Success toast with client ID
- ✅ Status changes to "Connected"
- ✅ Connection details display

**Error Cases:**
- Network error → Error toast
- Rate limit → Error toast: "Too many connection attempts"

---

### Test 4: Dashboard - Proxy Disconnection

**Steps:**
1. After connecting, click "🛑 Disconnect" button
2. Wait for response

**Expected Results:**
- ✅ Button shows loading state
- ✅ Success toast: "Disconnected successfully"
- ✅ Status changes to "Disconnected"

**Error Cases:**
- Network error → Error toast

---

### Test 5: Billing - Load Plans

**Steps:**
1. Click "💳 Billing" in navigation
2. Wait for plans to load

**Expected Results:**
- ✅ Loading state shows: "Loading plans..."
- ✅ Three plans display: Free, Pro, Enterprise
- ✅ Plan details visible
- ✅ Buttons enabled

**Error Cases:**
- Network error → Shows default plans
- API error → Error toast

---

### Test 6: Billing - Subscribe to Plan

**Steps:**
1. On Billing page, click "Upgrade" on Pro plan
2. Wait for response

**Expected Results:**
- ✅ Button shows loading: "Processing..."
- ✅ Success toast: "Subscription initiated!"
- ✅ Redirects to Paystack (or shows URL)

**Error Cases:**
- Network error → Error toast
- Already subscribed → Info toast

---

### Test 7: Billing - Load Invoices

**Steps:**
1. On Billing page, scroll to "Invoice History"
2. Wait for invoices to load

**Expected Results:**
- ✅ Loading state shows: "Loading invoices..."
- ✅ Invoice table displays
- ✅ Shows "No invoices yet" if empty

**Error Cases:**
- Network error → Shows empty state

---

### Test 8: Toast Notifications

**Steps:**
1. Perform any operation (login, connect, etc.)
2. Observe toast notifications

**Expected Results:**
- ✅ Success toasts are green
- ✅ Error toasts are red
- ✅ Warning toasts are yellow
- ✅ Info toasts are blue
- ✅ Toasts auto-dismiss after 3 seconds
- ✅ Manual dismiss button works
- ✅ Multiple toasts stack

---

### Test 9: Loading States

**Steps:**
1. Perform any async operation
2. Observe loading states

**Expected Results:**
- ✅ Buttons show loading text
- ✅ Spinners appear
- ✅ Buttons are disabled during loading
- ✅ Loading states clear after operation

---

### Test 10: Error Handling

**Steps:**
1. Stop backend server
2. Try to login
3. Observe error handling

**Expected Results:**
- ✅ Error toast appears
- ✅ Error message is helpful
- ✅ No console errors
- ✅ Page doesn't crash

---

## 🔍 DETAILED TEST CASES

### Authentication Tests

#### Test: Register with Invalid Email
```
Input: email = "invalid-email"
Expected: Warning toast "Please enter a valid email address"
```

#### Test: Register with Short Password
```
Input: password = "123"
Expected: Warning toast "Password must be at least 6 characters"
```

#### Test: Register with Mismatched Passwords
```
Input: password = "password123", confirm = "password456"
Expected: Warning toast "Passwords do not match"
```

#### Test: Login with Wrong Password
```
Input: email = "test@atlanticproxy.com", password = "wrong"
Expected: Error toast "Invalid email or password"
```

#### Test: Login with Network Error
```
Action: Stop backend, try to login
Expected: Error toast with retry message
```

---

### Proxy Tests

#### Test: Connect to Proxy
```
Action: Click connect button
Expected: 
- Loading state
- Success toast with client ID
- Status updates to "Connected"
```

#### Test: Disconnect from Proxy
```
Action: Click disconnect button
Expected:
- Loading state
- Success toast
- Status updates to "Disconnected"
```

#### Test: Get Proxy Status
```
Action: Dashboard loads
Expected:
- Status displays correctly
- Connection details show if connected
```

---

### Billing Tests

#### Test: Load Plans
```
Action: Navigate to Billing page
Expected:
- Loading state
- Plans display
- All plan details visible
```

#### Test: Subscribe to Plan
```
Action: Click upgrade button
Expected:
- Loading state
- Success toast
- Redirect to payment
```

#### Test: Load Invoices
```
Action: Scroll to invoice history
Expected:
- Loading state
- Invoice table displays
- Empty state if no invoices
```

---

## 📊 BROWSER CONSOLE CHECKS

### No Errors
```bash
# Open browser console (F12)
# Should see NO red error messages
# Only info/warning messages are OK
```

### Network Tab
```bash
# Open Network tab (F12)
# Check all API calls:
# - Status 200 for success
# - Status 401 for auth errors
# - Status 429 for rate limits
# - Status 500 for server errors
```

### Performance
```bash
# Check Network tab
# API calls should complete in < 1 second
# Page load should be < 2 seconds
```

---

## 📱 RESPONSIVE DESIGN TESTS

### Mobile (375px)
```bash
# Open DevTools
# Set viewport to 375x667
# Test:
- [ ] All buttons clickable
- [ ] Text readable
- [ ] Forms work
- [ ] Toasts visible
```

### Tablet (768px)
```bash
# Set viewport to 768x1024
# Test:
- [ ] Layout responsive
- [ ] All features work
- [ ] No horizontal scroll
```

### Desktop (1920px)
```bash
# Set viewport to 1920x1080
# Test:
- [ ] Layout looks good
- [ ] No excessive spacing
- [ ] All features work
```

---

## 🔐 SECURITY TESTS

### Test: Session Expiry
```bash
# 1. Login successfully
# 2. Open DevTools
# 3. Clear localStorage
# 4. Refresh page
# Expected: Redirects to login
```

### Test: Token Validation
```bash
# 1. Login successfully
# 2. Open DevTools
# 3. Modify token in localStorage
# 4. Try to access protected page
# Expected: Error toast, redirect to login
```

### Test: CORS
```bash
# 1. Check Network tab
# 2. All API calls should have CORS headers
# 3. No CORS errors in console
```

---

## 🧪 AUTOMATED TEST CHECKLIST

### Before Completing Phase 7

- [ ] All pages load without errors
- [ ] All forms validate correctly
- [ ] All API calls work
- [ ] All error cases handled
- [ ] All loading states show
- [ ] All toasts display
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Session management works
- [ ] Token validation works
- [ ] Network errors handled
- [ ] Rate limits handled
- [ ] Success messages show
- [ ] Error messages helpful
- [ ] Loading states clear
- [ ] Buttons disabled during loading
- [ ] Forms prevent submission on error
- [ ] Redirects work correctly

---

## 🐛 DEBUGGING TIPS

### If Toast Not Showing
```bash
# 1. Check browser console for errors
# 2. Verify ToastContainer in layout.tsx
# 3. Check showToast import
# 4. Verify toast component exists
```

### If API Calls Failing
```bash
# 1. Check backend is running
# 2. Check Network tab for requests
# 3. Check API response status
# 4. Check error message in response
# 5. Check backend logs
```

### If Loading State Stuck
```bash
# 1. Check browser console for errors
# 2. Check Network tab for hanging requests
# 3. Check try/catch blocks
# 4. Verify finally block runs
```

### If Form Not Validating
```bash
# 1. Check validation logic
# 2. Check error message display
# 3. Check form submission handler
# 4. Check browser console for errors
```

---

## 📝 TEST REPORT TEMPLATE

```markdown
# Phase 7 Testing Report

## Date: [DATE]
## Tester: [NAME]

### Test Results
- [ ] Registration: PASS/FAIL
- [ ] Login: PASS/FAIL
- [ ] Dashboard: PASS/FAIL
- [ ] Billing: PASS/FAIL
- [ ] Error Handling: PASS/FAIL
- [ ] Loading States: PASS/FAIL
- [ ] Toast Notifications: PASS/FAIL
- [ ] Responsive Design: PASS/FAIL

### Issues Found
1. [Issue 1]
2. [Issue 2]

### Notes
[Any additional notes]

### Sign-off
Tested by: [NAME]
Date: [DATE]
Status: APPROVED/NEEDS FIXES
```

---

## 🎯 FINAL VERIFICATION

Before moving to Phase 8, verify:

```bash
# 1. All pages load
curl http://localhost:3000/login
curl http://localhost:3000/register
curl http://localhost:3000/dashboard

# 2. Backend is running
curl http://localhost:5000/health

# 3. No console errors
# Open DevTools → Console → No red errors

# 4. All features work
# Test each feature manually

# 5. Responsive design
# Test on mobile, tablet, desktop

# 6. Error handling
# Stop backend and test error handling
```

---

## ✅ SIGN-OFF CHECKLIST

- [ ] All 12 pages completed
- [ ] All tests passed
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Loading states verified
- [ ] Toast notifications working
- [ ] Form validation working
- [ ] API integration working
- [ ] Ready for Phase 8

---

**Phase 7 Testing Complete!** ✅

Ready to proceed to Phase 8: Deployment & DevOps 🚀
