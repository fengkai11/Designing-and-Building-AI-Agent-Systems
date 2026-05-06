#!/usr/bin/env bash
set -euo pipefail

MDBOOK_BIN="${MDBOOK_BIN:-mdbook}"
if ! command -v "$MDBOOK_BIN" >/dev/null 2>&1; then
  if [ -x "$HOME/.cargo/bin/mdbook" ]; then
    MDBOOK_BIN="$HOME/.cargo/bin/mdbook"
  else
  echo "mdbook not found. Install with: cargo install mdbook"
  exit 1
  fi
fi

"$MDBOOK_BIN" serve --open
