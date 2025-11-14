# FIX OAUTH REDIRECT URI - 2 MINUTE TASK

## PROBLEM:
Google OAuth error: `redirect_uri_mismatch`

The OAuth client needs the redirect URI `http://localhost:3030/auth/google/callback` added to authorized URIs.

---

## SOLUTION (2 minutes):

### Step 1: Edit OAuth Client
Browser just opened to:
https://console.cloud.google.com/apis/credentials/oauthclient/209564491215-queop3jk8ofbt9177etdit6rek7nh8oi.apps.googleusercontent.com

If it didn't open, click the link above.

### Step 2: Add Redirect URI
1. Scroll to **"Authorized redirect URIs"** section
2. Click **"+ ADD URI"**
3. Paste this exact URI:
   ```
   http://localhost:3030/auth/google/callback
   ```
4. Click **"SAVE"** at the bottom

### Step 3: Run OAuth Script Again
```bash
cd C:\Users\Owner\Desktop\VelocityRealEstate
node create-google-form-manual.js
```

### Step 4: Complete Authorization
1. Browser will open to Google sign-in
2. Sign in with: homeliberationapp@gmail.com
3. Click **"Allow"** for all permissions
4. You'll be redirected to localhost:3030 (success page)
5. Script will automatically create the Google Form

### Step 5: Get Embed Code
After success, you'll see:
```
✅ GOOGLE FORM CREATED SUCCESSFULLY!

📝 Form Details:
   Embed URL: https://docs.google.com/forms/d/e/[FORM_ID]/viewform?embedded=true
```

Copy the Embed URL.

---

## WHAT'S ALREADY CONFIGURED:

✅ Google Cloud Project exists
✅ OAuth Client ID created
✅ Client ID and Secret in .env file
✅ APIs enabled (Forms, Drive, Sheets)
✅ OAuth consent screen configured

❌ Missing ONLY: localhost:3030 redirect URI

---

## AFTER FORM CREATION:

### Add to contact.html:
```html
<iframe
    src="[PASTE_EMBED_URL_HERE]"
    width="100%"
    height="2800"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    style="border-radius: 8px;">
    Loading…
</iframe>
```

### Commit and Push:
```bash
git add contact.html google-form-info.json
git commit -m "Add Google Form embed to contact page"
git push
```

---

## CURRENT STATUS:

- ✅ Page editor created (EDIT_PAGE_CONTENT.js)
- ✅ Form options improved (detailed house condition)
- ✅ OAuth script ready (create-google-form-manual.js)
- ⏳ Waiting for redirect URI fix
- ⏳ Then run OAuth flow
- ⏳ Then embed form
- ⏳ Then commit and deploy

**Time to complete: ~5 minutes total**
