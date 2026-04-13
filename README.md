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

## Docker (Compose)

Compose file: [`production/docker/docker-compose.yml`](production/docker/docker-compose.yml). It starts two containers:

1. **app-manager-api** — this REST API (image built from [`production/docker/Dockerfile`](production/docker/Dockerfile))
2. **remote-admin-ui** — nginx serving a production build of [remote-admin](https://github.com/Permissionless-Software-Foundation/remote-admin). The UI image is built from [`production/docker/Dockerfile.remote-admin`](production/docker/Dockerfile.remote-admin): it clones that GitHub repository during the image build (it does not use a local `remote-admin` checkout).

### Prerequisites

- Docker Engine and the Docker Compose plugin (Compose v2)

### Start

From the repository root:

```bash
cd production/docker
docker compose up -d --build
```

Omit `--build` on later runs if images are already built.

### URLs

| Service | URL |
|--------|-----|
| Remote Admin UI | http://localhost:8080 |
| REST API | http://localhost:3633 |

The browser loads the UI from port 8080; the bundled app calls the API at `http://localhost:3633` (same host), matching the published API port.

### Data persistence

LevelDB data lives on the host under **`production/data/leveldb`**, mounted into the API container at `/app/data/config-db` (the path the app uses by default). On Linux, Docker typically creates `production/data/leveldb` on first start if it does not exist.

### Build options (UI image)

In `production/docker/docker-compose.yml`, under `remote-admin-ui` → `build` → `args`:

- **`REMOTE_ADMIN_REPO`** — Git clone URL (default: the PSF GitHub repo above)
- **`REMOTE_ADMIN_REF`** — optional branch or tag; if omitted, the clone uses the repository’s default branch

After changing these args, rebuild the UI image, for example:

```bash
cd production/docker
docker compose build --no-cache remote-admin-ui
docker compose up -d
```

### Stop

```bash
cd production/docker
docker compose down
```

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
