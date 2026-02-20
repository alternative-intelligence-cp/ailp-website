# AI Liberation Platform - Website Source

This repository contains the source code for ai-liberation-platform.org, including the main landing page, Aria programming language documentation, and educational demos.

## 🌐 Site Structure

```
ai-liberation-platform.org/
├── /                             Main landing page
├── /aria/                        Aria programming language
│   ├── index.html                Aria overview & features
│   └── docs/                     Complete programming guide (350+ pages)
│       ├── types/                Type system documentation
│       ├── control_flow/         Loops, conditionals, etc.
│       ├── functions/            Functions & generics
│       ├── memory_model/         Ownership & borrowing
│       ├── modules/              Module system
│       ├── stdlib/               Standard library reference
│       └── ...
└── /demos/                       Interactive educational tools
    ├── memory-allocator/         Memory management visualization
    ├── johnny5-consciousness/    AI consciousness exploration
    ├── git-visualizer/           Git commit tree visualization
    └── ...
```

## 🚀 Quick Start

### Local Development

```bash
# Serve locally with Python
python3 -m http.server 8000
# Visit http://localhost:8000

# Or open directly in browser
firefox index.html
```

### Deployment

Use the deployment script to push changes to production:

```bash
# Dry run (see what would be deployed)
.internal/deploy.sh --dry-run

# Deploy everything
.internal/deploy.sh

# Deploy specific sections
.internal/deploy.sh --main      # Just the landing page
.internal/deploy.sh --aria      # Just Aria documentation
.internal/deploy.sh --demos     # Just the demos
```

The script uses rsync to sync files to ai-liberation-platform.org:/var/www/

## 📝 Updating Aria Documentation

The Aria documentation is generated from markdown files in the aria-lang repository:

```bash
# 1. Update markdown guides in aria_ecosystem/programming_guide/
cd /path/to/aria/aria_ecosystem/programming_guide

# 2. Regenerate HTML
./md2html.py --all

# 3. Copy to website repo
cp -r html/* /path/to/ailp-website/aria/docs/

# 4. Deploy
cd /path/to/ailp-website
.internal/deploy.sh --aria
```

## 🎨 Design Philosophy

### Main Site
- Clean, modern gradient design
- Clear navigation between sections  
- Responsive (mobile-friendly)
- Fast loading (minimal dependencies)

### Aria Documentation
- Dark theme (developer-friendly)
- Sidebar navigation (easy browsing)
- Syntax highlighting
- Breadcrumb navigation
- Search-friendly structure

### Demos
- **Visual**: Abstract concepts made concrete
- **Interactive**: Hands-on exploration
- **Progressive**: Simple → complex
- **Vanilla web**: No build steps, no frameworks

## 📂 Repository Organization

```
ailp-website/
├── index.html                Main landing page
├── aria/                     Aria language section
│   ├── index.html            Aria overview
│   └── docs/                 Generated documentation (350+ HTML pages)
├── demos/                    Educational demonstrations
├── .internal/                Internal utilities
│   ├── deploy.sh             Deployment script
│   └── sync_git.sh           Git sync utility
└── README.md                 This file
```

## 🔧 Technical Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework)
- **Server**: Apache on Ubuntu
- **Deployment**: rsync over SSH
- **Version Control**: Git
- **Documentation**: Generated from Markdown

### Why Vanilla?

1. **Simplicity**: View source = see everything
2. **Performance**: No framework overhead
3. **Longevity**: No dependency rot
4. **Learning**: Easy to understand and modify

## 🛠️ Utilities

### deploy.sh
Deployment automation with rsync. Supports:
- Dry-run mode (test before deploying)
- Selective deployment (main/aria/demos)
- Progress reporting
- Error handling

### sync_git.sh  
Git synchronization with merge conflict detection. Handles:
- Pull latest changes
- Auto-add/commit/push
- Merge conflict resolution prompts

## 📊 Current Status (February 2026)

| Section | Status | Pages | Last Update |
|---------|--------|-------|-------------|
| Main Landing | ✅ Ready | 1 | Feb 15, 2026 |
| Aria Overview | ✅ Ready | 1 | Feb 15, 2026 |
| Aria Docs | ✅ Ready | 352 | Feb 15, 2026 |
| Demos | 🔄 TBD | ~7 | Previous |

## 📜 License

MIT - Use freely, learn freely, share freely.

## 🤝 Contributing

1. Keep it simple (vanilla web tech preferred)
2. Test locally before deploying
3. Use dry-run mode first
4. Document your changes
5. Follow existing code style

## 📞 Contact

For questions or issues, visit https://ai-liberation-platform.org
