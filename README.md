# Cash Box App Manager

Node.js **REST API** for persisting cash box configuration (LevelDB). The UI lives in the separate [remote-admin](../remote-admin) project, which calls this service’s `/api/config` routes.

## Architecture

Clean Architecture layout:

- **Entities**: `Config`
- **Use cases**: `GetConfig`, `SaveConfig`
- **Adapters**: LevelDB, Winston logger
- **Controllers**: REST (`/api/config`)

## Prerequisites

- Node.js v20.x or later
- npm

## Installation

```bash
cd server
npm install
```

## Run

```bash
cd server
npm start
```

Default port is **3633** in development (`NODE_ENV=development`). In production, set `PORT` or rely on the default in `server/src/config/env/production.js`.

## API documentation

After generating docs:

```bash
cd server
npm run docs
```

Open `http://localhost:3633/api-docs` while the server is running.

## Testing

```bash
cd server
npm test
```

## Endpoints (summary)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service metadata and links |
| GET | `/health` | Liveness |
| GET | `/api/config/:key` | Read config by key |
| PUT | `/api/config/:key` | Upsert config by key |

See the config controller source and generated apidoc for request/response shapes.

## License

MIT
