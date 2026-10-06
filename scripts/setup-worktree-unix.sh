#!/usr/bin/env bash
set -euo pipefail

# Cursor sets ROOT_WORKTREE_PATH. Worktrunk sets it in .config/wt.toml.
: "${ROOT_WORKTREE_PATH:?ROOT_WORKTREE_PATH is not set}"

echo "Setting up worktree..."
echo "Base worktree: $ROOT_WORKTREE_PATH"
echo "Target worktree: $(pwd)"

copy_from_base() {
    local file="$1"
    local source="$ROOT_WORKTREE_PATH/$file"

    if [[ ! -f "$source" ]]; then
        echo "ERROR: File does not exist in base worktree: $source" >&2
        exit 1
    fi

    echo "Copying $file"
    mkdir -p "$(dirname "$file")"
    cp "$source" "$file"
}

# -------------------- Customize this section to your needs --------------------

copy_from_base ".npmrc"
copy_from_base ".atlassianrc"
copy_from_base "packages/sdk.stargate-cli/.memory.json"

npm run init
npm run build

# ---------------------------- End of customization ----------------------------

echo "Worktree setup complete."
