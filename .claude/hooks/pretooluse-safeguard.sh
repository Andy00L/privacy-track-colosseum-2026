#!/bin/bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"command"\s*:\s*"//;s/"$//' 2>/dev/null || echo "")

if [[ -z "$CMD" ]]; then
  echo '{"result":"allow"}'
  exit 0
fi

# Patterns dangereux
if echo "$CMD" | grep -qiE '(rm\s+-rf\s+[/~]|git\s+push\s+--force|git\s+reset\s+--hard|chmod\s+777|>\s*/dev/sd|mkfs\.|dd\s+if=)'; then
  echo '{"result":"deny","reason":"Commande bloquée par safeguard"}'
  exit 0
fi

# Accès Windows filesystem
if echo "$CMD" | grep -qE '/mnt/[a-z]/'; then
  echo '{"result":"deny","reason":"Accès Windows filesystem bloqué"}'
  exit 0
fi

echo '{"result":"allow"}'
exit 0
