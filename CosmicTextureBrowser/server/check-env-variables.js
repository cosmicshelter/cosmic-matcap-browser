import fs from 'fs';
import * as dotenv from 'dotenv';
import { networkInterfaces } from 'os';

dotenv.config();

writeTextureBrowserPort();


/**
 * Write Server IP
 */
const devServerIp = getDevServerIp();
writeDevServerIP();

function getDevServerIp() {
    const networks = networkInterfaces();
    const devServerIp = networks.en0.filter((item) => {
        return item.family === 'IPv4';
    })[0].address;
    return devServerIp;
}

function writeDevServerIP() {
    const envFileContent = fs.readFileSync('./.env', 'utf8');
    const envFileLines = envFileContent.split('\n');
    let devServerLineFound = false;
    for (let i = 0; i < envFileLines.length; i++) {
        if (envFileLines[i].includes('VITE_DEV_SERVER_IP')) {
            console.log(`\n🫡  Updating VITE_DEV_SERVER_IP env variable to ${devServerIp} 🫡\n`);
            envFileLines[i] = `VITE_DEV_SERVER_IP=${devServerIp}`;
            devServerLineFound = true;
        }
    }
    if (devServerLineFound) {
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    } else {
        console.log('\n❌ VITE_DEV_SERVER_IP env variable was not found! ❌\n');
        console.log('\n🫡  Creating VITE_DEV_SERVER_IP env variable 🫡\n');
        envFileLines.push(`VITE_DEV_SERVER_IP=${devServerIp}`);
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    }
}

function writeTextureBrowserPort() {
    const envFileContent = fs.readFileSync('./.env', 'utf8');
    const envFileLines = envFileContent.split('\n');
    let textureBrowserFound = false;
    const port = randomIntFromRange(8081, 9999);
    for (let i = 0; i < envFileLines.length; i++) {
        if (envFileLines[i].includes('VITE_TEXTURE_BROWSER_SERVER_PORT')) {
            console.log(`\n🫡  Updating VITE_TEXTURE_BROWSER_SERVER_PORT env variable to ${port} 🫡\n`);
            envFileLines[i] = `VITE_TEXTURE_BROWSER_SERVER_PORT=${port}`;
            textureBrowserFound = true;
        }
    }
    if (textureBrowserFound) {
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    } else {
        console.log('\n❌ VITE_TEXTURE_BROWSER_SERVER_PORT env variable was not found! ❌\n');
        console.log('\n🫡  Creating VITE_TEXTURE_BROWSER_SERVER_PORT env variable 🫡\n');
        envFileLines.push(`VITE_TEXTURE_BROWSER_SERVER_PORT=${port}`);
        const newEnvFileContent = envFileLines.join('\n');
        fs.writeFileSync('./.env', newEnvFileContent, 'utf-8');
    }
}

function randomIntFromRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
