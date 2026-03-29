#!/bin/bash
# adr-structure-check.sh — SessionStart
# Validates ADR folder structure
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
if [ -d "$REPO_ROOT/.adr" ]; then
  MISSING=""
  [ ! -d "$REPO_ROOT/.adr/orchestration" ] && MISSING="$MISSING orchestration/"
  [ ! -d "$REPO_ROOT/.adr/current" ] && MISSING="$MISSING current/"
  [ ! -d "$REPO_ROOT/.adr/history" ] && MISSING="$MISSING history/"
  if [ -n "$MISSING" ]; then
    echo "WARNING: ADR structure incomplete. Missing:$MISSING"
    echo "Run adr-setup to fix."
  fi
fi
exit 0
