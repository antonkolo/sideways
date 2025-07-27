# Sideways

A modern event management application built with Nuxt 3, featuring guest registration, SMS notifications, and admin dashboard functionality.

## Features

- ✅ **Guest Registration**: Collect guest information with phone number validation
- ✅ **SMS Notifications**: Send confirmation SMS using Twilio
- ✅ **Admin Dashboard**: Manage guests and send bulk SMS messages
- ✅ **Revenue Calculator**: Estimate revenue based on guest count and pricing
- ✅ **Modern UI**: Beautiful, responsive design with Nuxt UI components

## Quick Start

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Set up environment variables** (see [SETUP.md](./SETUP.md) for detailed instructions):

   ```bash
   # Required
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # Optional (for SMS functionality)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

3. **Set up database** (see [SETUP.md](./SETUP.md) for SQL schema)

4. **Run development server**:

   ```bash
   yarn dev
   ```

5. **Access the application**:
   - Main page: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

## Tech Stack

- **Framework**: Nuxt 3
- **UI Components**: Nuxt UI
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **SMS Service**: Twilio
- **Icons**: Heroicons

## Project Structure

```
app/
├── pages/
│   ├── index.vue          # Guest registration form
│   └── admin.vue          # Admin dashboard
├── server/api/
│   ├── guests.post.ts     # Guest registration API
│   └── admin/
│       └── send-sms.post.ts # Bulk SMS API
└── app.config.ts          # Nuxt UI configuration
```

## Security Notes

- Environment variables are properly secured and not exposed to client-side
- Supabase handles authentication and data access securely
- SMS functionality gracefully degrades when Twilio is not configured

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
