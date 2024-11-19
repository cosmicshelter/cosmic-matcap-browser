import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const IP = process.env.VITE_DEV_SERVER_IP;
const PORT = process.env.VITE_TEXTURE_BROWSER_SERVER_PORT;

const app = express();

app.use(express.json({ limit: '5000mb' })); // Adjust as needed
app.use(express.urlencoded({ limit: '5000mb', extended: true }));
app.use(cors({ origin: '*' }));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8'));
const projectRoot = findProjectRoot();
const vitePublicPath = path.join(projectRoot, config.publicFolderName); 

app.get('/proxy', async(req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Image URL is required');
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        res.set('Content-Type', response.headers.get('content-type'));
        res.set('Cache-Control', 'public, max-age=31536000');

        response.body.pipe(res);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Failed to fetch image');
    }
});

app.post('/download-texture', (req, res) => {
    const body = req.body;
    downloadTexture(req, res, body.type);
});

async function downloadTexture(req, res, type) {
    const textureType = req.body.textureType;
    const fileName = req.body.fileName;

    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image URL or base64 data is required' });
    }

    try {
        const folderPath = path.join(vitePublicPath, config.targetFolder, textureType);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        let buffer;

        if (imageUrl.startsWith('data:image')) {
            const base64Data = imageUrl.split(';base64,').pop();
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        }

        const filePath = path.join(folderPath, `${fileName}.webp`);
        fs.writeFileSync(filePath, buffer);

        console.log(`Image saved to ${filePath}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error downloading or saving the image:', error);
        res.status(500).json({ success: false, error: 'Failed to download and save image' });
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`\n🟢 Texture Browser server running on http://${IP}:${PORT}\n`);
});


function findProjectRoot() {
    let dir = __dirname;

    while (dir !== path.parse(dir).root) {
        if (fs.existsSync(path.join(dir, config.publicFolderName))) {
            return dir;
        }
        dir = path.dirname(dir);
    }

    throw new Error('Could not find project root');
}