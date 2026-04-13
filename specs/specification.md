# **Project Specification: Pi Appliance Host Application**

**Version:** 1.0
**Date:** 2026-01-12

> **Note (2026-04):** The npm “app store”, bundled React client, and `/api/apps` surface were removed. The shipped product is an API-only backend with `/api/config`; the UI is [`remote-admin`](../../../remote-admin). The sections below that describe app discovery, install/uninstall, and `/apps/...` routing are **historical** only.

## 1. Overview

This document outlines the technical specification and development plan for the **Pi Appliance Host Application**. This application will serve as the primary user interface and application manager for a Raspberry Pi-based touchscreen appliance. It will provide a home screen for launching installed applications and an "app store" for discovering and installing new ones.

The architecture is based on a **"npm as an App Store"** model. The host application is a Node.js/Express server that runs on boot. It serves a React-based frontend. New applications are discovered and installed directly from the public npm registry based on a specific keyword.

## 2. Core Architecture

The system consists of three main parts:

1.  **Host Application (This Project):** A persistent Node.js server that manages and serves all content.
2.  **App Packages:** Standard npm packages, each containing a self-contained, static web application.
3.  **npm Registry:** The central, public repository for discovering and downloading App Packages.

### Host Application Components:

*   **Backend (Node.js/Express.js):**
    *   Serves the frontend React application.
    *   Provides a REST API for managing and discovering apps.
    *   Executes `npm` commands to install and uninstall apps.
    *   Dynamically routes requests to the installed app's static files.
*   **Frontend (React):**
    *   **Home Screen:** Displays icons for all installed applications.
    *   **App Store View:** A browsable list of available, discoverable apps from the npm registry.
    *   **App Container:** A view that will host the running third-party applications.

## 3. Technical Stack

*   **Backend:**
    *   **Runtime:** Node.js (v20.x or later)
    *   **Framework:** Express.js
    *   **Dependencies:** `cors`, `npm-registry-fetch`, `express`
*   **Frontend:**
    *   **Framework:** React (v18 or later)
    *   **UI Library:** React-Bootstrap
    *   **Tooling:** Create React App or Vite
*   **App Package Keyword:** `psf-pi-appliance-app` (This keyword will be used to discover all compatible apps on npm).

## 4. Backend Specification (Node.js/Express)

The backend server is the core of the system.

### 4.1. Project Structure

```
/pi-host-app
|-- /server
|   |-- /routes
|   |   |-- api.js         # Handles all API endpoints
|   |   `-- apps.js        # Handles dynamic routing for installed apps
|   |-- /services
|   |   `-- NpmService.js  # Logic for interacting with npm registry & commands
|   |-- installed-apps.json # A simple database of installed app metadata
|   `-- index.js           # Main server entry point
|-- /client
|   |-- (React App Structure)
|-- package.json
```

### 4.2. API Endpoints

All API endpoints will be prefixed with `/api`.

---

#### `GET /api/apps/installed`

*   **Description:** Retrieves a list of all currently installed applications.
*   **Process:** Reads the `installed-apps.json` file and returns its contents.
*   **Success Response (200):**
    ```json
    [
      {
        "name": "@scope/calculator-app",
        "version": "1.0.1",
        "description": "A simple calculator.",
        "config": {
          "displayName": "Calculator",
          "icon": "/apps/calculator-app/icon.png"
        }
      }
    ]
    ```

---

#### `GET /api/apps/discover`

*   **Description:** Searches the npm registry for all available apps.
*   **Process:** Uses `npm-registry-fetch` to search for packages with the keyword `psf-pi-appliance-app`. It should cache results for a reasonable period (e.g., 1 hour) to avoid hitting the registry too often.
*   **Success Response (200):**
    ```json
    [
      {
        "name": "@scope/weather-app",
        "version": "1.1.0",
        "description": "A simple weather app."
      }
    ]
    ```

---

#### `POST /api/apps/install/:scope/:appName`

*   **Description:** Installs a new application.
*   **URL Parameters:** `scope` (e.g., `@my-apps`), `appName` (e.g., `weather-app`).
*   **Process:**
    1.  Constructs the full package name: `@scope/appName`.
    2.  Uses `child_process.exec` to run `npm install @scope/appName`.
    3.  After successful installation, reads the app's `package.json` and `app.config.json` from `node_modules`.
    4.  Adds the app's metadata to `installed-apps.json`.
*   **Success Response (200):** `{ "status": "success", "message": "App installed successfully." }`
*   **Error Response (500):** `{ "status": "error", "message": "Installation failed." }`

---

#### `POST /api/apps/uninstall/:scope/:appName`

*   **Description:** Uninstalls an existing application.
*   **Process:**
    1.  Constructs the full package name.
    2.  Uses `child_process.exec` to run `npm uninstall @scope/appName`.
    3.  Removes the app's entry from `installed-apps.json`.
*   **Success Response (200):** `{ "status": "success", "message": "App uninstalled successfully." }`

### 4.3. Dynamic App Routing

The server must serve the static files for any installed app. A dynamic Express router will handle this.

*   **Route:** `app.use('/apps/:scope/:appName', ...)`
*   **Logic:**
    1.  Extract the `scope` and `appName` from the URL.
    2.  Construct the path to the app's `dist` or `build` folder within `node_modules`.
    3.  Use `express.static()` to serve the files from that directory.

## 5. Frontend Specification (React)

The frontend is a Single Page Application (SPA).

### 5.1. Components

*   **`App.js` (Main Router):**
    *   Uses `react-router-dom` to define the main navigation.
    *   Routes: `/` (Home Screen), `/store` (App Store).

*   **`HomeScreen.js`:**
    *   Fetches data from `GET /api/apps/installed`.
    *   Renders a grid of icons using `react-bootstrap`'s `<Card>` and `<Grid>` components.
    *   Each icon is a link (`<Link>`) to the app's launch URL (e.g., `/apps/@scope/calculator-app/`).

*   **`AppStore.js`:**
    *   Fetches data from `GET /api/apps/discover`.
    *   Displays a list of available apps.
    *   For each app, it shows the name, description, and an "Install" button.
    *   The "Install" button triggers a `POST` request to the `/api/apps/install/...` endpoint.
    *   Provides feedback to the user during and after installation.

*   **`NavigationBar.js`:**
    *   A persistent navigation bar at the top or bottom of the screen.
    *   Contains links to "Home" (`/`) and "App Store" (`/store`).
    *   Uses `react-bootstrap`'s `<Navbar>` component.

## 6. App Package Standard

Third-party developers must adhere to the following standard for their apps to be compatible.

*   **`package.json`:**
    *   Must contain the keyword: `"keywords": ["psf-pi-appliance-app"]`.
    *   The `name` field must use an npm scope (e.g., `@my-name/my-app`).
*   **Build Output:**
    *   The app must be buildable into a single directory of static files (`index.html`, JS, CSS). This directory should be specified in the `files` array in `package.json`.
*   **`app.config.json` (Recommended):**
    *   A file in the package root.
    *   **Contents:**
        ```json
        {
          "displayName": "My Awesome App",
          "icon": "assets/icon.png"
        }
        ```
    *   The `icon` path should be relative to the build output directory.

## 7. Development Plan

### Phase 1: Backend Foundation (1-2 weeks)

*   **Goal:** Create a working Node.js/Express server that can serve a basic frontend and manage apps via API calls.
*   **Tasks:**
    1.  Set up the Node.js project and install dependencies.
    2.  Implement the `GET /api/apps/installed` endpoint and a mock `installed-apps.json`.
    3.  Implement the `POST /api/apps/install` endpoint with `child_process`.
    4.  Implement the `POST /api/apps/uninstall` endpoint.
    5.  Implement the dynamic app router for `/apps/...`.
    6.  Set up a basic "Hello World" React app in the `/client` directory, served by the Express server.
    7.  **Test:** Manually run `npm install` for a sample app and confirm it can be served by the dynamic router.

### Phase 2: Frontend UI (2 weeks)

*   **Goal:** Build the complete user interface in React.
*   **Tasks:**
    1.  Develop the `HomeScreen.js` component to fetch and display installed apps.
    2.  Develop the `NavigationBar.js` component.
    3.  Implement the `AppStore.js` component.
    4.  Implement the `GET /api/apps/discover` endpoint in the backend.
    5.  Connect the `AppStore.js` UI to the `discover` and `install` API endpoints.
    6.  Style all components using `react-bootstrap` for a clean, touch-friendly interface.

### Phase 3: Integration, Testing, and Deployment (1 week)

*   **Goal:** Ensure all parts work together smoothly and prepare for deployment.
*   **Tasks:**
    1.  End-to-end testing: Discover -> Install -> See on Home Screen -> Launch -> Uninstall.
    2.  Create a sample "Hello World" app package and publish it to npm to test the full, live workflow.
    3.  Write a `systemd` service file to ensure the host application runs automatically on boot.
    4.  Write documentation for third-party developers explaining how to create and publish a compatible app.

***
