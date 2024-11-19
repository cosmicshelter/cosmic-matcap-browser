import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// 1. Modify package.json
const packageJsonPath = './package.json';

if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Update or add "dev" and "texture-browser" commands
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.dev = 'npm run texture-browser "vite --host"';
    packageJson.scripts['texture-browser'] = 'node CosmicTextureBrowser/server/check-env-variables.js && concurrently --kill-others "node CosmicTextureBrowser/server/texture-browser-server.js"';

    // Write changes back to package.json
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with new scripts.');
} else {
    console.error('package.json not found. Make sure you run this script in the correct directory.');
    process.exit(1);
}

// 2. Install necessary dependencies using pnpm
try {
    console.log('Installing dependencies...');
    execSync('pnpm add -D cors dotenv express node-fetch concurrently', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
} catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
}
