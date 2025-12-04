# Yi Yi Band Website

A Next.js website for managing band shows and content with a simple admin interface for non-technical users.

## Features

- **Public Website**: Clean, modern design showcasing upcoming and past shows
- **Admin Interface**: Simple form-based interface for managing shows
- **File-based Content**: Shows stored as markdown files (no database required)
- **Password Protected**: Secure admin area with JWT authentication
- **Vercel Ready**: Optimized for easy deployment

## Getting Started

### Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your settings:
   ```
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-jwt-secret
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the website
7. Go to [http://localhost:3000/admin](http://localhost:3000/admin) to manage content

### Content Management

**For Non-Technical Users:**

1. Go to `yoursite.com/admin`
2. Login with the admin password
3. Add, edit, or delete shows using the simple forms
4. Changes are saved immediately

**Content Structure:**
- Shows are stored in `content/shows/` as `.mdx` files
- Each show includes: title, date, venue, location, ticket URL, and description
- Pages are stored in `content/pages/` (currently just the About page)

### Deployment on Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/yiyi-site.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables:
     - `ADMIN_PASSWORD`: Your secure admin password
     - `JWT_SECRET`: A secure random string for JWT tokens

3. **Custom Domain (Optional):**
   - In Vercel dashboard: Settings → Domains
   - Add your custom domain

### Security

- Change the default admin password in production
- Use a strong JWT secret
- Admin area is protected by password + JWT tokens
- Tokens expire after 24 hours

### File Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── shows/page.tsx        # Shows listing
│   │   ├── about/page.tsx        # About page
│   │   ├── admin/                # Admin interface
│   │   └── api/                  # API routes
│   └── lib/
│       └── content.ts            # Content utilities
├── content/
│   ├── shows/                    # Show files (.mdx)
│   └── pages/                    # Page content
├── public/                       # Static assets
└── vercel.json                   # Vercel config
```

### Customization

**Styling:**
- Uses Tailwind CSS
- Colors and fonts can be customized in `tailwind.config.js`
- Main brand color is currently white/black theme

**Content:**
- Edit `content/pages/about.mdx` for the about page
- Shows are automatically managed through the admin interface

**Features to Add:**
- Photo galleries
- Music streaming integration
- Mailing list signup
- Social media links

### Support

Default admin password: `admin123` (change this!)

For issues or questions, check the GitHub repository or create an issue.