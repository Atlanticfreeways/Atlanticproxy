# Security Checklist

## ⚠️ CRITICAL: Environment File Security

### Files Containing Sensitive Data
The following files contain API keys, secrets, and credentials:

```
.env
.env.prod
scripts/proxy-client/.env
atlantic-dashboard/.env.local
```

### ✅ Verification Steps

1. **Check git status:**
```bash
git status --ignored
```

2. **Verify .env files are ignored:**
```bash
git check-ignore .env .env.prod scripts/proxy-client/.env
```

3. **Remove from git history if committed:**
```bash
git rm --cached .env .env.prod scripts/proxy-client/.env
git commit -m "Remove sensitive environment files"
```

### 🔐 Best Practices

- ✅ Use `.env.example` templates (committed)
- ✅ Use `.env.local` for actual secrets (gitignored)
- ❌ Never commit actual API keys
- ✅ Rotate keys if accidentally committed
- ✅ Use environment-specific files (`.env.development`, `.env.production`)

### 🚨 If Credentials Were Exposed

1. **Immediately rotate all keys:**
   - Paystack API keys
   - Oxylabs credentials
   - JWT secrets
   - Database passwords

2. **Remove from git history:**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.prod" \
  --prune-empty --tag-name-filter cat -- --all
```

3. **Force push (if safe):**
```bash
git push origin --force --all
```

### 📋 Required Environment Variables

**Backend (`scripts/proxy-client/.env`):**
- PAYSTACK_SECRET_KEY
- PAYSTACK_PUBLIC_KEY
- JWT_SECRET
- OXYLABS_USERNAME (if using Oxylabs)
- OXYLABS_PASSWORD

**Dashboard (`atlantic-dashboard/.env.local`):**
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

---

**Last Updated:** January 2026
