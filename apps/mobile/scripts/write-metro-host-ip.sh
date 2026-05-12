#!/usr/bin/env bash
# Writes this Mac's LAN IP into ios/Kompanionki/ip.txt so physical devices load JS from Metro on port 9087.
# Requires iPhone and Mac on the same Wi‑Fi (or VPN). USB alone does not forward Metro unless you use iproxy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/ios/Kompanionki/ip.txt"
for iface in en0 en1 en2; do
  IP=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
  if [[ -n "${IP:-}" ]]; then
    printf '%s\n' "$IP" >"$OUT"
    echo "[write-metro-host-ip] $IP → $OUT"
    exit 0
  fi
done
printf '%s\n' "127.0.0.1" >"$OUT"
echo "[write-metro-host-ip] warning: no LAN IP found; wrote 127.0.0.1 (device builds need Wi‑Fi + rerun this script)" >&2
