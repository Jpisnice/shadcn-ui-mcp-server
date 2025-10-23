# Publishing Guide

Complete guide for publishing `@jpisnice/shadcn-ui-mcp-server` to npm.

## 🎯 Quick Start

### Publish New Version (Recommended)

```bash
# 1. Bump version
npm run version:patch   # or minor/major

# 2. Publish with automated checks
npm run publish:auto
```

### Quick Publish (Skip Tests)

```bash
npm run publish:quick
```

---

## 📦 Current Package Status

- **Package**: `@jpisnice/shadcn-ui-mcp-server`
- **Current Version**: `1.1.4`
- **Registry**: https://registry.npmjs.org/
- **Access**: Public
- **NPM Page**: https://www.npmjs.com/package/@jpisnice/shadcn-ui-mcp-server

---

## 🛠️ Available Commands

### Version Management

```bash
npm run version:patch   # 1.1.4 → 1.1.5 (bug fixes)
npm run version:minor   # 1.1.4 → 1.2.0 (new features)
npm run version:major   # 1.1.4 → 2.0.0 (breaking changes)
```

### Publishing

```bash
npm run publish:auto    # Full automation with checks
npm run publish:quick   # Skip tests, auto-confirm
npm publish --access public  # Manual (runs prepublishOnly)
```

### Security & Testing

```bash
npm run security:all        # All security checks
npm run security:audit      # npm audit only
npm run security:licenses   # License compliance
npm run test               # Run package tests
```

### Build

```bash
npm run clean              # Remove build directory
npm run build              # Compile TypeScript
npm run dev                # Build and run
```

---

## 🔒 Security Features

### Automated Security Checks

✅ **npm audit** - Vulnerability scanning  
✅ **license-checker** - License compliance  
✅ **Snyk** - Deep security analysis (optional)  
✅ **0 vulnerabilities** in current dependencies  

### Pre-publish Validation

The `prepublishOnly` hook automatically runs:
1. Security audit
2. License check
3. Package tests
4. Clean build
5. TypeScript compilation

---

## 📋 Publishing Workflow

### Complete Workflow

```bash
# 1. Make your changes
# ... edit files ...

# 2. Test locally
npm run build
npm run test

# 3. Bump version
npm run version:patch

# 4. Publish
npm run publish:auto

# 5. Push git tags (optional)
git push --tags
```

### What Happens During Publishing

1. ✅ **Project validation** - Verifies package.json exists
2. ✅ **Authentication check** - Confirms npm login
3. ✅ **Security scan** - Runs npm audit + license check
4. ✅ **Package tests** - Validates functionality
5. ✅ **Clean build** - Removes old files, compiles TypeScript
6. ✅ **Build verification** - Checks required files exist
7. ✅ **Package validation** - Tests npm pack
8. ✅ **Publishing summary** - Shows what will be published
9. ✅ **User confirmation** - Asks for approval (unless -Force)
10. ✅ **npm publish** - Publishes to registry
11. ✅ **Success message** - Shows package URL

---

## 🎨 Publishing Options

### Standard Publish (Recommended)

For production releases with full validation:

```bash
npm run publish:auto
```

**Includes:**
- ✅ Security checks
- ✅ Package tests
- ✅ Build verification
- ✅ User confirmation prompt

### Quick Publish

For urgent fixes or documentation updates:

```bash
npm run publish:quick
```

**Skips:**
- ⏭️ Package tests
- ⏭️ User confirmation

**Still runs:**
- ✅ Security checks
- ✅ Build verification

### Manual Publish

For advanced users or CI/CD:

```bash
npm publish --access public
```

**Note:** This still runs the `prepublishOnly` hook which includes all checks.

---

## 🐛 Troubleshooting

### Error: "Not logged in to npm"

**Solution:**
```bash
npm login
```

### Error: "Package version already exists"

**Solution:**
```bash
# Bump version first
npm run version:patch

# Then publish
npm run publish:auto
```

### Error: "Tests failed"

**Solutions:**
1. Fix the tests:
   ```bash
   npm run test  # See what's failing
   ```

2. Skip tests (if safe):
   ```bash
   npm run publish:quick
   ```

### Error: "Build failed"

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm run build

# Check for TypeScript errors
tsc --noEmit
```

### Error: "Security vulnerabilities found"

**Solution:**
```bash
# Check details
npm audit

# Fix automatically (if possible)
npm audit fix

# Or fix manually
npm update [package-name]
```

---

## 📚 Version Numbering

We follow [Semantic Versioning](https://semver.org/):

### MAJOR.MINOR.PATCH (e.g., 1.1.4)

- **MAJOR** (1.x.x) - Breaking changes
  - API changes
  - Removed features
  - Incompatible updates

- **MINOR** (x.1.x) - New features
  - New functionality
  - Backwards compatible
  - Deprecations

- **PATCH** (x.x.4) - Bug fixes
  - Bug fixes
  - Performance improvements
  - Documentation updates

### Examples

```bash
# Bug fix: 1.1.4 → 1.1.5
npm run version:patch

# New feature: 1.1.4 → 1.2.0
npm run version:minor

# Breaking change: 1.1.4 → 2.0.0
npm run version:major
```

---

## 🎯 Best Practices

1. **Always test before publishing**
   ```bash
   npm run test
   npm run build
   ```

2. **Use appropriate version bumps**
   - Bug fixes = patch
   - New features = minor
   - Breaking changes = major

3. **Review security audits**
   ```bash
   npm audit
   ```

4. **Keep dependencies updated**
   ```bash
   npm update
   npm audit fix
   ```

5. **Document changes**
   - Update README.md for user-facing changes
   - Update comments for code changes

6. **Push git tags**
   ```bash
   git push --tags
   ```

---

## 📝 Files & Scripts

### Publishing Scripts

- `scripts/publish.ps1` - Main publishing automation (Windows)
- `scripts/bump-version.js` - Version management
- `scripts/README.md` - Detailed script documentation

### Configuration Files

- `package.json` - Package metadata and scripts
- `.npmignore` - Files excluded from npm package
- `tsconfig.json` - TypeScript configuration

### Test Files

- `test-package.ps1` - Windows PowerShell tests
- `test-package.sh` - Bash tests (for reference)

---

## 🔗 Useful Links

- **NPM Package**: https://www.npmjs.com/package/@jpisnice/shadcn-ui-mcp-server
- **GitHub Repo**: https://github.com/Jpisnice/shadcn-ui-mcp-server
- **npm Documentation**: https://docs.npmjs.com/
- **Semantic Versioning**: https://semver.org/
- **Security Best Practices**: https://docs.npmjs.com/packages-and-modules/securing-your-code

---

## ✅ Checklist Before Publishing

- [ ] All changes committed to git
- [ ] Tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] Security audit clean (`npm audit`)
- [ ] Version bumped (`npm run version:*`)
- [ ] README.md updated (if needed)
- [ ] Ready to publish (`npm run publish:auto`)

---

## 📊 Package Statistics

- **Size**: 46.7 kB (packaged)
- **Unpacked Size**: 249.5 kB
- **Files**: 35
- **Dependencies**: 8 production, 4 dev
- **Node Version**: ≥18.0.0
- **License**: MIT

---

**Happy Publishing! 🚀**

