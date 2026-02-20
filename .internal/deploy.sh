#!/bin/bash
#
# deploy.sh - Deploy AILP website to production server
#
# Usage:
#   ./deploy.sh [--dry-run] [--main] [--aria] [--demos]
#
# Options:
#   --dry-run   Show what would be deployed without actually deploying
#   --main      Deploy only main landing page
#   --aria      Deploy only Aria section
#   --demos     Deploy only demos section
#   (no args)   Deploy everything
#

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server configuration
SERVER="ai-liberation-platform.org"
REMOTE_ROOT="/var/www"

# Deployment options
DRY_RUN=""
DEPLOY_MAIN=false
DEPLOY_ARIA=false
DEPLOY_DEMOS=false

# Parse arguments
if [ $# -eq 0 ]; then
    # No args - deploy everything
    DEPLOY_MAIN=true
    DEPLOY_ARIA=true
    DEPLOY_DEMOS=true
else
    for arg in "$@"; do
        case $arg in
            --dry-run)
                DRY_RUN="--dry-run"
                echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
                ;;
            --main)
                DEPLOY_MAIN=true
                ;;
            --aria)
                DEPLOY_ARIA=true
                ;;
            --demos)
                DEPLOY_DEMOS=true
                ;;
            *)
                echo -e "${RED}Unknown option: $arg${NC}"
                echo "Usage: $0 [--dry-run] [--main] [--aria] [--demos]"
                exit 1
                ;;
        esac
    done
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  AILP Website Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Function to deploy a section
deploy_section() {
    local section=$1
    local source=$2
    local destination="${SERVER}:${REMOTE_ROOT}/${section}/"
    
    echo -e "${GREEN}📤 Deploying ${section}...${NC}"
    
    # Check if source exists
    if [ ! -d "$source" ]; then
        echo -e "${RED}✗ Source directory not found: $source${NC}"
        return 1
    fi
    
    # Display file count
    local file_count=$(find "$source" -type f | wc -l)
    echo -e "   ${file_count} files to sync"
    
    # Rsync command with progress
    rsync -avz --delete \
        --exclude='.git' \
        --exclude='.gitignore' \
        --exclude='.DS_Store' \
        --exclude='node_modules' \
        --exclude='*.log' \
        $DRY_RUN \
        "$source/" \
        "$destination"
    
    if [ $? -eq 0 ]; then
        if [ -z "$DRY_RUN" ]; then
            echo -e "${GREEN}✓ ${section} deployed successfully${NC}"
        else
            echo -e "${YELLOW}✓ ${section} would be deployed${NC}"
        fi
    else
        echo -e "${RED}✗ ${section} deployment failed${NC}"
        return 1
    fi
    echo ""
}

# Deploy main landing page
if [ "$DEPLOY_MAIN" = true ]; then
    # Main landing is just index.html
    if [ -f "index.html" ]; then
        echo -e "${GREEN}📤 Deploying main landing page...${NC}"
        rsync -avz $DRY_RUN index.html "${SERVER}:${REMOTE_ROOT}/main/"
        if [ $? -eq 0 ]; then
            if [ -z "$DRY_RUN" ]; then
                echo -e "${GREEN}✓ Main landing page deployed${NC}"
            else
                echo -e "${YELLOW}✓ Main landing page would be deployed${NC}"
            fi
        fi
        echo ""
    else
        echo -e "${RED}✗ index.html not found${NC}"
    fi
fi

# Deploy Aria section
if [ "$DEPLOY_ARIA" = true ]; then
    if [ -d "aria" ]; then
        deploy_section "aria" "aria"
    else
        echo -e "${RED}✗ aria/ directory not found${NC}"
    fi
fi

# Deploy demos section
if [ "$DEPLOY_DEMOS" = true ]; then
    if [ -d "demos" ]; then
        deploy_section "demos" "demos"
    else
        echo -e "${YELLOW}⚠ demos/ directory not found - skipping${NC}"
    fi
fi

# Summary
echo -e "${BLUE}════════════════════════════════════════${NC}"
if [ -z "$DRY_RUN" ]; then
    echo -e "${GREEN}✨ Deployment complete!${NC}"
    echo ""
    echo -e "Visit: ${BLUE}https://ai-liberation-platform.org${NC}"
else
    echo -e "${YELLOW}✨ Dry run complete!${NC}"
    echo -e "Run without ${YELLOW}--dry-run${NC} to actually deploy"
fi
echo -e "${BLUE}════════════════════════════════════════${NC}"
