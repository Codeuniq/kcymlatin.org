#!/bin/sh
# Embeds the poster artwork as a data URI so the canvas can be exported
# without a web server. Re-run this whenever the artwork changes.
#   ./make-template.sh template.png
set -e
SRC="${1:-template.png}"
TYPE=$(file --mime-type -b "$SRC")
{
  printf 'const TEMPLATE_DATA_URL = "data:%s;base64,' "$TYPE"
  base64 < "$SRC" | tr -d '\n'
  printf '";\n'
} > template.js
echo "template.js written from $SRC ($TYPE, $(wc -c < template.js) bytes)"
