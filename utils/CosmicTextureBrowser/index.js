import { Pane } from 'tweakpane';
import { RepeatWrapping, TextureLoader } from 'three';
import config from './config';
import * as TweakpanePluginPreviewSelect from 'tweakpane-plugin-preview-select';

const TEXTURE_BROWSER_TOKEN = '177f7497-ec7e-4938-8511-3bfebe90526f';
class CosmicTextureBrowser {
    constructor(options = {}) {
        this._isProduction = false;
        this._activePane = null;
        this._activeConfig = null;
        this._textureName = { value: '' };
        this._title = 'Matcap Texture Browser';
        this._runtimeConfig = import.meta.env;
    }

    /**
     * Public
     */
    init(isProduction) {
        this._isProduction = isProduction;
    }

    initFolder(material, textureType) {
        if (this._isProduction) return;
        
        this._activeConfig = config[textureType];
        this._disposePane();

        this._activePane = new Pane();
        this._activePane.registerPlugin(TweakpanePluginPreviewSelect);
        this._activePane.uid = material.uuid;

        const folder = this._createFolder(this._title);

        this._createDebuggerButtons(folder, material, textureType);
        this._fetchFolders(folder, new TextureLoader(), material);
    }

    /**
     * Private
     */
    _disposePane() {
        if (this._activePane) {
            this._activePane.dispose();
            this._activePane = null;
        }
    }

    _createFolder(textureType) {
        return this._activePane.addFolder({
            title: `${textureType.charAt(0).toUpperCase() + textureType.slice(1)}`,
            expanded: true,
        });
    }

    _createDebuggerButtons(folder, material, textureType, settingsFile) {
        folder.addButton({ title: '📁 Save to folder' }).on('click', () => this._downloadImage(material, textureType, settingsFile));
       
        folder.addBlade({
            view: 'separator',
        });

        folder.addBinding(this._textureName, 'value', { label: 'Custom filename' });
    }

    async _downloadImage(material, textureType, settingsFile) {
        const imageSrc = material[this._activeConfig.type].image.src;
        const fileName = textureType;
        const name = this._textureName.value !== '' ? this._textureName.value : `${textureType}-${Date.now()}`;
        const targetFolder = `downloaded-${fileName}`;

        const configData = {
            targetFolder,
            fileName: name,
            settingsFile,
            imageUrl: imageSrc,
        };
        
        try {
            const response = await fetch(`http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/download-texture/`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData),
            });
            const data = await response.json();
            if (data.success) {
                console.log('Image saved successfully!');
            } else {
                console.error('Error saving image:', data.error);
            }
        } catch (error) {
            console.error('Error in the request:', error);
        }
    }

    _loadSelectedTexture(selectedTexture, textureType, loader, material, binding) {
        const url = `${this._activeConfig.textureUrl}${textureType}/${selectedTexture}`;

        const proxiedTextureUrl = `http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/proxy?url=${encodeURIComponent(url + '?token=' + TEXTURE_BROWSER_TOKEN)}`;

        loader.load(proxiedTextureUrl, (texture) => {
            Object.assign(texture, { name, wrapS: RepeatWrapping, wrapT: RepeatWrapping, flipY: true });
            material[this._activeConfig.type] = texture;
        });
    }

    /**
     * Data Fetching
     */

    async _fetchFolders(folder, loader, material, binding) {
        try {       
            const html = await this._fetchHTML(`${this._activeConfig.textureUrl}/`);
            const links = this._parseLinks(html, 'a');
            
            links.forEach((link) => {
                const folderName = link.getAttribute('href');
                if (folderName !== 'index.php') {
                    const textureFolder = folder.addFolder({ title: folderName, expanded: false });
                    this._fetchTextures(textureFolder, folderName, loader, material, binding);
                }
            });
        } catch (error) {
            console.error('Error fetching folder contents:', error);
        }
    }

    async _fetchTextures(folder, textureType, loader, material, binding) {
        try {
            const html = await this._fetchHTML(`${this._activeConfig.textureUrl}${textureType}`);

            const textureFiles = this._parseTextureFiles(html, textureType);

            if (!textureFiles.length) return;

            const initialOption = {
                value: textureFiles[0],
            };

            folder.addBinding(initialOption, 'value', {
                label: 'Image',
                view: 'preview-select',
                previewBaseUrl: `${this._activeConfig.textureUrl}${textureType}/`,
                token: `?token=${TEXTURE_BROWSER_TOKEN}`,
                showPreview: true,
                objectFit: 'cover',
                height: 50,
                options: textureFiles,
            }).on('change', ev => this._loadSelectedTexture(ev.value, textureType, loader, material, binding));
        } catch (error) {
            console.error('Error loading textures:', error);
        }
    }

    _fetch(path, configData) {
        fetch(`http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/${path}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configData),
        })
            .then(response => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Image saved successfully!');
                } else {
                    console.error('Error saving image:', data.error);
                }
            })
            .catch(error => console.error('Error in the request:', error));
    }

    /**
     * Utils
     */

    async _fetchHTML(url) {
        const proxyUrl = `http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/proxy?url=${encodeURIComponent(url + '?token=' + TEXTURE_BROWSER_TOKEN)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch HTML from ${url}`);
        }
        return response.text();
    }

    _parseLinks(html, selector) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(doc.querySelectorAll(selector));
    }

    _parseTextureFiles(html) {
        const links = this._parseLinks(html, 'a[href$=".jpg"], a[href$=".png"], a[href$=".webp"]');
        return links.map(link => (link.getAttribute('href')));
    }
}

export default new CosmicTextureBrowser();
