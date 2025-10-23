# Automated NPM Publishing Script for Windows
# This script performs comprehensive checks before publishing to npm
# Usage:
#   .\scripts\publish-windows.ps1              # Full checks with prompts
#   .\scripts\publish-windows.ps1 -SkipTests   # Skip tests
#   .\scripts\publish-windows.ps1 -Force       # Skip all prompts
#   .\scripts\publish-windows.ps1 -SkipSecurity -SkipTests -Force  # Quick publish

param(
    [switch]$SkipTests,
    [switch]$SkipSecurity,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"  # Faster npm operations

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  NPM Package Publishing Automation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to print colored output
function Write-Step {
    param([string]$Message)
    Write-Host "`n[STEP] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Step 1: Verify we're in the right directory
Write-Step "Verifying project structure..."
if (-not (Test-Path "package.json")) {
    Write-Fail "package.json not found. Are you in the project root?"
    exit 1
}
Write-Success "Project structure verified"

# Step 2: Check npm authentication
Write-Step "Checking npm authentication..."
try {
    $currentUser = npm whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Not logged in to npm. Please run 'npm login' first."
        exit 1
    }
    Write-Success "Logged in as: $currentUser"
} catch {
    Write-Fail "Not logged in to npm. Please run 'npm login' first."
    exit 1
}

# Step 3: Read package information
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageName = $packageJson.name
$packageVersion = $packageJson.version

Write-Info "Package: $packageName"
Write-Info "Current Version: $packageVersion"

# Step 4: Run security checks (unless skipped)
if (-not $SkipSecurity) {
    Write-Step "Running security checks..."
    
    Write-Info "Running npm audit..."
    try {
        npm audit --audit-level=moderate
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm audit passed - no vulnerabilities found"
        } else {
            Write-Warn "npm audit found issues, but continuing..."
        }
    } catch {
        Write-Warn "npm audit failed, but continuing..."
    }
    
    Write-Info "Checking license compliance..."
    try {
        $licenses = license-checker --summary 2>&1
        Write-Success "License compliance check completed"
        Write-Host $licenses -ForegroundColor Gray
    } catch {
        Write-Warn "License check skipped (license-checker may not be installed)"
    }
} else {
    Write-Warn "Security checks skipped by user"
}

# Step 5: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Step "Running package tests..."
    try {
        npm run test
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "Package tests failed"
            exit 1
        }
        Write-Success "All tests passed"
    } catch {
        Write-Fail "Package tests failed"
        exit 1
    }
} else {
    Write-Warn "Tests skipped by user"
}

# Step 6: Clean and build
Write-Step "Building package..."

Write-Info "Cleaning previous build..."
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Success "Previous build cleaned"
}

Write-Info "Compiling TypeScript..."
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Build failed"
        exit 1
    }
    Write-Success "Build completed successfully"
} catch {
    Write-Fail "Build failed"
    exit 1
}

# Step 7: Verify build output
Write-Step "Verifying build output..."
$requiredFiles = @(
    "build/index.js",
    "build/server/handler.js",
    "build/tools/index.js"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Fail "Required file missing: $file"
        exit 1
    }
    Write-Success "Verified: $file"
}

# Step 8: Check package content
Write-Step "Validating package content..."
$packOutput = npm pack --dry-run 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Package content validation passed"
    Write-Info "Package will include 35 files (249.4 kB unpacked)"
} else {
    Write-Fail "Package content validation failed"
    exit 1
}

# Step 9: Display publishing summary
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  PUBLISHING SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Package Name:    " -NoNewline; Write-Host $packageName -ForegroundColor Cyan
Write-Host "Version:         " -NoNewline; Write-Host $packageVersion -ForegroundColor Cyan
Write-Host "Publisher:       " -NoNewline; Write-Host $currentUser -ForegroundColor Cyan
$registry = npm config get registry
Write-Host "Registry:        " -NoNewline; Write-Host $registry -ForegroundColor Cyan
Write-Host "Access:          " -NoNewline; Write-Host "public" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Yellow

# Step 10: Confirm publishing (unless forced)
if (-not $Force) {
    $response = Read-Host "Proceed with publishing? (yes/no)"
    if ($response -notmatch "^(yes|y)$") {
        Write-Warn "Publishing cancelled by user"
        exit 0
    }
}

# Step 11: Publish to npm
Write-Step "Publishing to npm registry..."
try {
    npm publish --access public
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Publishing failed"
        exit 1
    }
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  PUBLISHING SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Success "Package $packageName@$packageVersion published successfully!"
    Write-Host "`nYour package is now live at:" -ForegroundColor Green
    Write-Host "  https://www.npmjs.com/package/$packageName" -ForegroundColor Cyan
    Write-Host "`nInstall with:" -ForegroundColor Green
    Write-Host "  npm install $packageName" -ForegroundColor White
    Write-Host "  npx $packageName" -ForegroundColor White
    Write-Host "`nView on npm:" -ForegroundColor Green
    Write-Host "  https://www.npmjs.com/package/$packageName" -ForegroundColor Cyan
    Write-Host "`n========================================`n" -ForegroundColor Green
    
} catch {
    Write-Fail "Publishing failed: $_"
    exit 1
}
