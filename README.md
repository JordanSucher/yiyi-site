# Yi Yi Website - Self-Hosted CMS Setup

This site uses **Decap CMS** (formerly Netlify CMS), a free, open-source content management system that stores content in Git.

## What Your Client Gets

- Go to `yoursite.com/admin` 
- Edit text content in a clean interface
- Add/edit/delete shows
- Changes save automatically
- No coding required

## Setup Options

### Option 1: GitHub + Netlify (Free, Recommended)

**Step 1: Push to GitHub**
```bash
# Create a new repo on github.com
# Then in your terminal:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yiyi-website.git
git push -u origin main
```

**Step 2: Deploy to Netlify**
1. Go to netlify.com (free account)
2. "Add new site" → "Import an existing project"
3. Connect to GitHub, select your repo
4. Deploy!

**Step 3: Enable Decap CMS**
1. In Netlify dashboard: Site Settings → Identity → Enable Identity
2. Settings → Identity → Registration → Invite only
3. Settings → Identity → Services → Enable Git Gateway
4. Identity tab → Invite users → Add your client's email
5. They'll get an email to set up their account
6. Done! They can now go to `yoursite.com/admin`

**Custom domain**: Netlify makes this easy in Settings → Domain management

---

### Option 2: Self-Host on Your Own Server

If you want full control and want to host it yourself:

**Requirements:**
- A server (VPS like DigitalOcean, AWS, etc.)
- Node.js installed
- Git installed

**Step 1: Set up the server**
```bash
# Install Node.js and nginx
sudo apt update
sudo apt install nodejs npm nginx git

# Clone your repo
cd /var/www
git clone https://github.com/yourusername/yiyi-website.git
cd yiyi-website
```

**Step 2: Set up nginx**
Create `/etc/nginx/sites-available/yiyi`:
```nginx
server {
    listen 80;
    server_name yoursite.com;
    root /var/www/yiyi-website;
    index index-dynamic.html;

    location / {
        try_files $uri $uri/ /index-dynamic.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/yiyi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 3: Set up Git-based authentication**

For self-hosted, you need to set up a Git backend. Two options:

**Option A: Use Netlify Identity (easier)**
- Still use Netlify's free Identity service for auth
- Your site is self-hosted, but auth goes through Netlify
- Update `admin/config.yml`:
```yaml
backend:
  name: git-gateway
  branch: main
```

**Option B: Use GitHub OAuth (more complex but fully self-hosted)**
- Set up GitHub OAuth app
- Run a small authentication server
- More technical but completely independent

---

### Option 3: Static CMS (Simpler Alternative)

If Git feels too complex, use **TinaCMS** or **Forestry** instead:
- Visual editing directly on the page
- Saves to markdown files
- Can still self-host
- Better UI for non-technical users

Let me know if you want me to set this up instead!

---

## File Structure

```
yiyi-website/
├── index-dynamic.html          # Main site (loads content from JSON)
├── admin/
│   ├── index.html             # CMS admin interface
│   └── config.yml             # CMS configuration
├── content/
│   ├── homepage.json          # Editable homepage text
│   └── shows/                 # Individual show files
│       ├── 2024-12-14-owl.json
│       ├── 2025-01-08-bohemia.json
│       └── 2025-02-02-pioneer.json
└── images/                    # Uploaded images go here
```

## What Your Client Can Edit

✅ Hero title and description
✅ About section text
✅ Contact email
✅ Add/edit/remove shows (date, venue, location)
❌ Cannot break the site design (it's locked)

## Alternative: Even Simpler Options

If this still feels too technical:

1. **Cloudflare Pages + Decap**: Same as Netlify but with Cloudflare
2. **Vercel + Decap**: Another free hosting option
3. **Jekyll + Forestry.io**: Different tech stack, arguably better UI
4. **WordPress**: If you just want the easiest option (but requires PHP/MySQL)

## My Recommendation

For a band website where they just need to update shows and text:
- **Use Netlify + Decap CMS** (Option 1)
- It's free, reliable, and they have good support
- 5-minute setup, no server maintenance
- Your client gets a clean admin interface

Want me to walk you through the Netlify setup?
