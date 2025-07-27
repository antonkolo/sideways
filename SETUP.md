# Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Twilio Configuration (Optional - for SMS functionality)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Database Setup

Create a `guests` table in your Supabase database with the following schema:

```sql
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  agreed_to_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on phone_number for faster lookups
CREATE INDEX idx_guests_phone_number ON guests(phone_number);
```

## Features Implemented

### 1. Guest Registration API (`/api/guests`)

- ✅ Checks if guest already exists
- ✅ Adds new guest to database
- ✅ Sends confirmation SMS with Twilio
- ✅ Returns success/error responses

### 2. Admin Dashboard (`/admin`)

- ✅ Displays guest list with stats
- ✅ SMS sending functionality to all guests
- ✅ Price estimation based on guest count
- ✅ Revenue breakdown calculator

### 3. Enhanced UI/UX

- ✅ Modern gradient background
- ✅ Improved form styling with icons
- ✅ Better responsive design
- ✅ Toast notifications for feedback
- ✅ Loading states and error handling

## Running the Application

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Set up environment variables (see above)

3. Run the development server:

   ```bash
   yarn dev
   ```

4. Access the application:
   - Main page: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

## SMS Functionality

The SMS functionality requires a Twilio account. If Twilio credentials are not provided, the application will simulate SMS sending for testing purposes.

To set up Twilio:

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Add these credentials to your `.env` file
