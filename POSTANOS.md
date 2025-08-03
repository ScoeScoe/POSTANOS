# Postanos - Automated Postcard Concierge Service

## Overview
A web-only "set-and-forget" postcard concierge that remembers important dates, sends timely reminders, and physically mails personalized cards (with future gift capabilities) through print-and-mail APIs.

---

## 1. Core Product Flows (MVP)

| Flow | User Experience | Technical Implementation |
|------|-----------------|-------------------------|
| **Account Setup** | Sign-up → Add contacts + dates (CSV/manual import) | Store in `users`, `contacts`, `occasions` tables (Cloudflare D1/KV) |
| **Template Creation** | Upload photo or choose AI art → Select message tone | OpenAI DALL-E for art, GPT-4o for message generation |
| **Scheduling** | Toggle auto-send or manual approval | Cloudflare Cron Triggers create scheduled jobs |
| **Notifications** | Web push + optional SMS reminders | WebPush API (PWA) + Twilio/MessageBird |
| **Fulfillment** | Card arrives on/before date | Lob/PostGrid API for printing & mailing |
| **Dashboard** | Track past/future sends & delivery status | Pull status from vendor API |

---

## 2. Print & Mail API Vendors

### Recommended: **Lob** (Primary)
- **Pros**: Mature REST API, address verification, USPS + international, scheduled send
- **Cons**: US-centric, volume tiers
- **Pricing**: ~$0.87 per 4×6 postcard + postage

### Backup Options:
- **PostGrid**: Simple auth, Canadian support, pay-as-you-go
- **Handwrytten**: Robot-handwritten cards (novelty factor)
- **PostcardMania**: Zapier integration, marketing focus

---

## 3. Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js + Tailwind on Cloudflare Pages | Fast, SEO-friendly, supports Server Components |
| **Authentication** | Cloudflare Turnstile + Clerk/Supabase Auth | Minimal friction, social login optional |
| **Database** | Cloudflare D1 (SQLite) + R2 for photos | Zero-maintenance, integrated with Pages |
| **Job Scheduling** | Cloudflare Cron Triggers → Worker queues | Native to Cloudflare, serverless execution |
| **AI Services** | OpenAI (primary), Anthropic/Gemini (variety) | Rate-limited API wrapper |
| **Notifications** | Web Push + OneSignal SDK, Twilio SMS | Platform-agnostic approach |
| **Payments** | Stripe Checkout | Handles tax, Apple/Google Pay |
| **Development** | Cursor AI + Miniflare for Workers | Tight iteration cycle |

---

## 4. Data Model

```sql
-- Core tables structure
users(id, email, phone_opt_in, stripe_customer_id, created_at)
contacts(id, user_id, full_name, address_json, created_at)
occasions(id, contact_id, label, date, lead_days, auto_send)
templates(id, user_id, occasion_label, front_image_url, message_txt, ai_style_json)
jobs(id, occasion_id, send_date, status, lob_id)
```

---

## 5. MVP Development Timeline

| Week | Deliverables |
|------|-------------|
| **Week 1** | Repository setup, authentication, CRUD for contacts/occasions |
| **Week 2** | Template builder UI, DALL-E art integration, GPT message drafting |
| **Week 3** | Cloudflare Cron implementation, Lob sandbox integration |
| **Week 4** | Push/SMS notifications, dashboard, Stripe payment integration |
| **Week 5** | Production deployment, beta user onboarding |
| **Week 6** | Rush delivery option, gift API research |

---

## 6. Key Technical Considerations

### Critical Features
1. **Address Verification** - Use Lob's verify endpoint before sending
2. **Lead-Time Calculation** - Auto-calculate USPS delivery times with buffer
3. **Image Processing** - Generate 300 DPI PDF/PNG server-side for Lob
4. **Security** - Virus scan & EXIF strip user uploads
5. **Privacy** - Purge photos after print, store only asset IDs
6. **Content Moderation** - Apply AI content filters for safety
7. **Cost Management** - ~$1.20/domestic postcard, implement credit system
8. **International Support** - $1.38 postage surcharge for international

---

## 7. Immediate Next Steps

1. **API Setup**: Create Lob sandbox account and obtain API keys
2. **Infrastructure**: Initialize Cloudflare Pages project
   ```bash
   npx wrangler pages project create postanos
   ```
3. **Testing**: Run sandbox print job with sample images
4. **Pricing Strategy**: Define credit tiers (e.g., 5 credits = $10, Unlimited = $12/mo + postage)
5. **Worker Script**: Implement core functionality:
   - Pull tomorrow's scheduled jobs
   - Render PDF via HTML-to-PDF
   - Call Lob API with test flag

---

## 8. Revenue Model

### Pricing Options
- **Pay-as-you-go**: $2-3 per postcard (includes all costs)
- **Credit Bundles**: 5 for $10, 10 for $18, etc.
- **Subscription**: $12/month unlimited cards + postage
- **Premium Features**: Rush delivery, international, gifts

### Cost Breakdown
- Base postcard cost: ~$0.87
- Postage (domestic): ~$0.33
- AI generation: ~$0.05
- Platform margin: ~$0.75-1.75

---

## 9. Future Enhancements

- **Gift Integration**: Partner with gift delivery APIs
- **Business Accounts**: Team management, bulk sending
- **Mobile App**: Native iOS/Android for photo capture
- **Advanced AI**: Voice-to-card, style learning
- **Analytics**: Engagement tracking, delivery insights