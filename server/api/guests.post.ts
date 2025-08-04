import { serverSupabaseServiceRole } from '#supabase/server';

interface Database {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string;
          phone_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          created_at?: string;
        };
      };
    };
  };
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { phoneNumber } = body;

    const client = serverSupabaseServiceRole<Database>(event);

    // Check if guest already exists
    const { data: existingGuest, error: checkError } = await client
      .from('guests')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (checkError) {
      console.error('Failed to check for existing guest:', checkError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check for existing guest',
      });
    }

    if (existingGuest) {
      return {
        success: false,
        message: 'Guest already exists',
      };
    }

    // Add new guest to database
    const guestData = {
      phone_number: phoneNumber,
    };

    const { data: newGuest, error } = await client.from('guests').insert(guestData).select().single();

    if (error) {
      console.error('Failed to save guest data:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save guest data',
      });
    }

    // Send confirmation SMS with Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        await twilio.messages.create({
          body: `Thank you for signing up for Sideways events! We'll keep you updated on upcoming events.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });
      } catch (smsError) {
        // Don't fail the entire request if SMS fails
      }
    } else {
    }

    return {
      success: true,
      message: 'Guest information saved successfully',
      guest: newGuest,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
    });
  }
});
