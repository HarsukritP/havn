# Security Best Practices - SpotSave

## 🚨 Critical Security Rules

### NEVER Commit These to Git:
- ❌ `.env` files (even for development!)
- ❌ Actual passwords or API keys
- ❌ JWT secrets
- ❌ AWS credentials
- ❌ Database connection strings with real credentials
- ❌ Any file containing the word "SECRET" or "PASSWORD" with actual values

### ✅ What's Safe to Commit:
- ✅ `env.example` (with placeholder values only)
- ✅ `docker-compose.yml` (using environment variables)
- ✅ Documentation with FAKE example credentials

---

## 🔐 Initial Setup (Local Development)

### 1. Create Your Environment File

```bash
# Copy the example file
cp env.example .env

# Generate strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# On macOS/Linux, update .env automatically
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env
echo "DB_PASSWORD=$POSTGRES_PASSWORD" >> .env
echo "JWT_SECRET=$JWT_SECRET" >> .env
```

### 2. Verify .env is Ignored by Git

```bash
# This should return nothing (file is ignored)
git status .env

# If it shows the file, check .gitignore
cat .gitignore | grep ".env"
```

### 3. Start Services

```bash
# Load environment variables and start Docker
source .env
docker-compose up -d
```

---

## 🛡️ Production Security Checklist

### Environment Variables
- [ ] All secrets stored in environment variables (not in code)
- [ ] `.env` file is never committed to git
- [ ] Use secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Rotate secrets regularly (every 90 days minimum)

### Database Security
- [ ] Strong password (32+ characters, random)
- [ ] SSL/TLS enabled for connections (`DB_SSL_MODE=require`)
- [ ] Database not publicly accessible (private subnet)
- [ ] Regular backups enabled
- [ ] Principle of least privilege for database users

### JWT Security
- [ ] JWT secret is 64+ characters random string
- [ ] Token expiry set (7 days max for refresh tokens)
- [ ] Use HTTPS only (never HTTP in production)
- [ ] Implement token refresh mechanism
- [ ] Add token blacklist for logout

### API Security
- [ ] Rate limiting enabled (100 req/min per user)
- [ ] CORS configured (allow only known origins)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)

### Infrastructure
- [ ] HTTPS/TLS 1.3 for all connections
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates
- [ ] Error tracking enabled (Sentry)
- [ ] Logging enabled (but don't log secrets!)

---

## 🔧 Rotating Secrets (Production)

### When to Rotate:
- Every 90 days (scheduled)
- When an employee leaves
- After a suspected breach
- When credentials might have been exposed

### How to Rotate JWT Secret:

```bash
# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 64)

# 2. Update .env file
echo "JWT_SECRET=$NEW_JWT_SECRET" > .env.new

# 3. Deploy with zero downtime (keep old secret for 24h)
# This allows existing tokens to remain valid during transition

# 4. After 24h, remove old secret completely
```

### How to Rotate Database Password:

```sql
-- 1. Create new password
-- 2. Update user password
ALTER USER spotsave WITH PASSWORD 'new_secure_password_here';

-- 3. Update .env file
-- 4. Restart services
```

---

## 📋 Security Incident Response

### If Credentials Are Exposed:

1. **Immediate Actions (< 5 minutes):**
   - Rotate ALL exposed credentials immediately
   - Revoke all active JWT tokens
   - Check access logs for suspicious activity

2. **Short-term Actions (< 24 hours):**
   - Notify all team members
   - Review git history for other exposures
   - Force password reset for affected users
   - Enable 2FA if not already enabled

3. **Long-term Actions (< 1 week):**
   - Conduct security audit
   - Review and update security policies
   - Implement additional monitoring
   - Document incident and lessons learned

### GitGuardian Alert Response:

```bash
# 1. DO NOT ignore the alert!
# 2. Rotate the exposed secret immediately
# 3. Remove secret from git history (if committed)

# Remove from git history (use with caution!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file/with/secret" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if necessary and coordinated with team)
git push origin --force --all

# 4. Verify secret is rotated everywhere
```

---

## 🎓 Security Training

### For Developers:

**Before Committing Code:**
1. Run `git diff` to review changes
2. Search for common secret patterns: `grep -r "password\|secret\|key" .`
3. Verify `.env` is not staged: `git status | grep .env`
4. Use pre-commit hooks (recommended)

**Pre-commit Hook Example:**

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Prevent committing .env files

if git diff --cached --name-only | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example$"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Remove .env from staging: git reset HEAD .env"
    exit 1
fi

# Check for common secret patterns
if git diff --cached | grep -iE "(password|secret|api_key|private_key).*=.*['\"]([^'\"]){8,}['\"]"; then
    echo "⚠️  WARNING: Possible secrets detected in staged changes"
    echo "Review your changes carefully before committing"
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [GitGuardian Security Guide](https://www.gitguardian.com/secrets-detection)

---

## 📞 Security Contact

For security issues, please email: [REPLACE_WITH_YOUR_EMAIL]

**DO NOT** open public GitHub issues for security vulnerabilities.

