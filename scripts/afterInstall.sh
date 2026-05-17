#!/bin/bash
# Patch the installed .desktop file to launch with --no-sandbox.
# This is required on systems where Chromium's SUID sandbox / user namespaces
# don't behave (common on Linux desktops where chrome-sandbox isn't trusted).
# Idempotent and path-agnostic: works regardless of productName or executable name.

set -e

DESKTOP_FILE=""
for candidate in /usr/share/applications/mdtxt.desktop /usr/share/applications/MDTXT.desktop; do
    if [ -f "$candidate" ]; then
        DESKTOP_FILE="$candidate"
        break
    fi
done

if [ -z "$DESKTOP_FILE" ]; then
    exit 0
fi

if grep -q -- '--no-sandbox' "$DESKTOP_FILE"; then
    exit 0
fi

sed -i 's|^\(Exec=[^ ]*\)\( .*\)\?$|\1 --no-sandbox\2|' "$DESKTOP_FILE" || true

exit 0
