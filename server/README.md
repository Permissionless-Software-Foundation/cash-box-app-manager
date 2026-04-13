# Cash Box App Manager

Pi Appliance Host Application - App manager for Raspberry Pi touchscreen appliance.

This application serves as the primary user interface and application manager for a Raspberry Pi-based touchscreen appliance. It provides a home screen for launching installed applications and an "app store" for discovering and installing new ones.

## Architecture

The application follows **Clean Architecture** principles with the following structure:

- **Entities**: Domain models (App)
- **Use Cases**: Business logic (GetInstalledApps, DiscoverApps, InstallApp, UninstallApp)
- **Adapters**: External interfaces (NpmService, FileSystem)
- **Controllers**: REST API endpoints

## Features

- **Home Screen**: Displays icons for all installed applications
- **App Store**: Browse and install apps from npm registry
- **Dynamic App Routing**: Serves static files from installed apps
- **REST API**: Full API for managing apps programmatically

## Prerequisites

- Node.js v20.x or later
- npm

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

## Development

### Backend

Start the backend server:
```bash
npm start
```

The server will run on port 3000 by default.

### Frontend

In a separate terminal, start the frontend development server:
```bash
cd client
npm run dev
```

The frontend will run on port 3001 with hot-reload enabled.

### Building Frontend

To build the frontend for production:
```bash
cd client
npm run build
```

The built files will be in `client/build/` and will be served by the Express server.

## Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

Run all tests:
```bash
npm run test:all
```

## API Endpoints

All API endpoints are prefixed with `/api`.

### `GET /api/apps/installed`

Retrieves a list of all currently installed applications.

**Response:**
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

### `GET /api/apps/discover`

Searches the npm registry for all available apps with the keyword `psf-pi-appliance-app`.

**Response:**
```json
[
  {
    "name": "@scope/weather-app",
    "version": "1.1.0",
    "description": "A simple weather app."
  }
]
```

### `POST /api/apps/install/:scope/:appName`

Installs a new application.

**URL Parameters:**
- `scope`: App scope (e.g., `my-apps`)
- `appName`: App name (e.g., `calculator-app`)

**Response:**
```json
{
  "status": "success",
  "message": "App installed successfully."
}
```

### `POST /api/apps/uninstall/:scope/:appName`

Uninstalls an existing application.

**URL Parameters:**
- `scope`: App scope (e.g., `my-apps`)
- `appName`: App name (e.g., `calculator-app`)

**Response:**
```json
{
  "status": "success",
  "message": "App uninstalled successfully."
}
```

## App Package Standard

Third-party developers must adhere to the following standard for their apps to be compatible:

1. **package.json**:
   - Must contain the keyword: `"keywords": ["psf-pi-appliance-app"]`
   - The `name` field must use an npm scope (e.g., `@my-name/my-app`)

2. **Build Output**:
   - The app must be buildable into a single directory of static files (`index.html`, JS, CSS)
   - This directory should be specified in the `files` array in `package.json`
   - Common build directories: `dist`, `build`, or `public`

3. **app.config.json** (Recommended):
   - A file in the package root
   - Contents:
     ```json
     {
       "displayName": "My Awesome App",
       "icon": "assets/icon.png"
     }
     ```
   - The `icon` path should be relative to the build output directory

## Project Structure

```
cash-box-app-manager/
├── bin/
│   └── server.js              # Server entry point
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   └── App.jsx           # Main app component
│   └── package.json
├── src/
│   ├── adapters/             # External interfaces
│   │   ├── npm-service.js   # npm registry and commands
│   │   └── wlogger.js        # Winston logger
│   ├── config/               # Configuration
│   ├── controllers/          # REST API controllers
│   ├── entities/             # Domain models
│   │   └── app.js
│   └── use-cases/            # Business logic
├── test/
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
└── package.json
```

## License

MIT
