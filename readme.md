# Cosmic Texture Browser

The **Cosmic Texture Browser** is a utility class for browsing and previewing matcap textures directly on materials in real-time. It comes with **600 matcaps** categorized by color and intensity, all resized to 512x512 in WebP format.

![Preview](https://github.com/cosmicshelter/cosmic-texture-browser/blob/main/public/preview.gif)

---

## Features

- **Large Library**: 600 matcaps sorted by color and intensity.
- **Optimized Textures**: All textures are 512x512 and in WebP format.
- **Material Previews**: Easily preview textures directly on materials.
- **Customizable**: Configure texture paths, filenames, and material properties.

---

## Quick Setup

Follow these steps to quickly get started with the **Cosmic Texture Browser**:

### 1. Clone the Repository

```bash
git clone https://github.com/cosmicshelter/cosmic-texture-browser.git
cd cosmic-texture-browser
```

### 2. Install dependencies

```bash
pnpm i
```

### 3. Start the development server

```bash
pnpm run dev
```
### 3. Open in browser

Visit [http://localhost:3000]


You're all set! For advanced usage or integrating the browser into your project, check the Usage and Extended Usage sections.

## Integrating the Browser in Your Project

### Prerequisites
Ensure you have the following installed:

THREE.js for 3D rendering.
Tweakpane for UI controls.

#### 1. Add the CosmicTextureBrowser folder to your project
#### 2. Install necessary dependencies:
```bash
    pnpm add -D cors dotenv express node-fetch concurrently
```
#### 3. Update your package.json dev command:
```bash
    "dev": "npm run run-browser \"vite --host\"",
    "run-browser": "node CosmicTextureBrowser/server/check-env-variables.js && concurrently --kill-others \"node CosmicTextureBrowser/server/texture-browser-server.js\""
```

#### 4. Import and use the tool in your code:

```js
import CosmicTextureBrowser from './CosmicTextureBrowser';

const material = new THREE.MeshMatcapMaterial();
CosmicTextureBrowser.initFolder(material, 'matcap');
```
---

## How to Use

### Save texture

To download a texture, click the Save Texture button. The default path for saved textures is:
public/textures/matcap/matcap-183842924.webp.

If you need to change the save path, modify the configuration in CosmicTextureBrowser/server/config.js:
```js
{
    "publicFolderName": "static",
    "targetFolder": "downloaded-textures/"
}
```
For example:

publicFolderName: The base folder for serving static assets.
targetFolder: Where textures will be downloaded.

### Filename

- **Filename Customization**:
By default, filenames are auto-generated using Date.now(). For custom filenames:

Enter a name in the Filename Input field in Tweakpane.
The filename will be used when saving textures.

---

# Advanced Usage

## Change Texture Source

The browser fetches matcaps from the default URL:

[http://matcaps-browser.cosmicshelter.com/](http://matcaps-browser.cosmicshelter.com/)

To host textures on your own server:
1. Upload textures and folders to your server.
2. Update the `browserUrl` in `config.js`:

```js
   export default {
       matcap: {
           type: 'matcap',
           browserUrl: 'http://your-url.com/',
           uniform: '',
       },
   };
```

## Material Previews

The default demo uses `MeshMatcapMaterial` from THREE.js to preview textures. If you need to apply textures to a custom material, you can do so in the following ways:

### Specifying Uniforms Directly

When initializing the browser, provide the material's texture uniform as an argument:

```js
const material = new THREE.MeshStandardMaterial();
const uniform = 'uMatcapMap'; // The uniform name for your material's matcap texture
CosmicTextureBrowser.initFolder(material, 'matcap', uniform);
```

### Defining Uniforms in `config.js`

You can configure the uniform name directly in the `config.js` file. This approach is helpful if you want to reuse the browser across multiple materials without passing the uniform each time.

Update the `config.js` file like this:

```js
export default {
    matcap: {
        type: 'matcap', // Texture type (e.g., matcap, normal, roughness)
        browserUrl: 'http://your-url.com/', // URL to fetch textures from
        uniform: 'uMatcapMap', // The uniform name for the material's texture
    },
};
```

Once the uniform is set in `config.js`, you can initialize the browser without specifying the uniform:
```js
const material = new THREE.MeshMatcapMaterial();
CosmicTextureBrowser.initFolder(material, 'matcap');
```

## Texture Types

The Cosmic Texture Browser is optimized for matcaps by default, but it can be configured to support other texture types, such as normals, roughness, or any custom textures. Here's how you can use it for different types of textures:

### Initialize the Browser with a Custom Texture Type

When using a texture type other than matcap, specify the type during initialization:

```js
CosmicTextureBrowser.initFolder(material, 'normal');
```

This tells the browser to load textures of type `normal` and apply them to the specified material.


### Update `config.js` for the New Texture Type

To fully support a new texture type, define its settings in the `config.js` file:
```js
export default {
    normal: {
        type: 'normal', // The type of texture (e.g., normal, roughness)
        browserUrl: 'http://your-url.com/normals/', // URL where the textures are hosted
        uniform: 'uNormalMap', // The uniform name used by the material for this texture type
    },
    roughness: {
        type: 'roughness',
        browserUrl: 'http://your-url.com/roughness/',
        uniform: 'uRoughnessMap',
    },
};
```

### Using the Configured Texture Type

```js
const material = new THREE.MeshStandardMaterial();
CosmicTextureBrowser.initFolder(material, 'normal'); // Loads normal maps
CosmicTextureBrowser.initFolder(material, 'roughness'); // Loads roughness maps
```