#!/bin/sh

set -eu

db_path="${SQLITE_DB_PATH:-prisma/dev.db}"
mkdir -p "$(dirname "$db_path")"
sqlite3 "$db_path" < scripts/init-db.sql
