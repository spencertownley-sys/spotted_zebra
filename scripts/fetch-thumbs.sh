#!/usr/bin/env bash
# Downloads a YouTube thumbnail for every video id in _data/videos.yml into
# assets/img/thumbs/<id>.jpg, so the site never calls i.ytimg.com when a page loads.
# Re-run this after adding a video, then commit the new images.
set -euo pipefail
cd "$(dirname "$0")/.."
out=assets/img/thumbs
mkdir -p "$out"
grep -oE '\{ id: [^,]+' _data/videos.yml | sed 's/{ id: //' | while read -r id; do
  [ -s "$out/$id.jpg" ] && continue
  echo "fetching $id"
  curl -fsSL "https://i.ytimg.com/vi/$id/hqdefault.jpg" -o "$out/$id.jpg" || { echo "failed: $id" >&2; rm -f "$out/$id.jpg"; }
done
