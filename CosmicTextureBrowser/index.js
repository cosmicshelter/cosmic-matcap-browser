import { Pane } from 'tweakpane';
import { RepeatWrapping, TextureLoader } from 'three';
import config from './config';
import * as TweakpanePluginPreviewSelect from 'tweakpane-plugin-preview-select';

/**
 * Utility functions for fetching and parsing
 */
const fetchHTML = async (url, runtimeConfig) => {
    const proxyUrl = `http://${runtimeConfig.VITE_DEV_SERVER_IP}:${runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/proxy?url=${encodeURIComponent(url)}`;
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
    }

    /**
     * Initialize the browser with the production flag.
     * @param {boolean} isProduction - If true, disables the texture browser.
     */
    init(isProduction) {
        this._isProduction = isProduction;
    }

    /**
     * Initialize a Tweakpane folder for a material and texture type.
     * @param {object} material - Three.js material object.
     * @param {string} textureType - Type of texture.
     * @param {string} uniform - Uniform name for shaders.
     */
    async initFolder(material, textureType, uniform) {
        if (this._isProduction) return;

        if (!config[textureType]) {
            console.error(`Invalid textureType: ${textureType}`);
            return;
        }

        this._activeConfig = { ...config[textureType], uniform };

        this._disposePane();

        this._activePane = new Pane();
        this._activePane.registerPlugin(TweakpanePluginPreviewSelect);

        const folder = this._activePane.addFolder({
            title: `${this._title} - ${textureType}`,
        });

        this._createButtons(folder, material, textureType);
        await this._fetchFolders(folder, material);
    }

    /**
     * Dispose of the current pane.
     */
    _disposePane() {
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
        folder.addButton({ title: '📁 Save Texture' }).on('click', () =>
            this._downloadImage(material, textureType)
        );

        folder.addBlade({ view: 'separator' });

        folder.addBinding(this._textureName, 'value', { label: 'Filename' });
    }

    /**
     * Download a texture image.
     * @param {object} material - Material containing the texture.
     * @param {string} textureType - Texture type.
     */
    async _downloadImage(material, textureType) {
        const { image } = material[config[textureType].type] || {};
        if (!image) {
            console.error('No image found on the material.');
            return;
        }

        const imageSrc = image.src;
        const name = this._textureName.value || `${textureType}-${Date.now()}`;

        try {
            const response = await fetch(
                `http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/download-texture/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ textureType, fileName: name, imageUrl: imageSrc }),
                }
            );

            const data = await response.json();
            if (data.success) {
                console.log('Image saved successfully!');
            } else {
                console.error('Error saving image:', data.error);
            }
        } catch (error) {
            console.error('Error downloading image:', error);
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

            const links = parseLinks(html, 'a');

            for (const link of links) {
                const folderName = link.getAttribute('href');
                if (folderName && folderName !== 'index.php') {
                    const textureFolder = folder.addFolder({ title: folderName, expanded: false });
                    await this._fetchTextures(textureFolder, folderName, material);
                }
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
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
                console.log('No textures found in', folderName);
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
                    height: 50,
                }
            ).on('change', (ev) => {
                this._loadTexture(ev.value, folderName, material);
            });
        } catch (error) {
            console.error('Error fetching textures:', error);
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
        const proxiedTextureUrl = `http://${this._runtimeConfig.VITE_DEV_SERVER_IP}:${this._runtimeConfig.VITE_TEXTURE_BROWSER_SERVER_PORT}/proxy?url=${encodeURIComponent(url)}`;
        textureLoader.load(proxiedTextureUrl, (texture) => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;

            const uniform = this._activeConfig.uniform;
            if (uniform) {
                material.uniforms[uniform].value = texture;
            } else {
                material[this._activeConfig.type] = texture;
            }

            console.log(`Loaded texture: ${selectedTexture}`);
        });
    }
}

export default new CosmicTextureBrowser();
