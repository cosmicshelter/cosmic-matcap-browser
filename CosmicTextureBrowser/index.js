import { Pane } from 'tweakpane';
import { RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';
import * as TweakpanePluginPreviewSelect from 'tweakpane-plugin-preview-select';

import config from './config';
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

        this._createButtons(folder, material, textureType);
        this._loadTexturesFromPublicFolder(folder, material);
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
        folder.addButton({ title: '📁 Download Texture' }).on('click', () => {
            const texture = material[textureType];
            if (!texture) {
                console.error('No texture found in the material.');
                return;
            }

            const link = document.createElement('a');
            link.href = texture.image.src;
            link.download = this._textureName.value || `matcap-${Date.now()}.png`;
            link.click();
        });

        folder.addBlade({ view: 'separator' });

        folder.addBinding(this._textureName, 'value', { label: 'Filename' });
    }

    /**
     * Load textures from the public folder and add them to the pane.
     * @param {object} folder - Tweakpane folder.
     * @param {object} material - Three.js material object.
     */
    _loadTexturesFromPublicFolder(folder, material) {
        const files = config.filesLength;
        for (const key in files) {
                const filesArray = [];
                const typeFolder = folder.addFolder({ title: key, expanded: false });
                const textureFolderPath = `assets/512/png/${key}/`;
                
                if (!files[key]) {
                    console.error('No textures found in the public folder.');
                    return;
                }
                for (let index = 0; index < files[key]; index++) {
                    const textureFile = `0${index + 1}.png`;
                    filesArray.push(textureFile);
                }
                
                typeFolder.addBinding(
                    { value: filesArray[0] },
                    'value',
                    {
                        label: 'Texture',
                        view: 'preview-select',
                        options: filesArray,
                        previewBaseUrl: textureFolderPath,
                        showPreview: true,
                        objectFit: 'cover',
                        height: 150,
                    }
                ).on('change', (ev) => {
                    this._loadTexture(`${textureFolderPath}${ev.value}`, material);
                });
                
            }
        
    }

    /**
     * Load a selected texture into the material.
     * @param {string} texturePath - Path to the selected texture.
     * @param {object} material - Three.js material object.
     */
    _loadTexture(texturePath, material) {
        const textureLoader = new TextureLoader();
        textureLoader.load(texturePath, (texture) => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.colorSpace = SRGBColorSpace;
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
