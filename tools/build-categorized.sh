#!/usr/bin/env bash
# build-categorized.sh — process the reorganized event folders into web assets.
# Originals in ~/Downloads are NEVER modified.
#
#   public/thumbs/<cat>/<slug>.jpg  -> 480px long-edge q72 (grids)
#   public/photos/<cat>/<slug>.jpg  -> 1280px long-edge q76 (featured/lightbox)
#   tools/categorized-index.tsv     -> cat<TAB>slug<TAB>original
#
# HEIC decoded transparently by macOS `sips`.
# NOTE: macOS bash 3.2 — no `set -u` (empty arrays), no fancy iconv (NFD names).
set -eo pipefail

SRC="$HOME/Downloads/Fotos aniversario"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THUMBS="$ROOT/public/thumbs"
FULLS="$ROOT/public/photos"
MANIFEST="$ROOT/tools/categorized-index.tsv"

mkdir -p "$THUMBS" "$FULLS"
: > "$MANIFEST"

slugify() {
  # utf-8-mac handles NFD (decomposed) filenames like "año". iconv may exit 1
  # with a warning while still emitting usable output — ignore its exit code.
  local s
  s="$(printf '%s' "$1" | iconv -f utf-8-mac -t ascii//TRANSLIT 2>/dev/null || true)"
  [ -z "$s" ] && s="$1"
  printf '%s' "$s" | LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C tr -c 'a-z0-9-' '-' \
    | sed 's/-\{2,\}/-/g; s/^-//; s/-$//'
}

total=0
shopt -s nullglob nocaseglob
for dir in "$SRC"/*/; do
  catname="$(basename "$dir")"
  cat="$(slugify "$catname")"
  files=()
  for f in "$dir"*.heic "$dir"*.jpg "$dir"*.jpeg "$dir"*.png; do files+=("$f"); done
  if [ "${#files[@]:-0}" = "0" ]; then continue; fi
  mkdir -p "$THUMBS/$cat" "$FULLS/$cat"
  n=0
  for f in "${files[@]}"; do
    base="$(basename "$f")"
    slug="$(slugify "${base%.*}")"
    [ -z "$slug" ] && slug="foto"
    # resume-friendly: skip work already done, but still record it in the manifest
    if [ -e "$THUMBS/$cat/$slug.jpg" ] && [ -e "$FULLS/$cat/$slug.jpg" ]; then
      printf '%s\t%s\t%s\n' "$cat" "$slug" "$base" >> "$MANIFEST"
      n=$((n+1)); total=$((total+1)); continue
    fi
    sips -Z 480 -s format jpeg -s formatOptions 72 "$f" --out "$THUMBS/$cat/$slug.jpg" >/dev/null 2>&1
    sips -Z 1280 -s format jpeg -s formatOptions 76 "$f" --out "$FULLS/$cat/$slug.jpg" >/dev/null 2>&1
    printf '%s\t%s\t%s\n' "$cat" "$slug" "$base" >> "$MANIFEST"
    n=$((n+1)); total=$((total+1))
    if (( total % 50 == 0 )); then echo "  ...$total processed"; fi
  done
  echo "$cat: $n"
done
echo "DONE: $total photos"
