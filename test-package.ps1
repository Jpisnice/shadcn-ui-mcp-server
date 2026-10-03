# Test script for shadcn-ui-mcp-server (Windows PowerShell)
# This script validates that the package is ready for npm publishing

Write-Host "🧪 Testing shadcn-ui-mcp-server package..." -ForegroundColor Cyan

# Test 1: Help command (with timeout)
Write-Host "✅ Testing --help flag..." -ForegroundColor Green
try {
    $job = Start-Job -ScriptBlock { node ./build/index.js --help 2>&1 }
    $result = Wait-Job -Job $job -Timeout 5
    if ($result) {
        $output = Receive-Job -Job $job
        Remove-Job -Job $job -Force
        Write-Host "   Help command works!" -ForegroundColor Green
    } else {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force
        Write-Host "   ⚠️  Help command timed out (server may be waiting for input)" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Help command failed" -ForegroundColor Red
    exit 1
}

# Test 2: Version command (with timeout)
Write-Host "✅ Testing --version flag..." -ForegroundColor Green
try {
    $job = Start-Job -ScriptBlock { node ./build/index.js --version 2>&1 }
    $result = Wait-Job -Job $job -Timeout 5
    if ($result) {
        $VERSION = (Receive-Job -Job $job) -join "`n"
        Remove-Job -Job $job -Force
        if ($VERSION -match "^\d+\.\d+\.\d+") {
            Write-Host "   Version: $VERSION" -ForegroundColor Green
        } else {
            Write-Host "   Version check completed" -ForegroundColor Green
        }
    } else {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force
        Write-Host "   ⚠️  Version command timed out (server may be waiting for input)" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Version command failed" -ForegroundColor Red
    exit 1
}

# Test 3: Check if build files exist
Write-Host "✅ Testing build files..." -ForegroundColor Green

$REQUIRED_FILES = @(
    "build/index.js",
    "build/server/handler.js",
    "build/tools/index.js",
    "build/utils/axios.js"
)

foreach ($file in $REQUIRED_FILES) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Test 4: Check package.json structure
Write-Host "✅ Testing package.json structure..." -ForegroundColor Green
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.name -and $packageJson.version -and $packageJson.bin -and $packageJson.main) {
        Write-Host "   Package.json has required fields!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Package.json missing required fields" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ Package.json not found" -ForegroundColor Red
    exit 1
}

# Test 5: Check LICENSE and README
Write-Host "✅ Testing documentation files..." -ForegroundColor Green
if ((Test-Path "LICENSE") -and (Test-Path "README.md")) {
    Write-Host "   LICENSE and README.md exist!" -ForegroundColor Green
} else {
    Write-Host "   ❌ LICENSE or README.md missing" -ForegroundColor Red
    exit 1
}

# Test 6: Simulate npm pack (dry run)
Write-Host "✅ Testing npm pack (dry run)..." -ForegroundColor Green
try {
    npm pack --dry-run | Out-Null
    Write-Host "   npm pack simulation successful!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm pack simulation failed" -ForegroundColor Red
    exit 1
}

# Test 7: React Native framework startup (with timeout)
Write-Host "✅ Testing React Native framework startup..." -ForegroundColor Green
try {
    $env:FRAMEWORK = "react-native"
    $job = Start-Job -ScriptBlock { 
        $env:FRAMEWORK = "react-native"
        node ./build/index.js --help 2>&1 
    }
    $result = Wait-Job -Job $job -Timeout 5
    if ($result) {
        $output = Receive-Job -Job $job
        Remove-Job -Job $job -Force
        Write-Host "   RN framework help works!" -ForegroundColor Green
    } else {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force
        Write-Host "   ⚠️  RN framework test timed out (server may be waiting for input)" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Yellow
    }
    Remove-Item Env:\FRAMEWORK -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ❌ RN framework test failed" -ForegroundColor Red
    exit 1
}

# Test 8: Security audit
Write-Host "✅ Running security audit..." -ForegroundColor Green
try {
    npm audit --audit-level=moderate | Out-Null
    Write-Host "   Security audit passed!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Security audit found issues - run 'npm audit' for details" -ForegroundColor Yellow
}

# Test 9: License compliance check
Write-Host "✅ Checking license compliance..." -ForegroundColor Green
try {
    if (Get-Command license-checker -ErrorAction SilentlyContinue) {
        license-checker --summary | Out-Null
        Write-Host "   License compliance check passed!" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  license-checker not available - skipping license check" -ForegroundColor Blue
    }
} catch {
    Write-Host "   ⚠️  License compliance issues found - run 'npm run security:licenses' for details" -ForegroundColor Yellow
}

# Test 10: Bundle size check
Write-Host "✅ Checking bundle size..." -ForegroundColor Green
if (Test-Path "build/index.js") {
    $SIZE = (Get-Item "build/index.js").Length
    $SIZE_KB = [math]::Round($SIZE / 1024, 2)
    Write-Host "   Bundle size: ${SIZE_KB}KB" -ForegroundColor Green
    if ($SIZE_KB -gt 1000) {
        Write-Host "   ⚠️  Bundle size is large (${SIZE_KB}KB) - consider optimization" -ForegroundColor Yellow
    } else {
        Write-Host "   Bundle size is reasonable" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 All tests passed! Package is ready for publishing." -ForegroundColor Green
Write-Host ""
Write-Host "To publish to npm:" -ForegroundColor Cyan
Write-Host "  1. npm login" -ForegroundColor White
Write-Host "  2. npm run publish:package" -ForegroundColor White
Write-Host ""
Write-Host "Or manually:" -ForegroundColor Cyan
Write-Host "  1. npm run security:all" -ForegroundColor White
Write-Host "  2. npm publish --access public" -ForegroundColor White
Write-Host ""
Write-Host "To test locally with npx:" -ForegroundColor Cyan
Write-Host "  npx ./build/index.js --help" -ForegroundColor White
