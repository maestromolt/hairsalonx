import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    const { to, template, data } = await request.json();

    if (!to || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';

    switch (template) {
      case 'signupConfirmation':
        subject = 'Welkom bij SalonBooker - Bevestig je account';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Welkom bij ${data.salonName || 'SalonBooker'}!</h2>
            <p>Beste ${data.email},</p>
            <p>Bedankt voor je registratie. Klik op de onderstaande knop om je account te bevestigen:</p>
            <a href="${data.confirmationUrl}" style="display: inline-block; background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Account bevestigen</a>
            <p>Of gebruik deze link: <a href="${data.confirmationUrl}">${data.confirmationUrl}</a></p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Deze link verloopt over 24 uur.</p>
          </div>
        `;
        break;

      case 'passwordReset':
        subject = 'Wachtwoord reset - SalonBooker';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Wachtwoord reset</h2>
            <p>Beste ${data.email},</p>
            <p>Je hebt een wachtwoord reset aangevraagd. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
            <a href="${data.resetUrl}" style="display: inline-block; background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Wachtwoord resetten</a>
            <p>Of gebruik deze link: <a href="${data.resetUrl}">${data.resetUrl}</a></p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Deze link verloopt over 1 uur.</p>
          </div>
        `;
        break;

      case 'bookingConfirmation':
        subject = 'Afspraak bevestigd - SalonBooker';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Je afspraak is bevestigd!</h2>
            <p>Beste ${data.customerName},</p>
            <p>Je afspraak bij <strong>${data.salonName}</strong> is bevestigd.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Datum:</strong> ${data.date}</p>
              <p><strong>Tijd:</strong> ${data.time}</p>
              <p><strong>Prijs:</strong> €${data.price}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Wil je je afspraak wijzigen of annuleren? Neem contact op met de salon.</p>
          </div>
        `;
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown template' },
          { status: 400 }
        );
    }

    const resend = getResend();
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@salonbooker.nl',
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: emailData?.id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
