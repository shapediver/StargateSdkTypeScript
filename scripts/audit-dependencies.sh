#!/usr/bin/env bash
#set -o xtrace
set -o errexit
set -o pipefail
set -o nounset

# This script scans all packages managed by lerna and fixes vulnerable dependencies.
#
# Usage:
#   ./audit-dependencies.sh

pkg_file="package.json"
pkg_bak_file="${pkg_file}.audit.bak"

# Path of repository's root directory
__rootdir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/../"

# Get the name of all components that are managed by lerna
lerna_components=$(npx lerna ls --all | awk '{print $1}')

cleanup() {
  # Remove all backup files of this script
  find "${__rootdir}" -type f -name "${pkg_bak_file}" -exec rm {} +
}
trap 'cleanup' ERR EXIT

audit() {
  local pkg_path=${1}

  pushd "${pkg_path}" > /dev/null

  # We have to make the following preparations before we can actually audit the specified package:
  #  * We have to manually remove all dependencies that are managed by lerna from package.json.
  #    Otherwise, non-released packages are gonna cause some problems.
  #  * The `npm audit` process works with the pkglock file.
  #    However, lerna does only update pkglock for special cases so we have to regenerate this file manually to ensure
  #    a complete dependency tree.

  # Create backup for package.json file
  cp "${pkg_file}" "${pkg_bak_file}"

  # Remove all lerna-managed components from package.json
  for cmp_name in ${lerna_components}; do
    # Replace '/' with '\/' - required by sed command
    cmp=${cmp_name//[\/]/\\/}

    sed -i "/\"${cmp}\":.*/d" "${pkg_file}"
  done

  # Creates or updates the pkglock file, without actually installing anything
  printf "\n> Running NPM install:\n"
  npm install --package-lock-only

  # Runs `audit fix` without modifying node_modules, but still updating the pkglock
  printf "\n> Running NPM audit:\n"
  npm audit fix --package-lock-only

  # Restore original package.json file
  \cp "${pkg_bak_file}" "${pkg_file}"

  popd > /dev/null
}

## Check all packages managed by lerna
for pkg in ${lerna_components}; do
  printf "\nProcessing package %s...\n" "${pkg}"
  pkg_path=$(npx lerna ls --all --parseable --scope "${pkg}")

  audit "${pkg_path}"
done

# Process root directory of this repository
echo "Processing root package"
audit "${__rootdir}"
