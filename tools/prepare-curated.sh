#!/usr/bin/env bash
# prepare-curated.sh — render the curated slugs at 1600px q80 into public/photos.
# Reads tools/curated-slugs.txt (from gen-manifest.mjs) and maps each slug back to
# its original via tools/photo-index.tsv. Originals are read-only.
set -euo pipefail

SLUGS="tools/curated-slugs.txt"
INDEX="tools/photo-index.tsv"
OUT="public/photos"
mkdir -p "$OUT"

n=0
while IFS= read -r slug; do
  [ -z "$slug" ] && continue
  # find original path for this slug (column 1 == slug, column 3 == path)
  src="$(awk -F'\t' -v s="$slug" '$1==s {print $3; exit}' "$INDEX")"
  if [ -z "$src" ] || [ ! -e "$src" ]; then echo "  ⚠ no source for $slug"; continue; fi
  sips -Z 1600 -s format jpeg -s formatOptions 80 "$src" --out "$OUT/$slug.jpg" >/dev/null 2>&1
  n=$((n+1))
done < "$SLUGS"
echo "DONE: $n full-size photos -> $OUT"
