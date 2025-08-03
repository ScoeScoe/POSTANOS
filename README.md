# Postanos - Automated Postcard Concierge

> Never forget an important date again. Postanos automatically sends personalized postcards to your loved ones.

Postanos is a "set-and-forget" postcard service that allows users to add contacts and important dates, design personalized postcards using their own photos or AI-generated art, and schedule them for automatic printing and physical mailing.

## 🏗️ Tech Stack

- **Frontend:** Next.js 14+ (App Router, TypeScript, Tailwind CSS)
- **Deployment:** Cloudflare Pages
- **Database:** Cloudflare D1 (SQLite-compatible)
- **File Storage:** Cloudflare R2 (for user-uploaded images)
- **Authentication:** Clerk
- **Scheduled Jobs:** Cloudflare Cron Triggers invoking a Worker
- **Fulfillment API:** Lob (using their sandbox for development)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Clerk account
- Lob account (for postcard printing)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/postanos.git
cd postanos
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Lob API (Postcard Printing)
LOB_API_KEY=test_your_lob_api_key
LOB_SANDBOX_MODE=true

# Optional: Production configurations
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_live_key
# CLERK_SECRET_KEY=sk_live_your_live_key
# LOB_API_KEY=live_your_live_lob_key
# LOB_SANDBOX_MODE=false
```

### 3. Cloudflare Setup

#### Create Required Services

1. **Cloudflare Pages Project:**
   - Go to Cloudflare Dashboard → Pages → Create a project
   - Connect to your Git repository
   - Build command: `npm run build`
   - Build output directory: `.next`

2. **D1 Database:**
   - Go to Workers & Pages → D1 → Create database
   - Name: `postanos-prod`
   - Copy the Database ID for your `wrangler.toml`

3. **R2 Storage Bucket:**
   - Go to R2 Object Storage → Create bucket
   - Name: `postanos-images`

#### Configure Service Bindings

In your Pages project → Settings → Functions:

1. **D1 Database Binding:**
   - Variable name: `DB`
   - D1 database: `postanos-prod`

2. **R2 Bucket Binding:**
   - Variable name: `R2_IMAGES`
   - R2 bucket: `postanos-images`

3. **Environment Variables:**
   - `LOB_API_VERSION`: `2024-01-01`
   - `LOB_SANDBOX_MODE`: `true`

#### Update Configuration Files

1. Update `wrangler.toml` with your actual Database ID:
   ```toml
   database_id = "your-actual-d1-database-id"
   ```

2. Update `workers/cron/wrangler.toml` with the same Database ID.

### 4. Database Migration

Run the database migration to set up all required tables:

```bash
npm run db:migrate
```

For production deployment:
```bash
npm run db:migrate:prod
```

### 5. Deploy Worker

Deploy the postcard scheduler worker:

```bash
npm run worker:deploy
```

### 6. Configure Cron Trigger

In your Cloudflare Dashboard:
1. Go to your Pages project → Settings → Functions
2. Add a Cron Trigger:
   - Schedule: `0 9 * * *` (daily at 9 AM UTC)
   - Script: `postanos-scheduler`

### 7. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## 📁 Project Structure

```
postanos/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/             # Clerk sign-in page
│   │   └── sign-up/             # Clerk sign-up page
│   ├── api/                     # API routes
│   ├── dashboard/               # Main dashboard
│   └── layout.tsx               # Root layout with Clerk
├── components/                   # Reusable UI components
├── lib/
│   └── db/                      # Database utilities
│       ├── index.ts             # Typed D1 client
│       └── schema.sql           # Database schema
├── types/
│   └── database.ts              # TypeScript type definitions
├── workers/
│   └── cron/                    # Cloudflare Workers
│       ├── postcard-scheduler.ts # Main scheduler worker
│       └── wrangler.toml        # Worker configuration
├── scripts/
│   └── migrate.ts               # Database migration script
├── middleware.ts                # Clerk auth middleware
└── wrangler.toml               # Main Cloudflare configuration
```

## 🗄️ Database Schema

The application uses 5 main tables:

- **users** - User account information
- **contacts** - Postcard recipients  
- **occasions** - Important dates (birthdays, anniversaries, etc.)
- **templates** - Postcard designs and messages
- **jobs** - Scheduled postcard sending tasks

## 🔧 API Integration

### Lob API (Postcard Printing)

Postanos integrates with Lob's API for:
- Address verification
- Postcard creation and printing
- Delivery tracking

The integration automatically:
1. Verifies recipient addresses
2. Creates postcards with custom designs
3. Tracks delivery status
4. Updates job statuses in the database

### Clerk Authentication

User authentication is handled by Clerk with:
- Email/password sign-up
- Social logins (Google, GitHub, etc.)
- User management
- Session handling

## 🤖 AI Features

Postanos includes AI-powered features for:
- **Message Generation:** GPT-4 helps craft personalized messages
- **Art Creation:** DALL-E generates custom postcard artwork
- **Style Templates:** Pre-configured AI styles for different occasions

## 📅 Scheduling System

The Cloudflare Worker runs daily to:
1. Query pending postcard jobs
2. Process jobs that should be sent today
3. Verify addresses with Lob
4. Create and send postcards
5. Update job statuses
6. Send notifications to users

## 🚀 Deployment

### Development
```bash
npm run dev
npm run worker:dev  # For testing worker locally
```

### Production
```bash
npm run build
npm run worker:deploy
wrangler pages deploy
```

## 🔒 Security

- All routes protected by Clerk authentication
- Environment variables for sensitive data
- CORS properly configured
- Rate limiting on API endpoints

## 📝 Environment Variables

### Required for Local Development

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Lob API
LOB_API_KEY=test_...
LOB_SANDBOX_MODE=true
```

### Optional Environment Variables

```env
# Production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production Lob
LOB_API_KEY=live_...
LOB_SANDBOX_MODE=false

# Optional: Notification services
ONESIGNAL_APP_ID=...
ONESIGNAL_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check our [docs/](docs/) directory
- **Issues:** Open an issue on GitHub
- **Discussions:** Join our GitHub Discussions

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] International postcard support
- [ ] Bulk import from contact services
- [ ] Advanced AI customization
- [ ] Calendar integration
- [ ] Team/family accounts

---

**Built with ❤️ by the Postanos team**