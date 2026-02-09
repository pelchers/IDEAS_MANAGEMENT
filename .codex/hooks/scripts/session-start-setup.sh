#!/bin/bash
# Session start setup script
# Runs at the beginning of each Claude Code session
# Displays project info and performs environment checks

PROJECT_NAME="LinkWave"
PROJECT_ROOT="C:/coding/apps/wavz.fm"

echo ""
echo "🚀 Claude Code session started for $PROJECT_NAME"
echo "📁 Working directory: $(pwd)"
echo ""

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  echo "🌿 Current branch: $BRANCH"

  # Check for uncommitted changes
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    MODIFIED=$(git status --porcelain | wc -l)
    echo "📝 You have $MODIFIED uncommitted change(s)"
  fi
  echo ""
fi

# Check for common tools
echo "🔧 Development tools:"
[ -x "$(command -v node)" ] && echo "  ✓ Node.js $(node --version)"
[ -x "$(command -v npm)" ] && echo "  ✓ npm $(npm --version)"
[ -x "$(command -v npx)" ] && echo "  ✓ npx available"
[ -x "$(command -v prettier)" ] && echo "  ✓ Prettier available"
[ -x "$(command -v git)" ] && echo "  ✓ Git $(git --version | cut -d' ' -f3)"

# Project-specific checks
echo ""
if [ -f "package.json" ]; then
  echo "📦 Project: $(jq -r '.name' package.json 2>/dev/null || echo 'Unknown')"
fi

echo ""
echo "📚 Quick commands:"
echo "  /help - View custom commands"
echo "  npm run dev - Start development server"
echo "  npx convex dev - Start Convex backend"
echo ""
echo "📖 Project memory loaded from .claude/CLAUDE.md"
echo "📋 See .claude/settings.json for active hooks"
echo ""

