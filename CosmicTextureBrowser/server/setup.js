import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Helper function to recursively find a folder
const findFolder = (startPath, folderName) => {
    const files = readdirSync(startPath);
    for (const file of files) {
        const fullPath = path.join(startPath, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            if (file === folderName) {
                return fullPath;
            }
            const nestedPath = findFolder(fullPath, folderName);
            if (nestedPath) return nestedPath;
        }
    }
    return null;
};

// Locate CosmicTextureBrowser folder dynamically
const projectRoot = process.cwd();
const cosmicFolderName = 'CosmicTextureBrowser';
const cosmicFolderPath = findFolder(projectRoot, cosmicFolderName);

if (!cosmicFolderPath) {
    console.error(`Error: ${cosmicFolderName} folder not found in the project.`);
    process.exit(1);
}

// Get the relative path for CosmicTextureBrowser
const relativeCosmicFolderPath = path.relative(projectRoot, cosmicFolderPath);
console.log(`Using CosmicTextureBrowser at relative path: ${relativeCosmicFolderPath}`);

// 1. Modify package.json
const packageJsonPath = path.resolve(projectRoot, './package.json');

if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Update or add "dev" and "texture-browser" commands
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.dev = 'npm run texture-browser "vite --host"';
    packageJson.scripts['texture-browser'] = 
        `node ${path.join(relativeCosmicFolderPath, 'server/check-env-variables.js')} && ` +
        `concurrently --kill-others "node ${path.join(relativeCosmicFolderPath, 'server/texture-browser-server.js')}"`;

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
    execSync('pnpm add tweakpane-plugin-preview-select', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
} catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
}
