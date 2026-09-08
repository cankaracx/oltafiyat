#!/usr/bin/env bash
# Guards against the repo's two Next.js copies drifting apart again.
#
# This repo currently ships the same frontend from two locations
# (repo root `src/` and `web/src/`) because it has been re-pointed
# between Vercel Root Directory settings more than once. Until one
# copy is fully retired, both must stay byte-identical or the site
# that Vercel is *not* currently building from will silently rot.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! diff -rq src/app web/src/app > /tmp/frontend-sync.diff || \
   ! diff -rq src/lib web/src/lib >> /tmp/frontend-sync.diff || \
   ! diff -rq src/components web/src/components >> /tmp/frontend-sync.diff; then
  echo "src/ and web/src/ have drifted apart:"
  cat /tmp/frontend-sync.diff
  echo
  echo "Fix: copy the correct version over, e.g."
  echo "  cp -r web/src/app src/app && cp -r web/src/lib src/lib && cp -r web/src/components src/components"
  exit 1
fi

echo "src/ and web/src/ are in sync."
