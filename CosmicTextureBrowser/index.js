import { Pane } from 'tweakpane';
import { RepeatWrapping, TextureLoader } from 'three';
import * as TweakpanePluginPreviewSelect from 'tweakpane-plugin-preview-select';

import config from './config';

const IP = 'localhost';
const PORT = 9991;

/**
 * Utility functions for fetching and parsing
 */
const fetchHTML = async (url) => {
    const proxyUrl = `http://${IP}:${PORT}/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch HTML from ${url}`);
    }
    return response.text();
};
const parseLinks = (html, selector) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll(selector));
};

const parseTextureFiles = (html) => {
    return parseLinks(html, 'a[href$=".jpg"], a[href$=".png"], a[href$=".webp"]').map(link =>
        link.getAttribute('href')
    );
};

/**
 * CosmicTextureBrowser
 */
class CosmicTextureBrowser {
    constructor({ title = 'Texture Browser', runtimeConfig = import.meta.env } = {}) {
        this._title = title;
        this._runtimeConfig = runtimeConfig;
        this._activePane = null;
        this._textureName = { value: '' };

        this._server = {
            state: 'disconnected',
        };
    }

    /**
     * Initialize a Tweakpane folder for a material and texture type.
     * @param {object} material - Three.js material object.
     * @param {object} options - Options for the texture browser.
     * @param {string} options.type - Texture type.
     * @param {string} options.uniform - Uniform name for the texture.
     */
    async initFolder(material, options = {}) {
        const textureType = options.type || 'matcap';

        if (!config[textureType]) {
            console.error(`Invalid textureType: ${textureType}`);
            return;
        }

        this._activeConfig = { ...config[textureType], uniform: options.uniform };

        this.dispose();

        this._activePane = new Pane();
        this._activePane.registerPlugin(TweakpanePluginPreviewSelect);

        const folder = this._activePane.addFolder({
            title: `${this._title} - ${textureType}`,
        });

        this._checkDebuggerServer();
        
        this._createButtons(folder, material, textureType);
        await this._fetchFolders(folder, material);
    }

    /**
     * Dispose of the current pane.
     */
    dispose() {
        if (this._activePane) {
            this._activePane.dispose();
            this._activePane = null;
        }
    }

    /**
     * Create buttons for debugging and downloading textures.
     * @param {object} folder - Tweakpane folder.
     * @param {object} material - Three.js material object.
     * @param {string} textureType - Texture type.
     */
    _createButtons(folder, material, textureType) {
        folder.addBinding(this._server, 'state', { readonly: true, label: 'State', interval: 100, index: 1 });

        folder.addButton({ title: '📁 Save Texture' }).on('click', () =>
            this._downloadImage(material, textureType)
        );
        folder.addBlade({ view: 'separator' });

        folder.addBinding(this._textureName, 'value', { label: 'Filename' });
    }

    /**
     * Check if the debugger server is running.
     * If not, the texture browser will not work.
     * This is only checked in production mode.
     * The server state is updated every 5 seconds.
     * The server state can be 'connected' or 'disconnected'.
    */
    _checkDebuggerServer() {
        if (process.env.NODE_ENV === 'production') {
            this._server.state = 'disconnected';
            return;
        }

        const interval = 5000;

        // Initial check
        fetch(`http://${IP}:${PORT}/check/`, { method: 'GET' }).then((res) => {
            this._server.state = res.ok ? 'connected' : 'disconnected';
        });

        // Check interval
        this._checkDebuggerServerInterval = setInterval(() => {
            fetch(`http://${IP}:${PORT}/check/`, { method: 'GET' }).then((res) => {
                this._server.state = res.ok ? 'connected' : 'disconnected';
            }, () => {
                this._server.state = 'disconnected';
            });
        }, interval);
    }

    /**
     * Download a texture image.
     * @param {object} material - Material containing the texture.
     * @param {string} textureType - Texture type.
     */
    async _downloadImage(material, textureType) {
        const { image } = material[config[textureType].type] || {};
        if (!image) {
            console.error('CosmicTextureBrowser: No image found on the material.');
            return;
        }

        if(this._serverState === 'disconnected') return;
        
        const imageSrc = image.src;
        const name = this._textureName.value || `${textureType}-${Date.now()}`;
        
        try {
            const response = await fetch(
                `http://${IP}:${PORT}/download-texture/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ textureType, fileName: name, imageUrl: imageSrc }),
                }
            );

            const data = await response.json();
            if (data.success) {
                console.log('CosmicTextureBrowser: Image saved successfully!');
            } else {
                console.error('CosmicTextureBrowser: Error saving image:', data.error);
            }
        } catch (error) {
            console.error('CosmicTextureBrowser: Error downloading image:', error);
        }
    }

    /**
     * Fetch folders containing textures and populate the pane.
     * @param {object} folder - Tweakpane folder.
     * @param {object} material - Three.js material object.
     */
    async _fetchFolders(folder, material) {
        try {
            const html = await fetchHTML(
                `${this._activeConfig.browserUrl}/`,
                this._runtimeConfig
            );
    
            // Parse all anchor links
            const links = parseLinks(html, 'a');
    
            for (const link of links) {
                const href = link.getAttribute('href');
    
                // Skip query parameters or invalid links
                if (href && !href.startsWith('?') && !href.includes(';') && !href.includes('.')) {
                    const folderName = href.endsWith('/') ? href.slice(0, -1) : href; // Remove trailing slash if any
                    const textureFolder = folder.addFolder({ title: folderName, expanded: false });
    
                    // Fetch textures in the folder
                    await this._fetchTextures(textureFolder, folderName, material);
                }
            }
        } catch (error) {
            console.error('CosmicTextureBrowser: Error fetching folders:', error);
        }
    }

    /**
     * Fetch textures from a specific folder and add them to the pane.
     * @param {object} folder - Tweakpane folder.
     * @param {string} folderName - Name of the folder.
     * @param {object} material - Three.js material object.
     */
    async _fetchTextures(folder, folderName, material) {
        try {
                this._runtimeConfig
            const html = await fetchHTML(`${this._activeConfig.browserUrl}${folderName}/`, this._runtimeConfig);
            const textureFiles = parseTextureFiles(html);

            if (!textureFiles.length) {
                console.log('CosmicTextureBrowser: No textures found in', folderName);
                return;
            }
            
            folder.addBinding(
                { value: textureFiles[0] },
                'value',
                {
                    label: 'Texture',
                    view: 'preview-select',
                    options: textureFiles,
                    previewBaseUrl: `${this._activeConfig.browserUrl}${folderName}/`,
                    showPreview: true,
                    objectFit: 'cover',
                    height: 150,
                }
            ).on('change', (ev) => {
                this._loadTexture(ev.value, folderName, material);
            });
        } catch (error) {
            console.error('CosmicTextureBrowser: Error fetching textures:', error);
        }
    }

    /**
     * Load a selected texture into the material.
     * @param {string} selectedTexture - Selected texture file.
     * @param {string} folderName - Folder containing the texture.
     * @param {object} material - Three.js material object.
     */
    _loadTexture(selectedTexture, folderName, material) {
        const textureLoader = new TextureLoader();
        const url = `${this._activeConfig.browserUrl}${folderName}/${selectedTexture}`;
        const proxiedTextureUrl = `http://${IP}:${PORT}/proxy?url=${encodeURIComponent(url)}`;
        textureLoader.load(proxiedTextureUrl, (texture) => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;

            const uniform = this._activeConfig.uniform;
            if (uniform) {
                material.uniforms[uniform].value = texture;
            } else {
                material[this._activeConfig.type] = texture;
            }
        });
    }
}

export default new CosmicTextureBrowser();
