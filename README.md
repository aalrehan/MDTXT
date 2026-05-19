# MDTXT

**A minimalist desktop file browser for Linux — browse folders and preview `.md` and `.txt` files side-by-side.**

MDTXT is a frameless, dark-themed desktop application built with Electron and React. Open any folder, navigate its contents in a sidebar, and instantly preview Markdown or plain text files in a clean reading pane. Fully offline, no accounts, no API keys.

## Features

- **Folder browser** — pick any directory and see all `.md` and `.txt` files in a sidebar with recursive scanning
- **GFM Markdown rendering** — full GitHub-Flavored Markdown support (tables, task lists, strikethrough, autolinks)
- **Syntax highlighting** — code blocks highlighted with highlight.js across dozens of languages
- **Plain text viewer** — `.txt` files displayed with line numbers
- **Zoom in/out** — scale the preview pane for comfortable reading
- **Keyboard navigation** — browse files with arrow keys and Enter
- **Frameless dark UI** — custom title bar with minimize, maximize, and close controls
- **Toast notifications** — unobtrusive feedback messages
- **Fully offline** — no network access, no telemetry, no env vars or API keys required

## Download & Install (Linux)

**[⬇ Download latest release](https://github.com/aalrehan/MDTXT/releases/latest)**

### Option 1 — `.deb` package (Ubuntu / Debian)

```bash
sudo dpkg -i mdtxt_1.1.0_amd64.deb
```

Launch from your app menu or run `mdtxt` in the terminal.

### Option 2 — `.AppImage` (any Linux distro)

```bash
chmod +x MDTXT-1.1.0.AppImage
./MDTXT-1.1.0.AppImage
```

## Development Setup

**Requirements:** Node.js 18+, npm

```bash
git clone https://github.com/aalrehan/MDTXT.git
cd MDTXT
npm install
npm run dev
```

> **Note:** The dev script sets `NO_SANDBOX=1` to bypass the Chromium sandbox, which is required on systems where `chrome-sandbox` is not SUID root. This is already configured in `package.json` — no manual steps needed.

## Building

Build distributable packages for Linux:

```bash
npm run build:linux
```

This runs `electron-vite build` followed by `electron-builder --linux`. Output (`.deb` and `.AppImage`) is written to the `dist/` directory.

## Architecture

```
src/
├── main/              Electron main process — window management, IPC handlers, file system access
│   └── index.js       Main entry: BrowserWindow, IPC channel registration
├── preload/           Context bridge — exposes IPC channels to the renderer
│   └── index.js       Defines window.api (dialog, fs, window controls)
└── renderer/          React frontend
    ├── App.jsx        Root component, routing between empty state and file view
    ├── main.jsx       React entry point
    ├── index.html     HTML shell
    ├── components/
    │   ├── MainLayout.jsx        Top-level layout with sidebar + preview
    │   ├── Sidebar.jsx           Folder tree with recursive file listing
    │   ├── FileItem.jsx          Individual file entry in the sidebar
    │   ├── PreviewPane.jsx       File content viewer (delegates to MD or TXT)
    │   ├── MarkdownRenderer.jsx  react-markdown with remark-gfm + rehype-highlight
    │   ├── PlainTextViewer.jsx   Monospace text display with line numbers
    │   ├── TitleBar.jsx          Frameless window title bar with controls
    │   ├── EmptyState.jsx        Prompt shown when no folder is open
    │   └── Toast.jsx             Animated notification component
    ├── context/
    │   └── AppContext.jsx        Global state: selected file, folder path, zoom level
    └── assets/
        └── main.css              Tailwind directives + custom styles
scripts/
└── afterInstall.sh    Post-install script for .deb — patches --no-sandbox into desktop entry
```

### IPC Channels

The main and renderer processes communicate through these IPC channels:

| Channel | Direction | Description |
|---|---|---|
| `dialog:openFolder` | Renderer → Main | Opens a native folder picker dialog |
| `fs:scanFolder` | Renderer → Main | Recursively scans a directory for `.md`/`.txt` files |
| `fs:readFile` | Renderer → Main | Reads a file's contents from disk |
| `window:minimize` | Renderer → Main | Minimizes the window |
| `window:maximize` | Renderer → Main | Toggles maximize/restore |
| `window:close` | Renderer → Main | Closes the window |

## Tech Stack

- **Electron 30** — desktop runtime
- **React 18** — UI framework
- **Tailwind CSS 3** — utility-first styling
- **electron-vite** — Vite-powered build tooling for Electron
- **electron-builder** — packaging and distribution
- **react-markdown + remark-gfm** — Markdown parsing and rendering
- **rehype-highlight + highlight.js** — code block syntax highlighting
- **Framer Motion** — animations and transitions
- **Lucide React** — icon set

## Known Limitations & Ideas

- Linux only (no macOS or Windows builds)
- No search/filter for large file lists
- No folder tree — files are displayed in a flat list
- No light theme
- No TypeScript
- No file watching (auto-reload on external changes)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

[ISC](https://opensource.org/licenses/ISC)
