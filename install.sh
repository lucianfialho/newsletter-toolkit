#!/usr/bin/env bash
set -e

INSTALL_DIR="${1:-$HOME/.claude-plugins/newsletter-toolkit}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}newsletter-toolkit — installer${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is required but not installed."
  echo "Install from https://nodejs.org (v18 or higher)"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js 18+ required (found $(node -v))"
  exit 1
fi

# Check git
if ! command -v git &>/dev/null; then
  echo "Error: git is required but not installed."
  exit 1
fi

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Updating existing installation at $INSTALL_DIR..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  echo "Installing to $INSTALL_DIR..."
  git clone https://github.com/lucianfialho/newsletter-toolkit "$INSTALL_DIR"
fi

# Install MCP server dependencies
echo ""
echo "Installing MCP server dependencies..."
cd "$INSTALL_DIR/servers/mcp-server" && npm install --silent
cd - > /dev/null

echo ""
echo -e "${GREEN}Done!${RESET}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Start ${CYAN}Claude Code${RESET} with the plugin:"
echo ""
echo -e "  ${YELLOW}claude --plugin-dir $INSTALL_DIR${RESET}"
echo ""
echo "On first run you'll be prompted to configure:"
echo "  • Serper API key  (get free key at https://serper.dev)"
echo "  • Newsletter RSS feed URL"
echo "  • CMS settings (Strapi, WordPress, or none)"
echo ""
echo "Then validate your setup with:"
echo -e "  ${YELLOW}/newsletter-toolkit:setup${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
