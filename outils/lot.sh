#!/bin/zsh
# Inventaire et identité d'un lot de maquettes, 4 en parallèle : outils/lot.sh <depot> [...]
cd "$(dirname $0)/.."
mkdir -p inventaire/brut
printf '%s\n' "$@" | xargs -P 4 -n 1 zsh -c 'd=$1; node outils/identite.mjs $d > /dev/null 2>&1; node outils/inventaire.mjs $d > inventaire/brut/log-$d.txt 2>&1 && echo "fini $d" || echo "ÉCHEC $d"' _
