# Namecheap Domain → GitHub Pages Setup Guide

## Step 1: Deploy to GitHub Pages

1. **Create GitHub Repository:**
   - Go to github.com and create new repository
   - Name it: `homeliberation-winnipeg` (or any name)
   - Make it **Public** (required for free GitHub Pages)

2. **Upload Your Files:**
   ```bash
   cd C:\Users\Owner\Desktop\VelocityRealEstate
   git init
   git add .
   git commit -m "Initial commit - Home Liberation website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/homeliberation-winnipeg.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Click Save
   - Your site will be live at: `https://YOUR_USERNAME.github.io/homeliberation-winnipeg/`

---

## Step 2: Connect Namecheap Domain to GitHub Pages

### A. Add Custom Domain to GitHub Pages

1. Go to your GitHub repository → Settings → Pages
2. Under "Custom domain", enter your domain: `yourdomain.com`
3. Click Save
4. Check "Enforce HTTPS" (wait a few minutes for SSL certificate)

### B. Configure Namecheap DNS Records

**You need to add these DNS records in Namecheap:**

1. **Login to Namecheap:**
   - Go to namecheap.com → Account → Domain List
   - Click "Manage" next to your domain

2. **Go to Advanced DNS Tab**

3. **Delete Existing Records:**
   - Remove any default A Records or CNAME Records for `@` and `www`

4. **Add These 4 A Records (for root domain):**

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A Record | @ | 185.199.108.153 | Automatic |
   | A Record | @ | 185.199.109.153 | Automatic |
   | A Record | @ | 185.199.110.153 | Automatic |
   | A Record | @ | 185.199.111.153 | Automatic |

5. **Add CNAME Record (for www subdomain):**

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | CNAME Record | www | YOUR_USERNAME.github.io | Automatic |

**Example if your GitHub username is "johndoe" and repo is "homeliberation-winnipeg":**
- CNAME Host: `www`
- CNAME Value: `johndoe.github.io`

---

## Step 3: Verify Domain Connection

1. **Wait 10-60 minutes** for DNS propagation
2. **Check DNS Status:**
   - Go to https://dnschecker.org
   - Enter your domain
   - Verify A records point to GitHub IPs

3. **Test Your Site:**
   - Visit `http://yourdomain.com` (should redirect to HTTPS)
   - Visit `https://www.yourdomain.com` (should work)
   - Both should show your Home Liberation website

---

## Step 4: Enable HTTPS (SSL Certificate)

1. In GitHub Pages settings, check "Enforce HTTPS"
2. GitHub automatically provides free SSL certificate via Let's Encrypt
3. Wait 5-10 minutes for certificate to activate
4. Your site will now use `https://yourdomain.com`

---

## TXT Record Verification (If Required)

**Some domain registrars require TXT record verification. If GitHub Pages asks for verification:**

1. GitHub will show you a TXT record like:
   ```
   _github-pages-challenge-YOUR_USERNAME.yourdomain.com
   ```

2. **Add to Namecheap Advanced DNS:**

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | TXT Record | _github-pages-challenge-YOUR_USERNAME | (the code GitHub provides) | Automatic |

3. Wait 10 minutes and click "Verify" in GitHub Pages settings

---

## Quick Copy-Paste DNS Settings

**For Namecheap Advanced DNS, add exactly these records:**

```
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic

Type: CNAME Record
Host: www
Value: YOUR_GITHUB_USERNAME.github.io
TTL: Automatic
```

---

## Troubleshooting

### Domain Not Working After 1 Hour?

1. **Check DNS Propagation:**
   - Go to https://dnschecker.org
   - Enter your domain
   - Verify A records show GitHub IPs (185.199.108-111.153)

2. **Check GitHub Pages Custom Domain:**
   - Settings → Pages → Custom domain should show your domain
   - Green checkmark = working
   - Red X = DNS not configured correctly

3. **Check CNAME File in Repo:**
   - GitHub automatically creates a `CNAME` file in your repo
   - It should contain just your domain: `yourdomain.com`
   - If missing, create it manually

4. **HTTPS Not Working?**
   - Wait 10-15 minutes after DNS propagates
   - Uncheck "Enforce HTTPS", save, wait 2 minutes
   - Re-check "Enforce HTTPS", save
   - GitHub will retry SSL certificate provisioning

### Common Errors:

**"Domain's DNS record could not be retrieved"**
- Your DNS hasn't propagated yet. Wait 30-60 minutes.

**"CNAME already exists"**
- Your domain is already connected to another GitHub Pages site
- Remove custom domain from other repo first

**"Improper configuration"**
- Check A records are exactly the 4 GitHub IPs
- Check CNAME record points to `username.github.io` (not full repo URL)

---

## Alternative: Use Namecheap BasicDNS

If you want Namecheap to handle all DNS:

1. **Namecheap Dashboard → Domain List → Manage**
2. **Nameservers:** Select "Namecheap BasicDNS"
3. **Advanced DNS Tab → Add Records (same as above)**

This is the easiest method and what most people use.

---

## Final Checklist

- [ ] GitHub repository created and files pushed
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Custom domain added in GitHub Pages settings
- [ ] 4 A Records added in Namecheap DNS
- [ ] 1 CNAME Record added in Namecheap DNS (www → username.github.io)
- [ ] Waited 30-60 minutes for DNS propagation
- [ ] HTTPS enforced in GitHub Pages
- [ ] Site loads at `https://yourdomain.com`
- [ ] Site loads at `https://www.yourdomain.com`

---

## Next Steps After Domain Connection

1. **Update Formspree Email Forms:**
   - Go to formspree.io and create account
   - Create forms for contact.html, calculator.html, buyers-list.html
   - Replace `YOUR_FORM_ID` with real Formspree endpoint IDs

2. **Test All Pages:**
   - Click every button and link
   - Submit test forms
   - Verify mobile responsiveness

3. **Set Up Google Analytics:**
   - Add tracking code to all HTML pages
   - Track visitor behavior and conversions

4. **Set Up Google My Business:**
   - Claim "Home Liberation Winnipeg" listing
   - Link to your website

5. **Start SEO & Marketing:**
   - Post on Kijiji Winnipeg ("We Buy Houses")
   - Post on Facebook Marketplace
   - Join local real estate investor groups

---

## Support

**GitHub Pages Docs:**
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

**Namecheap DNS Docs:**
https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/

**Need Help?**
- GitHub Pages support: docs.github.com/support
- Namecheap support: support.namecheap.com
