# How to Create an App for the Cash Box App Manager

This guide explains how to build an app that can be discovered, installed, and launched using the Cash Box App Manager.

## Overview

Apps for the Cash Box App Manager are standard npm packages that contain self-contained, static web applications. The App Manager discovers apps by searching the npm registry for packages with the keyword `psf-pi-appliance-app`.

## Requirements

1. **npm Account**: You need an npm account to publish your app
2. **npm Scope**: Your app must use an npm scope (e.g., `@your-username/my-app`)
3. **Static Web App**: Your app must be buildable into static files (HTML, CSS, JS)
4. **Build Output**: The app must have a build directory (commonly `dist`, `build`, or `public`)

## Step-by-Step Guide

### Step 1: Create Your Project Structure

Create a new directory for your app:

```bash
mkdir my-awesome-app
cd my-awesome-app
```

Create the basic project structure:

```
my-awesome-app/
├── src/              # Source files (optional, depends on your build tool)
├── public/           # Public assets (or dist/ or build/)
├── package.json      # Required: npm package configuration
├── app.config.json   # Recommended: App metadata
└── README.md         # Optional: Documentation
```

### Step 2: Create package.json

Create a `package.json` file with the following requirements:

```json
{
  "name": "@your-username/my-awesome-app",
  "version": "1.0.0",
  "description": "A description of your awesome app",
  "keywords": [
    "psf-pi-appliance-app"
  ],
  "main": "index.js",
  "files": [
    "dist",
    "app.config.json",
    "package.json"
  ],
  "scripts": {
    "build": "your-build-command",
    "prepublishOnly": "npm run build"
  },
  "author": "Your Name",
  "license": "MIT"
}
```

**Important Requirements:**
- `name` must use an npm scope (e.g., `@your-username/app-name`)
- `keywords` must include `"psf-pi-appliance-app"` (this is how the App Manager discovers your app)
- `files` array should include your build output directory
- Include a `build` script to compile your app
- `prepublishOnly` script ensures the app is built before publishing

### Step 3: Create app.config.json

Create an `app.config.json` file in the root of your project:

```json
{
  "displayName": "My Awesome App",
  "icon": "assets/icon.png"
}
```

**Fields:**
- `displayName`: The name shown in the App Manager (defaults to package name if not provided)
- `icon`: Path to your app icon, relative to the build output directory (optional)

**Icon Requirements:**
- Recommended size: 64x64 pixels or larger
- Formats: PNG, SVG, or JPG
- Place the icon in your build output directory (e.g., `dist/assets/icon.png`)

### Step 4: Build Your Static Web App

Your app must be a static web application that can run in a browser. You can use any framework or build tool:

**Examples:**

#### Using React + Vite:
```bash
npm install -D vite @vitejs/plugin-react react react-dom
```

`vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
```

#### Using Vanilla JavaScript:
Simply create HTML, CSS, and JS files in a `dist` directory.

#### Using Other Frameworks:
- Vue.js with Vite
- Angular
- Svelte
- Any framework that outputs static files

**Build Output Structure:**
```
dist/
├── index.html       # Required: Entry point
├── assets/
│   ├── icon.png     # Your app icon
│   ├── main.js      # Your JavaScript
│   └── style.css    # Your CSS
└── ...              # Other static assets
```

**Important:**
- Your build output must include an `index.html` file
- All paths in your HTML/CSS/JS should be relative (not absolute)
- The app should work when served from any path (SPA routing should use relative paths or hash routing)

### Step 5: Test Your Build Locally

Before publishing, test that your app builds correctly:

```bash
npm run build
```

Verify that:
1. The build directory exists and contains `index.html`
2. All assets are included
3. The app works when served as static files

You can test locally using a simple HTTP server:

```bash
# Using Python
python3 -m http.server 8000 --directory dist

# Using Node.js http-server
npx http-server dist -p 8000
```

Then open `http://localhost:8000` in your browser to test.

### Step 6: Publish to npm

#### 6.1: Create an npm Account

If you don't have one, create an account at [npmjs.com](https://www.npmjs.com/signup).

#### 6.2: Create an npm Scope (if needed)

If you want to use a custom scope (e.g., `@my-company`), you can create an organization on npm:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Create an organization
3. The organization name becomes your scope

Alternatively, you can use your username as the scope: `@your-username/app-name`

#### 6.3: Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

#### 6.4: Publish Your Package

```bash
npm publish --access public
```

**Note:** Scoped packages are private by default. Use `--access public` to make them public.

### Step 7: Install and Launch in App Manager

Once published, your app will automatically appear in the App Store!

1. **Open the App Manager** in your browser
2. **Navigate to the App Store** (click "App Store" in the navigation)
3. **Find your app** in the list (it may take a few minutes to appear after publishing)
4. **Click "Install"** to install your app
5. **Go to Home** to see your installed app
6. **Click on your app icon** to launch it

## Example: Complete App Structure

Here's a complete example of a simple calculator app:

```
calculator-app/
├── package.json
├── app.config.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js
│   ├── App.jsx
│   └── style.css
└── dist/              # Generated by build
    ├── index.html
    ├── assets/
    │   ├── icon.png
    │   ├── main.js
    │   └── style.css
```

**package.json:**
```json
{
  "name": "@my-username/calculator-app",
  "version": "1.0.0",
  "description": "A simple calculator app",
  "keywords": ["psf-pi-appliance-app"],
  "files": ["dist", "app.config.json"],
  "scripts": {
    "build": "vite build",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**app.config.json:**
```json
{
  "displayName": "Calculator",
  "icon": "assets/icon.png"
}
```

## Best Practices

### 1. Version Management
- Use semantic versioning (e.g., `1.0.0`, `1.0.1`, `1.1.0`)
- Update the version in `package.json` before each publish

### 2. App Icons
- Use high-quality icons (at least 64x64 pixels)
- Consider providing multiple sizes for different displays
- Use PNG format for best compatibility

### 3. Responsive Design
- Design for touchscreen interfaces (large buttons, easy navigation)
- Test on different screen sizes
- Consider both portrait and landscape orientations

### 4. Performance
- Minimize bundle size
- Optimize images and assets
- Use code splitting if your app is large

### 5. Error Handling
- Handle network errors gracefully
- Provide user-friendly error messages
- Test offline scenarios

### 6. Security
- Don't include sensitive data in your app
- Use HTTPS for any external API calls
- Validate and sanitize user inputs

### 7. Testing
- Test your app thoroughly before publishing
- Test the build output, not just the development version
- Test installation and launching in the App Manager

## Troubleshooting

### App Not Appearing in App Store

1. **Check the keyword**: Ensure `"psf-pi-appliance-app"` is in your `keywords` array
2. **Wait a few minutes**: npm registry updates may take time
3. **Check package visibility**: Ensure your package is public (`--access public`)
4. **Verify package name**: Check that the package name uses a scope

### App Not Installing

1. **Check npm install logs**: Look for errors in the server logs
2. **Verify build output**: Ensure `dist` (or your build directory) exists and contains files
3. **Check package.json**: Verify the `files` array includes your build directory

### App Not Launching

1. **Check build output**: Ensure `index.html` exists in the build directory
2. **Check paths**: Ensure all asset paths are relative
3. **Check browser console**: Look for JavaScript errors
4. **Verify app.config.json**: Ensure the icon path is correct

### Icon Not Displaying

1. **Check icon path**: Ensure the path in `app.config.json` is relative to the build directory
2. **Verify icon exists**: Check that the icon file is included in the build
3. **Check file format**: Use PNG, SVG, or JPG format

## Updating Your App

To update your app:

1. Make your changes
2. Update the version in `package.json` (e.g., `1.0.0` → `1.0.1`)
3. Build your app: `npm run build`
4. Publish: `npm publish --access public`
5. Users can update by uninstalling and reinstalling, or you can implement an update mechanism in your app

## Additional Resources

- [npm Documentation](https://docs.npmjs.com/)
- [npm Package.json Reference](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Support

For issues or questions:
- Check the App Manager README
- Review the specification document
- Open an issue in the project repository

