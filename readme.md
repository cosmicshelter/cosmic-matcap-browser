# Cosmic Texture Browser

The **Cosmic Texture Browser** is an utility class for browsing and previewing matcap textures directly on materials in real-time. It comes with **600 matcaps** categorized by color and intensity, all resized to 512x512 in png format.

![Preview](https://github.com/cosmicshelter/cosmic-texture-browser/blob/main/public/preview.gif)

## Features

- **Large Library**: 600 matcaps sorted by color and intensity.
- **Optimized Textures**: All textures are 512x512 and in png format.
- **Material Previews**: Easily preview textures directly on materials.
- **Customizable**: Configure texture paths, filenames, and material properties.

## Quick Setup

### Prerequisites
Ensure you have the following installed:

`three.js` for 3D rendering.
`Tweakpane 4` for settings.

### 1. Add the `CosmicTextureBrowser` folder to your project.
### 2. Run the setup file (install dependencies + node commands):
```bash
node path/to/your/folder/CosmicTextureBrowser/server/setup.js
```
### 3. Import and use the tool in your code:
```js
import CosmicTextureBrowser from './CosmicTextureBrowser';

const material = new THREE.MeshMatcapMaterial();
CosmicTextureBrowser.initFolder(material, 'matcap');
```

# Usage

The default demo uses `MeshMatcapMaterial` from three.js to preview matcaps. If you need to apply textures to a custom material, you can do so in the following ways:

### Defining a uniform

```js
const material = new THREE.ShaderMaterial({
    uniforms: {
        uMatcapMap: {value: ''}
    }
});
CosmicTextureBrowser.initFolder(material, {name: 'matcap', uniformName: 'uMatcapMap'});
```

### Defining uniform in `config.js`

You can also configure the uniform name directly in the `config.js` file. This approach is helpful if you want to reuse the browser across multiple materials without passing the uniform each time.

```js
export default {
    matcap: {
        type: 'matcap',
        browserUrl: 'http://matcaps-browser.cosmicshelter.com/',
        uniform: 'uMatcapMap', // The uniform name
    },
};
```

Once the uniform is set in `config.js`, you can initialize the browser without specifying the uniform:
```js
const material = new THREE.ShaderMaterial({
    uniforms: {
        uMatcapMap: {value: ''}
    }
});

CosmicTextureBrowser.initFolder(material, {name: 'matcap'});
```

# Advanced Usage

### Save texture

The default path for saved textures is:
`./CosmicTextureBrowser/textures/matcap/matcap-name.png`

If you need to change this path, modify the configuration in CosmicTextureBrowser/server/config.js:
```js
{
    "publicFolderName": "static", // your public folder name
    "targetFolder": "downloaded-textures/" // the target folder name
}
```
The path for saved textures will be now:
`static/downloaded-textures/matcap/matcap-name.png`

### Filename

By default, filenames are auto-generated using `Date.now()`. 

For custom filenames, fill the tweakpane input field.

### Change server Source

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

The Cosmic Texture Browser can support other texture types, such as `normals`, `roughness`, or any custom textures.

### Initialize the Browser with a Custom Texture Type

When using a texture type other than matcap, specify the type during initialization:

```js
CosmicTextureBrowser.initFolder(material, {name: 'normal'});
```

This tells the browser to load textures of type `normal` and apply them to the specified material.


### Update `config.js` for the New Texture Type

To fully support a new texture type, define its settings in the `config.js` file:
```js
export default {
    normal: {
        type: 'normal',
        browserUrl: 'http://your-url.com/normals/',
        uniform: 'uNormalMap',
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
CosmicTextureBrowser.initFolder(material, {name: 'normal'}); // Loads normal maps
CosmicTextureBrowser.initFolder(material, {name: 'roughness'}); // Loads roughness maps
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
pnpm dev
```
### 3. Open in browser

Visit http://localhost:3000


# Credits
https://observablehq.com/@makio135/matcaps?ui=classic
https://finestudio.gumroad.com/l/aura?layout=profile&recommended_by=library
https://jvliette.gumroad.com/l/matcaps?layout=profile&recommended_by=library
https://petrosfera.gumroad.com/l/abstractmatcapsvol1
https://kemono.su/gumroad/user/6643846471246/post/neanp
