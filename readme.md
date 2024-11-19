# Cosmic Texture Browser

The **Cosmic Texture Browser** is an utility class for browsing and previewing matcap textures directly on materials in real-time. It comes with **600 matcaps** categorized by color and intensity, all resized to 512x512 in WebP format.

![Preview](https://github.com/cosmicshelter/cosmic-texture-browser/blob/main/public/preview.gif)

## Features

- **Large Library**: 600 matcaps sorted by color and intensity.
- **Optimized Textures**: All textures are 512x512 and in WebP format.
- **Material Previews**: Easily preview textures directly on materials.
- **Customizable**: Configure texture paths, filenames, and material properties.

## Quick Setup

### Prerequisites
Ensure you have the following installed:

`three.js` for 3D rendering.
`Tweakpane` for settings.

### 1. Add the `CosmicTextureBrowser` folder to your project.
### 2. Run the setup file (install dependencies + node commands):
```bash
node CosmicTextureBrowser/server/setup.js
```
### 3. Import and use the tool in your code:
```js
import CosmicTextureBrowser from './CosmicTextureBrowser';

const material = new THREE.MeshMatcapMaterial();
CosmicTextureBrowser.initFolder(material, 'matcap');
```

## How to Use

### Save texture

To download a texture, click the Save Texture button. The default path for saved textures is:
public/textures/matcap/matcap-183842924.webp. (timestamp)

If you need to change the save path, modify the configuration in CosmicTextureBrowser/server/config.js:
```js
{
    "publicFolderName": "static",
    "targetFolder": "downloaded-textures/"
}
```
For example:

- publicFolderName: The base folder for serving static assets.
- targetFolder: Where textures will be downloaded.

### Filename

By default, filenames are auto-generated using `Date.now()`. 

For custom filenames:
- Enter a name in the Filename Input field in Tweakpane.
- The filename will be used when saving textures.


# Advanced Usage

## Material Previews

The default demo uses `MeshMatcapMaterial` from three.js to preview textures. If you need to apply textures to a custom material, you can do so in the following ways:

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

# Development

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

---