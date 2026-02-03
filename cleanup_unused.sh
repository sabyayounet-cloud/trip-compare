#!/bin/bash
# Cleanup script for TripCompare project

echo "🧹 Cleaning up unused files and directories..."

# Remove old backend directory (replaced by api/)
if [ -d "backend" ]; then
    echo "  ✓ Removing old backend/ directory"
    rm -rf backend/
fi

# Remove standalone index.html (using React frontend instead)
if [ -f "index.html" ]; then
    echo "  ✓ Removing standalone index.html"
    rm -f index.html
fi

# Remove Python cache files
echo "  ✓ Removing Python cache files"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# Remove macOS files
echo "  ✓ Removing .DS_Store files"
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove node_modules cache (will be reinstalled on deployment)
# Keeping it for local development

# Remove database journal files
if [ -f "tripcompare.db-journal" ]; then
    echo "  ✓ Removing database journal"
    rm -f tripcompare.db-journal
fi

# Remove log files (will be regenerated)
if [ -d "logs" ]; then
    echo "  ✓ Clearing old logs"
    rm -rf logs/
fi

# Remove virtual environment from root (using .venv)
if [ -d "venv" ]; then
    echo "  ✓ Removing old venv"
    rm -rf venv/
fi

echo "✅ Cleanup complete!"
echo ""
echo "Removed:"
echo "  - Old backend/ directory"
echo "  - Standalone index.html"
echo "  - Python cache files"
echo "  - .DS_Store files"
echo "  - Database journals"
echo "  - Old virtual environments"
