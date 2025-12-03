# Security Policy

## Supported Versions

Currently supported versions of Atlantic Weizard:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to: **security@atlanticweizard.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (see below)

### 4. Severity Levels

| Severity | Description | Fix Timeline |
|----------|-------------|--------------|
| **Critical** | Remote code execution, SQL injection, authentication bypass | 24-48 hours |
| **High** | XSS, CSRF, sensitive data exposure | 3-7 days |
| **Medium** | Information disclosure, DoS | 14 days |
| **Low** | Minor issues with limited impact | 30 days |

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use Strong Secrets**
   - Generate SESSION_SECRET with: `openssl rand -base64 32`
   - Never commit `.env` file
   - Rotate secrets regularly

3. **Enable HTTPS**
   - Always use HTTPS in production
   - Set `secure: true` for cookies

4. **Database Security**
   - Use strong database passwords
   - Restrict database access
   - Enable SSL for database connections
   - Regular backups

5. **PayU Integration**
   - Test thoroughly in TEST mode
   - Verify hash on all callbacks
   - Never expose merchant salt
   - Monitor transactions

### For Developers

1. **Code Review**
   - All PRs require review
   - Security-focused review for auth/payment code

2. **Input Validation**
   - Validate all user input
   - Use Zod schemas
   - Sanitize data

3. **SQL Injection Prevention**
   - Always use Drizzle ORM
   - Never concatenate SQL strings
   - Use parameterized queries

4. **XSS Prevention**
   - React escapes by default
   - Never use `dangerouslySetInnerHTML`
   - Sanitize user-generated content

5. **Authentication**
   - Use bcrypt for password hashing
   - Implement rate limiting
   - Use secure session storage
   - Enable CSRF protection

## Known Security Considerations

### Current Implementation

✅ **Implemented:**
- Password hashing with bcrypt (10 rounds)
- Session-based authentication
- SQL injection prevention via ORM
- XSS prevention via React
- PayU hash verification
- Environment variable configuration

⚠️ **Recommended Improvements:**
- Add rate limiting (prevent brute force)
- Add security headers (Helmet.js)
- Implement CORS properly
- Add request logging
- Set up monitoring/alerting
- Add 2FA for admin accounts

### Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Configure CORS
- [ ] Add security headers
- [ ] Set up logging
- [ ] Enable monitoring
- [ ] Test payment flow
- [ ] Review all environment variables
- [ ] Audit dependencies
- [ ] Set up database backups
- [ ] Configure firewall
- [ ] Review access controls

## Disclosure Policy

When a vulnerability is reported:

1. We will confirm receipt within 48 hours
2. We will investigate and provide updates
3. We will develop and test a fix
4. We will release a security patch
5. We will credit the reporter (if desired)
6. We will publish a security advisory

## Hall of Fame

We appreciate security researchers who help keep Atlantic Weizard secure:

<!-- Contributors will be listed here -->

## Contact

For security concerns: **security@atlanticweizard.com**

For general support: **support@atlanticweizard.com**

---

**Last Updated:** December 3, 2025
