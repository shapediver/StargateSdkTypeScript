#!/usr/bin/env bash
set -o pipefail
set -o nounset

# This script builds and publishes the NPM package at the given part.
#
# First, the package is published into the GitHub repository. It is assumed,
# that a `.npmrc`-file exists with the respective credentials.
# Second, the package is published into the ShapeDiver NPM registry for public
# access. It is assumed, that the user has already logged in to NPM before this
# script executed.
# Before each build step, the package is rebuild to ensure that the latest
# version is published.
#
# If the input path is invalid or any of the previously mentioned assumptions
# are not met, a meaningful error is returned by the script before anything is
# published.
#
# Usage:
#   ./publish_pkg.sh <path of package>

PKG_FILE="package.json"
PKG_BAK_FILE="${PKG_FILE}.bak"
RC_FILE=".npmrc"
RC_BAK_FILE="${RC_FILE}.bak"

NPM_REGISTRY="https://registry.npmjs.org/"

cleanup() {
  [ -f ${PKG_BAK_FILE} ] && mv -f "${PKG_BAK_FILE}" "${PKG_FILE}"

  if [ -L ${RC_BAK_FILE} ]; then
    cp_symlink "${RC_BAK_FILE}" "${RC_FILE}"
    rm "${RC_BAK_FILE}"
  elif [ -f "${RC_BAK_FILE}" ]; then
    mv "${RC_BAK_FILE}" "${RC_FILE}"
  fi
}
trap 'cleanup' EXIT

cp_symlink() {
  SYMLINK="$(stat --printf="%N\n" "${1}" | sed -En "s/.*'(.*)'$/\1/p")"
  ln -s "${SYMLINK}" "${2}"
}

## Validate input
[ $# -lt 1 ] && echo "Error: Specify the absolute path of the npm package." >&2 && exit 1

# Validate that the input is a director
[ ! -d "${1}" ] && echo "Error: The given path is not a directory." >&2 && exit 1

# Validate that the given directory contains a package.json file
[ ! -f "${1}/package.json" ] && echo "Error: The given directory does not contain a package.json file." >&2 && exit 1

# Validate that NPM login has already been done
npm whoami --registry "${NPM_REGISTRY}" &> /dev/null
[ ${?} -gt 0 ] && echo "Error: You are not logged in to your NPM account. Run 'npm login --registry ${NPM_REGISTRY}' and use your ShapeDiver account!" >&2 && exit 1

cd "${1}"

# Backup package.json file
[ -f ${PKG_BAK_FILE} ] && echo "Error: Could not backup file '${PKG_FILE}' - file '${PKG_BAK_FILE}' already exists." >&2 && exit 1
cp ${PKG_FILE} ${PKG_BAK_FILE}

# Backup .npmrc file - special treatment since this might be a symlink
[ -f ${RC_BAK_FILE} ] && echo "Error: Could not backup file '${RC_FILE}' - file '${RC_BAK_FILE}' already exists." >&2 && exit 1
if [ -L ${RC_FILE} ]; then
  cp_symlink "${RC_FILE}" "${RC_BAK_FILE}"
elif [ -f "${RC_BAK_FILE}" ]; then
  cp ${RC_FILE} ${RC_BAK_FILE}
fi

################################################################################
# Publish to private Github registry.
#
# Credentials and the registry endpoint are defined via a .npmrc-file.
################################################################################
npm run build
npm publish

read -p "Press [Enter] key to resume ..."

################################################################################
# Publish to public NPM registry
#
# Credentials are provided via `npm login` (must be done prior to this script)
# and the registry endpoint is specified via CLI.
# Therefore, all other publish-configs must be removed temporarily.
################################################################################

# Remove .npmrc-config file
rm "${RC_FILE}"

# Remove the property "publishConfig" from package.json
node -pe "
json = JSON.parse(process.argv[1])
delete json.publishConfig
JSON.stringify(json, null, 2)
" "$(cat "${PKG_FILE}")" > "${PKG_FILE}"

npm run build

npm publish \
  --scope @shapediver \
  --access public \
  --registry "${NPM_REGISTRY}"
