import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { message, guestIds } = body;

    // Validate required fields
    if (!message || !guestIds || !Array.isArray(guestIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message and guest IDs are required',
      });
    }

    const client = await serverSupabaseClient(event);

    // Get guest phone numbers
    const { data: guests, error } = await client.from('guests').select('phone_number').in('id', guestIds);

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch guest data',
      });
    }

    if (!guests || guests.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No guests found',
      });
    }

    // Send SMS with Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const phoneNumbers = guests.map((g) => g.phone_number);
        const results = [];

        for (const phoneNumber of phoneNumbers) {
          try {
            const result = await twilio.messages.create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: phoneNumber,
            });
            results.push({ phoneNumber, success: true, sid: result.sid });
          } catch (smsError: any) {
            results.push({ phoneNumber, success: false, error: smsError.message });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;

        return {
          success: true,
          message: `SMS sent to ${successCount} guests${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
          results,
        };
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to send SMS messages',
        });
      }
    } else {
      // Twilio not configured, simulate success
      return {
        success: true,
        message: `SMS would be sent to ${guests.length} guests (Twilio not configured)`,
        results: guests.map((g) => ({ phoneNumber: g.phone_number, success: true, sid: 'simulated' })),
      };
    }
  } catch (error: any) {
    console.error('API Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
    });
  }
});
