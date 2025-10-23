#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionType = process.argv[2];

if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Usage: node bump-version.js <patch|minor|major>');
  process.exit(1);
}

console.log(`🔄 Bumping ${versionType} version...`);

try {
  // Read current package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const currentVersion = packageJson.version;
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Parse version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (versionType) {
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
  }
  
  console.log(`📈 New version: ${newVersion}`);
  
  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ Updated package.json');
  
  // Create git tag
  try {
    execSync(`git add package.json`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    console.log(`✅ Created git tag v${newVersion}`);
  } catch (error) {
    console.log('⚠️  Git operations failed (this is okay if not in a git repo)');
  }
  
  console.log(`🎉 Version bumped to ${newVersion}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. npm run security:all');
  console.log('  2. npm run test');
  console.log('  3. npm publish --access public');
  
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
