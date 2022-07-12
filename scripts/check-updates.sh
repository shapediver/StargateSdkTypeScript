#!/usr/bin/env bash
#set -o xtrace

__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

function ncu() {
  command "${__dir}/../node_modules/.bin/ncu" "$@"
}

function check_update() {
  [ "${2}" = "update" ] && ncu --cwd "${1}"
  [ "${2}" = "upgrade" ] && ncu --cwd "${1}" --upgrade "${@:3}"
  [ "${2}" = "upgrade-all" ] && ncu --cwd "${1}" --upgrade
  return 0
}

# Validate arguments
if [ "${#}" -lt 1 ]; then
  echo "${0}: Specify a mode [update, upgrade, upgrade-all]" >&2
  exit 3
fi

case "${1}" in
"update" | "upgrade-all") ;;
"upgrade")
  if [ "${#}" -lt 2 ]; then
    printf "%s: Specify upgrade arguments\n" "${0}" >&2
    printf "\nExamples:\n\t-f \"<pkg1> <pkg2>\"\tupgrade specified package\n\t-x <pkg>\t\tupgrade everything except package\n" >&2
    exit 3
  fi
  ;;
*)
  echo "${1}: Mode not recognized"
  exit 1
  ;;
esac

# Check root dir
check_update "./" "${@}"

# Check all packages managed by lerna
for PKG in $(npx lerna ls --all | awk '{print $1}'); do
  PKG_PATH=$(npx lerna ls --all --parseable --scope "${PKG}")
  check_update "${PKG_PATH}" "${@}"
done
