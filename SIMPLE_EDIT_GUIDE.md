# SIMPLE VISUAL CODING GUIDE - Working Right Now

## YOUR CURRENT WORKING SETUP

✅ **Server Running:** http://localhost:8000
✅ **All Files Ready:** C:\Users\Owner\Desktop\VelocityRealEstate
✅ **Browser Ready:** Any browser works

---

## METHOD 1: SPLIT SCREEN (Works Now - No Install Needed)

### Step-by-Step:

1. **Open Browser:**
   - Already running: http://localhost:8000
   - If not open, run: `WORKING_SOLUTION_NOW.bat`

2. **Open Text Editor:**
   - **Simplest:** Right-click `index.html` → Open with → Notepad
   - **Better:** Notepad++ (if installed)
   - **Best:** VS Code (download from link that opened)

3. **Arrange Windows Side-by-Side:**
   - Browser window: Press `Win + Left Arrow` (snaps to left half of screen)
   - Editor window: Press `Win + Right Arrow` (snaps to right half of screen)

4. **Edit and View:**
   - Edit code in editor (right side)
   - Save file: `Ctrl + S`
   - Refresh browser: `F5` (left side)
   - See your changes!

---

## METHOD 2: VS CODE WITH LIVE PREVIEW (Recommended - Requires Install)

### If VS Code is Already Installed:
- Double-click: `LAUNCH_VISUAL_CODING.bat`
- Press `Ctrl+K` then `V` in VS Code for live preview
- Changes show INSTANTLY (no manual refresh!)

### If VS Code is NOT Installed:
1. Download opened automatically: https://code.visualstudio.com/download
2. Install VS Code (5 minutes)
3. Run: `LAUNCH_VISUAL_CODING.bat`
4. Get instant live preview!

---

## CURRENT FILES YOU CAN EDIT

**Main Pages:**
- `index.html` - Homepage
- `contact.html` - Contact form page
- `about.html` - About us page
- `foreclosure.html` - Foreclosure situation page
- `landlord.html` - Landlord situation page
- `inherited.html` - Inherited property page
- `questions.html` - FAQ page

**All Pages Available:**
```
index.html
contact.html
about.html
services.html
foreclosure.html
landlord.html
inherited.html
repairs.html
relocation.html
divorce.html
probate.html
downsizing.html
questions.html
admin-dashboard.html
```

---

## QUICK EDITS YOU CAN MAKE NOW

### Example 1: Change Homepage Headline

1. Open `index.html` in Notepad
2. Find (around line 401):
   ```html
   <h1 class="hero-title">We Buy Houses in Winnipeg</h1>
   ```
3. Change to:
   ```html
   <h1 class="hero-title">Your New Headline Here</h1>
   ```
4. Save (`Ctrl+S`)
5. Refresh browser (`F5`)
6. See the change!

### Example 2: Change Button Color

1. Open any HTML file
2. Find the `<style>` section (usually near top)
3. Find `.cta-button` or `.primary-button`
4. Change `background-color` value
5. Save and refresh

### Example 3: Add New Text

1. Find where you want to add text
2. Add a new line:
   ```html
   <p>Your new text here</p>
   ```
3. Save and refresh

---

## KEYBOARD SHORTCUTS

**Windows Snap:**
- `Win + Left Arrow` - Snap window to left half
- `Win + Right Arrow` - Snap window to right half

**Browser:**
- `F5` - Refresh page
- `Ctrl + F5` - Hard refresh (clears cache)
- `F12` - Open developer tools

**Text Editor:**
- `Ctrl + S` - Save file
- `Ctrl + F` - Find text
- `Ctrl + H` - Find and replace
- `Ctrl + Z` - Undo
- `Ctrl + Y` - Redo

---

## TROUBLESHOOTING

### Changes Not Showing?
1. Make sure you saved the file (`Ctrl+S`)
2. Hard refresh browser (`Ctrl+F5`)
3. Check you edited the correct file
4. Clear browser cache

### Server Not Running?
```batch
cd C:\Users\Owner\Desktop\VelocityRealEstate
npx http-server -p 8000
```

### Port Already in Use?
```batch
# Use different port
npx http-server -p 8001
# Then visit http://localhost:8001
```

---

## RECOMMENDED WORKFLOW

### Current Setup (Works Now):
```
┌─────────────────────────────────────────┐
│         YOUR DESKTOP                    │
├────────────────────┬────────────────────┤
│                    │                    │
│   TEXT EDITOR      │   BROWSER          │
│   (Notepad/etc)    │   localhost:8000   │
│                    │                    │
│   Edit HTML/CSS    │   View Website     │
│   Save (Ctrl+S)    │   Refresh (F5)     │
│                    │                    │
└────────────────────┴────────────────────┘
```

### Upgraded Setup (After Installing VS Code):
```
┌─────────────────────────────────────────┐
│         VS CODE WINDOW                  │
├──────────────────┬──────────────────────┤
│                  │                      │
│  CODE EDITOR     │   LIVE PREVIEW       │
│  (Edit files)    │   (Auto-updates)     │
│                  │                      │
│  Type changes    │   See instantly      │
│  Auto-save       │   No refresh needed  │
│                  │                      │
└──────────────────┴──────────────────────┘
```

---

## WHAT TO DO RIGHT NOW

✅ **Option A - Start Coding Now (Simple):**
1. Run `WORKING_SOLUTION_NOW.bat`
2. Browser opens at http://localhost:8000
3. Right-click `index.html` → Open with Notepad
4. Snap browser left, editor right (`Win+Arrow`)
5. Edit, save, refresh!

✅ **Option B - Get Better Setup (5 min wait):**
1. Download VS Code (link opened automatically)
2. Install VS Code
3. Run `LAUNCH_VISUAL_CODING.bat`
4. Press `Ctrl+K V` for instant live preview
5. Edit and see changes INSTANTLY!

---

## CURRENT STATUS

- ✅ Server running on http://localhost:8000
- ✅ All files ready to edit
- ✅ Browser can view site
- ✅ Text editor can edit files
- ✅ VS Code workspace configured (ready when you install)
- ✅ Launch scripts created

**You can start editing RIGHT NOW with Notepad + Browser!**
**Or install VS Code for the better experience.**

---

**Files Created:**
- `WORKING_SOLUTION_NOW.bat` - One-click start
- `LAUNCH_VISUAL_CODING.bat` - VS Code launcher (when installed)
- `.vscode/settings.json` - VS Code workspace settings
- `.vscode/extensions.json` - Recommended extensions

**Next:** Choose your path and start coding!
