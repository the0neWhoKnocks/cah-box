# CAH-Box

Cards Against Humanity mixed with the play-on-any-device strategy of JackBox games. Yuh know, cuz of COVID, and I wanted to play around with Svelte.

https://github.com/user-attachments/assets/8cfcfd8b-018f-4638-934c-f9d0fd9889be

- [Development](#development)
- [Docker](#docker)
- [E2E Testing](#e2e-testing)
- [Local HTTPS](#local-https)
- [Logging](#logging)

---

## Development

**NOTE** - Aliases to speed up workflow:
| Alias | Command          |
| ----- | ---------------- |
| `d`   | `docker`         |
| `dc`  | `docker compose` |
| `nr`  | `npm run`        |

**NOTE** - To ensure local development reflects what will end up in production, local files are exposed to a development Docker container. You can add `source <REPO_PATH>/bin/repo-funcs.sh` to your shell's rc file to use easier to remember commands.
To automate that process I `source` [this script](https://github.com/the0neWhoKnocks/shell-scripts/blob/master/override-cd.sh) instead, so anytime I `cd` in or out of a repo, the functions are added or removed when not at the root of the repo.

| Alias | Command |
| ----- | ------- |
| `startcont` |	Starts and enters the Container in development mode. |
| `entercont` | Enter the running development Container to debug or what ever. |

Install dependencies
```sh
# This should be run from within the Docker container to ensure Dev dependencies are installed.
npm i
```

Run the App
```sh
# Prod mode
nr start

# Dev mode
nr start:dev
```

**NOTE**: This repo utilizes `git-lfs`.
- [Installation instructions](https://github.com/git-lfs/git-lfs/wiki/Installation)
- Once installed and initialized, you can run `git lfs track '<FILE_GLOB>'` or edit the `.gitattributes` file directly.

---

## Docker

```sh
# Compile Production code (required since the assets are copied over)
nr build
# Build and start the container
dc up --build cahbox

# Or just start the container if you have 'dist' mapped or you just want to use the old build
dc up cahbox
```

---

## E2E Testing

In order to ensure Cypress runs consistently on all OS's for CI and the GUI mode I've opted for the Docker image. One downside to this is the size (over 2gb, yeesh). I tried the non-Docker route, and the setup would be different for all OS's and there was no guarantee it'd even work.

To get the GUI to work, follow the instructions for your OS.

**Windows/WSL**
- Install `choco install vcxsrv`

**OSX**
- Install `brew install xquartz`
- Start XQuartz `open -a xquartz`.
   - Go to Preferences > Security.
      - Make sure `Allow connections from network clients` is checked
- Once the settings have been updated you can close XQuartz
- If you run `echo $DISPLAY` and it's blank, restart your system. The variable should equal something like `/private/tmp/com.apple.launchd.7X4k55BnyT/org.xquartz:0`.

Once things are wired up you can run any of the below.

```sh
nr test
nr test:watch

# skips building the App and Container
nr test -- --skip-build
nr test:watch -- --skip-build
```

---

## Local HTTPS

Follow instructions from https://github.com/the0neWhoKnocks/generate-certs

---

## Logging

This App utilizes [ulog](https://www.npmjs.com/package/ulog).

On the Server you can enable logging via:
```sh
# setting an env var of `log` with a log level value
log=debug nr start:dev
log=error nr start:dev
log=info nr start:dev
```

On the Client you can enable logging via:
- A query param: `?log=debug` (for temporary logging)
- Local Storage: `localStorage.setItem('log', 'debug');` (to enable permanently).
