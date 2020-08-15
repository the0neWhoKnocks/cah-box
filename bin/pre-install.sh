#! /bin/bash

set -e # exit immediately if non-zero exit status returned

SCRIPT_DIR="$(cd "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"

##
# Download Cypress binary for OS, if it doesn't already exist
CYPRESS_PATH="${SCRIPT_DIR}/cypress"

if [ ! -d "${CYPRESS_PATH}" ]; then
  LATEST_VERSION=$(\
    curl --silent "https://api.github.com/repos/cypress-io/cypress/releases/latest" |
    grep '"tag_name":' |
    sed -E 's/.*"v([^"]+)".*/\1/'
  )

  # Determined platforms from https://github.com/cypress-io/cypress/blob/18750270739b28793653ae801f628b909534abf7/scripts/binary/meta.js#L9-L11
  if grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null; then
    CYPRESS_PLATFORM="win32"
  else
    OS=$(uname -s)

    if [[ "${OS}" == "Darwin" ]]; then
      CYPRESS_PLATFORM="darwin"
    fi
  fi

  if [ -n "${CYPRESS_PLATFORM}" ]; then
    CACHE_PATH="${CYPRESS_PATH}/cache"
    mkdir -p "${CACHE_PATH}"
    echo "Downloading Cypress binary for ${CYPRESS_PLATFORM}"
    ZIP_PATH="${CYPRESS_PATH}/cypress.v${LATEST_VERSION}.zip"
    curl -L --progress-bar -o "${ZIP_PATH}" -k "https://download.cypress.io/desktop/${LATEST_VERSION}?platform=${CYPRESS_PLATFORM}"
    # echo "Unpacking ${ZIP_PATH}"
    # unzip -q "${ZIP_PATH}" -d "${CYPRESS_PATH}"
    # echo "Deleting ${ZIP_PATH}"
    # rm "${ZIP_PATH}"

    CYPRESS_INSTALL_BINARY="${ZIP_PATH}" \
    CYPRESS_CACHE_FOLDER=${CACHE_PATH} \
    npm i --no-save cypress
  fi
else
  echo "Skipping Cypress download, '${CYPRESS_PATH}' already exists"
fi
