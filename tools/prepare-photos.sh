#!/usr/bin/env bash
# prepare-photos.sh — optimize anniversary photos for the web.
# Originals in ~/Downloads are NEVER modified; everything is read-only from source.
#
#   thumbs/  -> ALL photos, 320px long-edge JPEG q70 (mosaic + curation contact sheets)
#   photos/  -> curated set only, 1600px long-edge JPEG q80 (see prepare-curated.sh)
#
# HEIC is transparently decoded by macOS `sips`.
set -euo pipefail

SRC="${1:-$HOME/Downloads/Fotos aniversario}"
OUT_THUMBS="${2:-public/thumbs}"
MANIFEST="${3:-tools/photo-index.tsv}"

mkdir -p "$OUT_THUMBS"
: > "$MANIFEST"

count=0
shopt -s nullglob nocaseglob
for f in "$SRC"/*.{heic,jpg,jpeg,png}; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  stem="${base%.*}"
  # sanitize: lowercase, keep alnum + dash, collapse the rest
  slug="$(printf '%s' "$stem" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9-' '-' | sed 's/-\{2,\}/-/g; s/^-//; s/-$//')"
  dest="$OUT_THUMBS/$slug.jpg"
  # avoid rare collisions
  if [ -e "$dest" ]; then slug="${slug}-$(printf '%04d' "$count")"; dest="$OUT_THUMBS/$slug.jpg"; fi
  sips -Z 320 -s format jpeg -s formatOptions 70 "$f" --out "$dest" >/dev/null 2>&1
  printf '%s\t%s\t%s\n' "$slug" "$base" "$f" >> "$MANIFEST"
  count=$((count+1))
  if (( count % 25 == 0 )); then echo "  ...$count thumbs"; fi
done
echo "DONE: $count thumbnails -> $OUT_THUMBS (manifest: $MANIFEST)"
