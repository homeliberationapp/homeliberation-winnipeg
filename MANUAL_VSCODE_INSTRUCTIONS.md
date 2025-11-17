# OPEN PROJECT IN VS CODE - Manual Instructions

## VS CODE IS INSTALLED BUT NOT IN PATH

Since VS Code isn't accessible from command line, open it manually:

---

## METHOD 1: Right-Click in Explorer (EASIEST)

1. ✅ **Project folder is now open in Explorer**
2. **Right-click** on empty space in the folder
3. Select **"Open with Code"**
4. VS Code opens with your project!

---

## METHOD 2: Open VS Code First

1. Press **Windows key**
2. Type: **"Visual Studio Code"** or **"Code"**
3. Click to open VS Code
4. In VS Code:
   - Click **File → Open Folder**
   - Navigate to: `C:\Users\Owner\Desktop\VelocityRealEstate`
   - Click **Select Folder**

---

## ONCE VS CODE IS OPEN:

### Install Live Preview Extension:

1. Click the **Extensions** icon (left sidebar, looks like 4 squares)
2. Search for: **"Live Preview"**
3. Find **"Live Preview"** by Microsoft
4. Click **Install**

### Open Live Preview:

**Option A - Keyboard Shortcut:**
1. Open `index.html` (click it in file explorer on left)
2. Press: **Ctrl+K** then **V**
   (Hold Ctrl, press K, release both, press V)
3. Live preview opens on right side!

**Option B - Right-Click:**
1. In VS Code file explorer (left side)
2. Right-click `index.html`
3. Select **"Show Preview"** or **"Open with Live Server"**

---

## SPLIT SCREEN LAYOUT:

Once Live Preview is open, you'll see:

```
┌─────────────────────────────────────────┐
│         VS CODE WINDOW                  │
├──────────────────┬──────────────────────┤
│                  │                      │
│  FILE EXPLORER   │   CODE EDITOR        │
│  (Far Left)      │   (Center)           │
│                  │                      │
│  index.html      │   <html>             │
│  contact.html    │     <head>           │
│  about.html      │       ...            │
│  ...             │     </head>          │
│                  │     <body>           │
├──────────────────┼──────────────────────┤
│                  │   LIVE PREVIEW       │
│                  │   (Right Side)       │
│                  │                      │
│                  │   [Website Display]  │
│                  │                      │
└──────────────────┴──────────────────────┘
```

---

## HOW TO USE:

1. **Edit code** in the center panel
2. **Save file** (Ctrl+S or auto-save after 1 second)
3. **See changes INSTANTLY** in live preview (right)
4. **Click elements** in preview to jump to code
5. **Toggle mobile view** (device icon in preview toolbar)

---

## USEFUL VS CODE SHORTCUTS:

- `Ctrl+K V` - Open live preview
- `Ctrl+B` - Toggle file explorer sidebar
- `Ctrl+P` - Quick open file
- `Ctrl+Shift+P` - Command palette
- `Ctrl+/` - Comment/uncomment line
- `Alt+Up/Down` - Move line up/down
- `Ctrl+D` - Select next occurrence
- `F2` - Rename symbol

---

## TROUBLESHOOTING:

### Live Preview Extension Not Working?
1. Make sure you installed "Live Preview" by Microsoft
2. Try alternative: Install **"Live Server"** by Ritwick Dey
3. Right-click index.html → "Open with Live Server"

### Changes Not Showing?
- Auto-save is enabled (1 second delay)
- Or press Ctrl+S to save manually
- Live preview updates automatically on save

### Can't See Live Preview?
- Make sure you opened a file first (index.html)
- Then press Ctrl+K V
- Or use menu: View → Command Palette → Type "Live Preview: Show Preview"

---

## CURRENT STATUS:

✅ Project folder opened in Explorer
✅ Server running at http://localhost:8000 (backup option)
✅ VS Code workspace configured (.vscode/settings.json)
✅ All HTML files ready to edit

---

## BACKUP METHOD (If VS Code issues):

If VS Code isn't working, you can still code visually:

1. **Browser:** http://localhost:8000 (already running)
2. **Editor:** Right-click any HTML file → Open with → Notepad++
3. **Split screen:** Win+Left (browser), Win+Right (editor)
4. **Workflow:** Edit, save (Ctrl+S), refresh browser (F5)

---

**Next:**
- Open VS Code using Method 1 or 2 above
- Install Live Preview extension
- Press Ctrl+K V to start visual coding!
