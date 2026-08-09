#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  push-vercel-env.sh — sube las env vars de .env.local a Vercel SIN imprimir
#  los valores. Idempotente (borra y re-agrega cada var).
#
#  Requisitos (una sola vez, interactivo, en TU terminal):
#     npx vercel login
#     npx vercel link          # asocia esta carpeta al proyecto de Vercel
#
#  Uso:
#     bash scripts/push-vercel-env.sh                 # production preview development
#     bash scripts/push-vercel-env.sh production      # sólo production
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE=".env.local"
VERCEL="npx --yes vercel"
TARGETS=("${@:-production preview development}")
# permite pasar "production" o varios; si no se pasa nada, los tres
if [ "$#" -gt 0 ]; then TARGETS=("$@"); else TARGETS=(production preview development); fi

# Variables a subir. OJO: NO subimos DEEPGRAM_ALLOW_RAW_KEY (en prod debe quedar
# sin setear / en 0: si vale 1 expone la key REAL de Deepgram al browser).
VARS=(KIMI_API_KEY DEEPGRAM_API_KEY KIMI_BASE_URL KIMI_MODEL MAX_USER_TURNS)

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }

read_val() {
  # imprime SOLO el valor de la var $1 en $ENV_FILE, sin comillas envolventes
  grep -E "^$1=" "$ENV_FILE" | head -1 \
    | sed -E "s/^$1=//; s/^\"(.*)\"$/\1/; s/^'(.*)'$/\1/"
}

for name in "${VARS[@]}"; do
  value="$(read_val "$name" || true)"
  if [ -z "${value:-}" ]; then
    echo "· $name: vacío en $ENV_FILE — lo salteo"
    continue
  fi
  for target in "${TARGETS[@]}"; do
    $VERCEL env rm "$name" "$target" -y >/dev/null 2>&1 || true
    printf '%s' "$value" | $VERCEL env add "$name" "$target" >/dev/null
    echo "✓ $name → $target"
  done
done

echo
echo "Listo. Verificá (sin ver valores) con:  npx vercel env ls"
echo "Redeploy para tomar los cambios:        npx vercel --prod"
