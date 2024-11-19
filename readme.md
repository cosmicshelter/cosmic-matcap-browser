# Cosmic Texture Browser

This tool is a texture browser for matcaps with direct preview on materials.
600 matcaps sorted by colors in 15 folders, and each folder is sorted by color intensity.
All the matcaps are resized in 512x512 and webp format.

![](https://github.com/cosmicshelter/cosmic-texture-browser/blob/main/public/preview.gif)

### Start project

```bash
pnpm i
pnpm run dev
```

### Usage

#### Save texture

The save texture button is downloading the texture under this path: 
public/textures/matcap/matcap-183842924.webp.

If you need to change the path you can change it in the CosmicTextureBrowser/server/config.js file.
```js
{
    "publicFolderName": "static",
    "targetFolder": "downloaded-textures/"
}
```
This config means that the texture will be saved in the static/downloaded-textures/matcap/ folder.
If the publicFolderName is incorrect or not found, you will not be able to run the browser.

#### Filename

The filename is automatically generated with Date.now(). If you need a custom file name, you can enter the name in the Filename input in tweakpane.


### Integrating into your project

You'll need to have THREE and Tweakpane already installed.

Import the CosmicTextureBrowser folder into your project and install these packages
```bash
    pnpm i cors dotenv express node-fetch tweakpane-plugin-preview-select concurrently
```

The textures are fetched with express (to avoid cors, and to be able to download the texture directly in your project), so add this to your dev command in package.json
```bash
    "dev": "npm run runBrowser \"vite --host\"",
    "runBrowser": "node CosmicTextureBrowser/server/check-env-variables.js && concurrently --kill-others \"node CosmicTextureBrowser/server/texture-browser-server.js\"",
```

Then import the tool
```js
import CosmicTextureBrowser from './CosmicTextureBrowser';
// use it like this
const texType = 'matcap';
CosmicTextureBrowser.initFolder(material, texType);
```

### Extended usage

#### Browsing url 

There's actually only one type of texture that we serve on our website: matcaps. 
http://matcaps-browser.cosmicshelter.com/

If you want to download the textures, upload them on your own server and make the requests from a new url, you can change the browserUrl in the config.js file.

```js
export default {
    matcap: {
        type: 'matcap',
        browserUrl: 'http://your-url.com/',
        uniform: '',
    },
};

```
There is a index.php file in the project which helps to list the folders of a server automatically. (the tool is using this method, but you can change it if you want !)

#### Material preview

The material in the demo is the MeshMatcapMaterial from THREEJS. If you need to use it on a custom material, you can link your uniform like this
```js
const material = new MeshMatcapMaterial();
const uniform = 'uMatcapMap';
const texType = 'matcap';
CosmicTextureBrowser.initFolder(material, texType, uniform);
```

or define it in the config.js directly

```js
export default {
    matcap: {
        type: 'matcap',
        browserUrl: 'http://your-url.com/',
        uniform: 'uMatcapMap',
    },
};

// you don't need to define it here if already defined in the config.js
CosmicTextureBrowser.initFolder(material, 'matcap');
```

#### Texture types

The demo is made for matcaps, but you can totally use any kind of texture (normals, roughness, etc) and make your own material library.

```js
CosmicTextureBrowser.initFolder(material, 'normal');
export default {
    matcap: {
        type: 'normal',
        browserUrl: 'http://your-url.com/normals/',
        uniform: 'uNormalMap',
    },
};
```