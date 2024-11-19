#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import readline from 'readline';

// Helper function to prompt user for confirmation
const askForConfirmation = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === '' || answer.trim().toLowerCase() === 'y');
        });
    });
};

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

// Main function
const main = async () => {
    const projectRoot = process.cwd();
    const cosmicFolderName = 'CosmicTextureBrowser';
    const cosmicFolderPath = findFolder(projectRoot, cosmicFolderName);

    if (!cosmicFolderPath) {
        console.error(`Error: ${cosmicFolderName} folder not found in the project.`);
        process.exit(1);
    }

    const relativeCosmicFolderPath = path.relative(projectRoot, cosmicFolderPath);
    console.log(`Using CosmicTextureBrowser at relative path: ${relativeCosmicFolderPath}`);

    const packageJsonPath = path.resolve(projectRoot, './package.json');
    const confirmationMessage = `
This will:
1. Modify your package.json file to add necessary scripts.
2. Install required dependencies (cors, dotenv, express, node-fetch, concurrently, tweakpane-plugin-preview-select).

Press ENTER to proceed or type 'n' to cancel: `;

    const proceed = await askForConfirmation(confirmationMessage);

    if (!proceed) {
        console.log('Operation cancelled by the user.');
        process.exit(0);
    }

    // Modify package.json
    if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
        packageJson.scripts = packageJson.scripts || {};
    
        // Preserve the existing `dev` script if it exists
        const existingDevScript = packageJson.scripts.dev || '';
    
        // Define the new commands to add
        const newCommands = [
            existingDevScript ? `\"${existingDevScript}\"` : null, // Include existing dev script if it exists
            `"npm run texture-browser"`
        ].filter(Boolean).join(' '); // Filter out null and join commands
    
        // Update the `dev` script to use concurrently
        packageJson.scripts.dev = `concurrently --kill-others ${newCommands}`;
    
        // Add the `texture-browser` script
        packageJson.scripts['texture-browser'] = 
            `node ${path.join(relativeCosmicFolderPath, 'server/texture-browser-server.js')}`;
    
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Updated package.json with merged dev script using concurrently.');
    } else {
        console.error('package.json not found. Make sure you run this script in the correct directory.');
        process.exit(1);
    }
    
    

    // Install dependencies
    try {
        console.log('Installing dependencies...');
        execSync('pnpm add -D cors dotenv express node-fetch concurrently', { stdio: 'inherit' });
        execSync('pnpm add tweakpane-plugin-preview-select', { stdio: 'inherit' });
        console.log('Dependencies installed successfully.');
    } catch (error) {
        console.error('Error installing dependencies:', error.message);
        process.exit(1);
    }
};

main();
